import React from 'react';
import {
  object, bool, string, array, func,
} from 'prop-types';
import cn from 'classnames';

import getDownloadUrl from '../../../../helpers/getDownloadUrl';
import { downloadFile } from '../../../../helpers/fileDownloader';

import ProgressBar from '../../../ProgressBar';
import * as utils from '../../../../shared/utils';
import picsioConfig from '../../../../../../../config';
import Logger from '../../../../services/Logger';
import Placeholder from '../Placeholder';
import Marker from '../Marker';
import ToolbarPreviewLeft from '../../../toolbars/ToolbarPreviewLeft';
import Pages from '../Multipage/Pages';

import Controls from './Controls';
import { SCALE_VALUES, LOCAL_STORAGE_FIELD_NAME } from './ScaleSelect';

import { LOCAL_STORAGE_FIELD_NAME as SPREAD_FIELD } from './SpreadSelect';

import './styles.scss';

const Spread = ({ children }) => <div className="spread">{children}</div>;
const EmptyWrapper = ({ children }) => <>{children}</>;

class Pdf extends React.Component {
  DEFAULT_SCALE_VALUE = utils.LocalStorage.get(LOCAL_STORAGE_FIELD_NAME) || SCALE_VALUES.auto;

  isMounted = true;

  isMainApp = picsioConfig.isMainApp();

  viewerContainer = React.createRef();

  viewerContainerDiff = React.createRef();

  markersContainer = React.createRef();

  state = {
    assetId: null,
    pages: [],
    currentPage: 1,
    spreadMode: 0,
    showOutline:
      utils.getCookie('picsio.multipagePanelOpened') === null
        ? true
        : utils.getCookie('picsio.multipagePanelOpened'),
    revisionID: null,
    diffID: null,
    progress: 0,
    diffProgress: null,
    diffPages: null,
    error: null,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.asset._id !== state.assetId || props.revisionID !== state.revisionID) {
      return {
        progress: 0,
        assetId: props.asset._id,
        revisionID: props.revisionID,
      };
    }
    if (props.diffID !== state.diffID) {
      return {
        diffID: props.diffID,
        diffPages: props.diffID ? state.diffPages : null,
      };
    }
    return null;
  }

  async componentDidMount() {
    try {
      await this.loadPdfJs();
    } catch (error) {
      this.setState({
        error: 'Can not initialize PDF Viewer',
        progress: null,
      });
    }

    document.addEventListener('keypress', this.listenToFind);

    this.eventBus = new pdfjsViewer.EventBus();
    this.linkService = new pdfjsViewer.PDFLinkService({ eventBus: this.eventBus });
    this.findController = new pdfjsViewer.PDFFindController({
      eventBus: this.eventBus,
      linkService: this.linkService,
    });
    this.prepareFile(this.props.asset, this.props.revisionID);
    window.addEventListener('revision:added', this.onAddRevision, false);
    if (this.props.diffAsset) this.prepareDiff(this.props.diffAsset);
  }

  componentDidUpdate(prevProps, prevState) {
    const { state, props } = this;
    if (prevState.assetId !== state.assetId || prevState.revisionID !== state.revisionID) {
      this.prepareFile(this.props.asset, this.props.revisionID);
    }
    if (state.diffID && prevState.diffID !== state.diffID) {
      this.prepareDiff(props.asset, state.diffID);
    }
    if (props.listenToClick) {
      document.addEventListener('mousedown', this.setMarker);
    } else {
      document.removeEventListener('mousedown', this.setMarker);
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
    window.removeEventListener('revision:added', this.onAddRevision, false);
    document.removeEventListener('keypress', this.listenToFind);
    this.removeViewerListeners();
  }

  /**
   * Mouse down on tmp marker
   * @param {MouseEvent} event
   * @param {Number} index
   */
  onMarkerMouseDown(event, index, pageNumber) {
    event.stopPropagation();

    const { tmpMarkers, modifyTmpMarkers } = this.props;
    const marker = tmpMarkers[index];
    const $pages = this.markersContainer.current.querySelectorAll('.markersForPage');
    const $page = $pages[pageNumber - 1];
    if (!$page) return;

    if (marker) {
      const mousemoveHandler = (e) => {
        e.stopPropagation();
        const clientX = e.pageX;
        const clientY = e.pageY;
        const rect = $page.getBoundingClientRect();

        /* if pointer outside the image - do nothing */
        if (
          !(
            clientX > rect.left
            && clientX < rect.left + rect.width
            && clientY > rect.top
            && clientY < rect.top + rect.height
          )
        ) {
          return;
        }

        const left = (clientX - rect.left) / rect.width;
        const top = (clientY - rect.top) / rect.height;

        // if rectangle selection - move 2 points
        if (marker.x2 !== undefined && marker.y2 !== undefined) {
          // handle x and x2
          const newX2 = marker.x2 + left - marker.x;
          if (newX2 <= 1) {
            marker.x = left;
            marker.x2 = newX2;
          } else {
            marker.x = left + 1 - newX2;
            marker.x2 = 1;
          }

          // handle y and y2
          const newY2 = marker.y2 + top - marker.y;
          if (newY2 <= 1) {
            marker.y2 = newY2;
            marker.y = top;
          } else {
            marker.y = top + 1 - newY2;
            marker.y2 = 1;
          }
        } else {
          // if single marker
          marker.x = left;
          marker.y = top;
        }

        modifyTmpMarkers(tmpMarkers);
      };
      const mouseupHandler = () => {
        document.removeEventListener('mousemove', mousemoveHandler);
        document.removeEventListener('mouseup', mouseupHandler);
      };

      document.addEventListener('mousemove', mousemoveHandler);
      document.addEventListener('mouseup', mouseupHandler);
    }
  }

  /**
   * Mouse down on tmp marker resize
   * @param {MouseEvent} event
   * @param {Number} index
   */
  onMarkerMouseDownResize = (event, index, pageNumber) => {
    event.preventDefault();
    event.stopPropagation();

    const { tmpMarkers } = this.props;
    const marker = tmpMarkers[index];
    const $pages = this.markersContainer.current.querySelectorAll('.markersForPage');
    const $page = $pages[pageNumber - 1];
    if (!$page) return;

    if (marker) {
      const mousemoveHandler = (e) => {
        e.stopPropagation();
        const clientX = e.pageX;
        const clientY = e.pageY;
        const rect = $page.getBoundingClientRect();

        /* if pointer outside the image - do nothing */
        if (
          !(
            clientX > rect.left
            && clientX < rect.left + rect.width
            && clientY > rect.top
            && clientY < rect.top + rect.height
          )
        ) {
          return;
        }

        const left = (clientX - rect.left) / rect.width;
        const top = (clientY - rect.top) / rect.height;

        marker.x2 = marker.x > left ? marker.x : left;
        marker.y2 = marker.y > top ? marker.y : top;

        this.props.modifyTmpMarkers(tmpMarkers);
      };
      const mouseupHandler = () => {
        document.removeEventListener('mousemove', mousemoveHandler);
        document.removeEventListener('mouseup', mouseupHandler);
      };

      document.addEventListener('mousemove', mousemoveHandler);
      document.addEventListener('mouseup', mouseupHandler);
    }
  };

  listenToFind = (event) => {
    const keyF = 102;
    const { key, keyCode } = event;
    const { activeElement } = document;
    const isSomeInputFocused = activeElement
      && (activeElement.contentEditable === 'true'
        || ['INPUT', 'TEXTAREA'].includes(activeElement.nodeName.toUpperCase()));

    if (!isSomeInputFocused && (key === 'f' || keyCode === keyF)) {
      /** Press "f" key -> focus search input */
      const $input = document.querySelector('#pdfSearch');
      if ($input) $input.focus();
    }
  };

  addViewerListeners = () => {
    if (this.eventBus) {
      this.eventBus.on('pagechanging', this.setCurrentPage);
      this.eventBus.on('pagesloaded', this.updateMarkersPages);
      this.eventBus.on('scalechanging', this.updateMarkersPages);
      this.eventBus.on('resize', this.updateMarkersPages);
      this.eventBus.on('changescale', this.handleChangeScale);
      this.eventBus.on('changespread', this.handleChangeSpread);
    }
  };

  removeViewerListeners = () => {
    if (this.eventBus) {
      this.eventBus.off('pagechanging', this.setCurrentPage);
      this.eventBus.off('pagesloaded', this.updateMarkersPages);
      this.eventBus.off('scalechanging', this.updateMarkersPages);
      this.eventBus.off('resize', this.updateMarkersPages);
      this.eventBus.off('changescale', this.handleChangeScale);
      this.eventBus.off('changespread', this.handleChangeSpread);
    }
  };

  handlePageItemClick = (pageNumber) => {
    this.viewer.currentPageNumber = pageNumber;
  };

  loadPdfJs = () => new Promise((resolve, reject) => {
    if (window.pdfjsLib && window.pdfjsViewer) {
      resolve();
      return;
    }
    /** load pdfjs */
    const scriptPdf = document.createElement('script');
    scriptPdf.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.8.335/build/pdf.js';
    scriptPdf.onload = () => {
      /** load pdfjs viewer */
      const scriptViewer = document.createElement('script');
      scriptViewer.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.8.335/web/pdf_viewer.js';
      scriptViewer.onload = () => {
        /** load styles */
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.8.335/web/pdf_viewer.css';
        styles.onerror = reject;
        styles.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.8.335/build/pdf.worker.min.js';
          resolve();
        };

        document.body.appendChild(styles);
      };
      scriptViewer.onerror = reject;

      document.body.appendChild(scriptViewer);
    };
    scriptPdf.onerror = reject;

    document.body.appendChild(scriptPdf);
  });

  prepareFile = async (asset, revisionID) => {
    this.removeViewerListeners();
    const url = await getDownloadUrl({
      assetId: asset._id,
      revisionId: revisionID,
      allowDownloadByGS: false,
    });
    this.setState({ progress: 0 });

    let file;
    try {
      file = await downloadFile(url, 'arraybuffer').promise.progress(this.handleLoadingProgress);
    } catch (err) {
      if (this.isMounted) {
        this.setState({
          error: 'Can not download file',
          progress: null,
        });
      }
      return;
    }

    let pdfDocument;
    try {
      pdfDocument = await pdfjsLib.getDocument(file).promise;
    } catch (err) {
      if (this.isMounted) {
        this.setState({
          error: 'Can not parse file',
          progress: null,
        });
      }
      return;
    }

    const pagesCount = pdfDocument.numPages;

    const promises = [];
    for (let index = 1; index <= pagesCount; index += 1) {
      promises.push(
        (async () => {
          const page = await pdfDocument.getPage(index);
          const { width, height } = page.getViewport({ scale: 1 });
          return {
            id: index,
            name: `Page ${index}`,
            width,
            height,
            page,
          };
        })(),
      );
    }

    const pages = await Promise.all(promises);
    if (this.isMounted) {
      this.viewer = new pdfjsViewer.PDFViewer({
        container: this.viewerContainer.current,
        eventBus: this.eventBus,
        linkService: this.linkService,
        findController: this.findController,
      });
      this.viewer.setDocument(pdfDocument);
      this.linkService.setDocument(pdfDocument, null);
      this.linkService.setViewer(this.viewer);

      this.addViewerListeners();
      this.setState({ progress: null, pages }, () => {
        /**
         * Set viewer scale
         * need timeout after render viewer
         */
        setTimeout(() => {
          this.handleChangeScale({ scale: this.DEFAULT_SCALE_VALUE });
          this.setInitialSpread();
        }, 0);
      });
    }
  };

  setInitialSpread = () => {
    const initialSpread = utils.LocalStorage.get(SPREAD_FIELD);
    if (typeof initialSpread === 'number' && this.eventBus) {
      this.eventBus.dispatch('changespread', {
        source: Pdf,
        spread: initialSpread,
      });
    }
  }

  prepareDiff = async (asset, diffID) => {
    const url = await getDownloadUrl({
      assetId: asset._id,
      revisionId: diffID,
      allowDownloadByGS: false,
    });
    this.setState({ diffProgress: 0 });

    let file;
    try {
      file = await downloadFile(url, 'arraybuffer').promise;
    } catch (err) {
      if (this.isMounted) {
        this.setState({
          error: 'Can not download diff file',
          progress: null,
        });
      }
      return;
    }

    let pdfDocument;
    try {
      pdfDocument = await pdfjsLib.getDocument(file).promise;
    } catch (err) {
      if (this.isMounted) {
        this.setState({
          error: 'Can not parse diff file',
          progress: null,
        });
      }
      return;
    }

    if (this.isMounted) {
      this.diffViewer = new pdfjsViewer.PDFViewer({
        container: this.viewerContainerDiff.current,
        eventBus: this.eventBus,
      });
      this.diffViewer.setDocument(pdfDocument);
      this.diffViewer.currentScaleValue = SCALE_VALUES.pageWidth;
      if (this.viewer) this.viewer.currentScaleValue = SCALE_VALUES.pageWidth;
      this.eventBus.dispatch('changespread', {
        source: Pdf,
        spread: 0,
      });
    }
    this.setState({ diffProgress: null });
  };

  handleChangeScale = (event) => {
    const { scale } = event;
    const { viewer, diffViewer } = this;
    if (viewer) viewer.currentScaleValue = scale;
    if (diffViewer) diffViewer.currentScaleValue = scale;
    this.updateMarkersPages();
  };

  handleChangeSpread = (event) => {
    const { spread } = event;
    const { viewer } = this;

    if (viewer) viewer.spreadMode = spread;
    this.setState({ spreadMode: spread }, this.updateMarkersPages);
    utils.LocalStorage.set(SPREAD_FIELD, spread);
  }

  setCurrentPage = (evt) => {
    if (evt.source === this.viewer) {
      /** Prevent change page from diffViever, e.g. if documents have different page size */
      this.setState({ currentPage: evt.pageNumber });
    }
  };

  handleLoadingProgress = ({ loaded, total }) => {
    const percentComplete = (loaded / total) * 100;
    this.setState({ progress: Math.floor(percentComplete) });
  };

  onAddRevision = () => {
    this.prepareFile(this.props.asset);
  };

  handleContainerScroll = (e) => {
    const top = e.currentTarget.scrollTop;
    const left = e.currentTarget.scrollLeft;
    if (this.markersContainer.current !== null) {
      this.markersContainer.current.scrollTop = top;
      this.markersContainer.current.scrollLeft = left;
    }
    if (this.viewerContainerDiff.current !== null) {
      this.viewerContainerDiff.current.scrollTop = top;
      this.viewerContainerDiff.current.scrollLeft = left;
    }
  };

  updateMarkersPages = () => {
    if (this.markersContainer.current !== null) {
      const width = this.viewerContainer.current.querySelector('.pdfViewer').offsetWidth;
      this.markersContainer.current.style.width = `${width}px`; /* handle right width (without scroll width) */

      const $pdfPages = this.viewerContainer.current.querySelectorAll('.page');
      const $markersPages = this.markersContainer.current.querySelectorAll('.markersForPage');
      $pdfPages.forEach(($page, index) => {
        const { width: pageWidth, height: pageHeight } = $page.style;
        if ($markersPages[index]) {
          $markersPages[index].style.width = pageWidth;
          $markersPages[index].style.height = pageHeight;
        } else {
          Logger.warn(
            `<PDF /> Page for markers number [${index + 1}] not found, total pages: [${$pdfPages.length}]`,
          );
        }
      });
    }
  };

  /**
   * Set marker from event click
   * @param {MouseEvent} event
   * @param {Number} event.clientX
   * @param {Number} event.clientY
   */
  setMarker = ({ clientX, clientY }) => {
    const $pages = this.markersContainer.current.querySelectorAll('.markersForPage');
    let markerToAdd = null;

    $pages.forEach(($page) => {
      if (markerToAdd !== null) return;

      const rect = $page.getBoundingClientRect();
      /* check Y */
      if (clientY >= rect.y && clientY <= rect.y + rect.height) {
        /* check X */
        if (clientX >= rect.x && clientX <= rect.x + rect.width) {
          /* click on the page */
          const left = (clientX - rect.x) / rect.width;
          const top = (clientY - rect.y) / rect.height;

          markerToAdd = {
            x: left,
            y: top,
            createdAt: Date.now(),
            page: Number($page.dataset.number) || 1,
          };
        }
      }
    });

    this.props.addMarker(markerToAdd);
  };

  toggleOutline = () => {
    if (this.state.showOutline) {
      Logger.log('User', 'MultiPagePanelHide');
      this.setState({ showOutline: false });
      utils.setCookie('picsio.multipagePanelOpened', false);
      window.dispatchEvent(new Event('preview:ui:resize'));
    } else {
      Logger.log('User', 'MultiPagePanelShow');
      this.setState({ showOutline: true });
      utils.setCookie('picsio.multipagePanelOpened', true);
      window.dispatchEvent(new Event('preview:ui:resize'));
    }
  };

  render() {
    const { props, state } = this;
    const showDiff = props.diffAsset || props.diffID;

    if (state.error) {
      return (
        <Placeholder
          model={props.asset}
          openEditor={props.openEditor}
          addRevision={props.addRevision}
          handleDownload={props.handleDownload}
          moveToTrash={props.moveToTrash}
          text={state.error}
          icon="warning"
        />
      );
    }

    const { spreadMode } = state;
    /** +1 - extra spread for even spreads and even pages */
    const spreadsLength = { length: Math.ceil(state.pages.length / 2) + 1 };
    const spreads = Array.from(
      spreadsLength,
      (_, i) => {
        let firstPageIndex = i * 2;
        if (spreadMode === 2) firstPageIndex = i * 2 - 1;

        const result = { i, pages: [] };
        if (state.pages[firstPageIndex]) result.pages.push(state.pages[firstPageIndex]);
        if (state.pages[firstPageIndex + 1]) result.pages.push(state.pages[firstPageIndex + 1]);

        return result;
      },
    );

    return (
      <div className="innerContainerMediaFile">
        <If condition={picsioConfig.isMainApp() && !props.diffAsset}>
          <ToolbarPreviewLeft
            assetId={props.asset._id}
            isMultipage
            handleOnClick={this.toggleOutline}
            isActive={state.showOutline}
            addRevision={props.addRevision}
            download={props.handleDownload}
            moveToTrash={props.moveToTrash}
            openEditor={!props.asset.trashed && props.openEditor}
            permissions={props.asset.permissions}
            isRestricted={utils.isAssetRestricted(props.asset.restrictSettings)}
            isRemoveForever={props.isRemoveForever}
          />
        </If>
        <div className="pdfHolder">
          <If condition={state.pages.length > 0}>
            <Pages
              pages={state.pages}
              activePageNumber={state.currentPage}
              onClick={this.handlePageItemClick}
              onImageLoadStart={this.onImageLoadStart}
              imagesLoaded={[]}
              showMultipagePanel={state.showOutline}
              isPdf
              markers={props.markers}
              tmpMarkers={props.tmpMarkers}
            />
          </If>
          <div className="pdfFrame">
            <If condition={this.viewer}>
              <Controls
                eventBus={this.eventBus}
                spreadMode={state.spreadMode}
                isDiff={Boolean(state.diffID || props.diffAsset)}
                findController={this.findController}
                viewer={this.viewer}
                currentPage={state.currentPage}
                pagesCount={state.pages.length}
              />
            </If>
            <If condition={!showDiff}>
              <div className="pdfMarkersContainer" ref={this.markersContainer}>
                {spreads.map((s) => {
                  const Wrapper = spreadMode > 0 ? Spread : EmptyWrapper;
                  return (
                    <Wrapper key={s.i}>
                      {s.pages.map((page) => (
                        <div className={cn('markersForPage', { page: spreadMode > 0 })} key={page.id} data-number={page.id}>
                          {props.markers.map((comment) => comment.markers.map((marker, index) => {
                            if (Number(marker.page) === page.id) {
                              return <Marker key={marker.number || index} marker={marker} />;
                            }
                            return null;
                          }))}
                          {props.tmpMarkers.map((marker, index) => {
                            if (Number(marker.page) === page.id) {
                              return (
                                <Marker
                                  key={marker.number || index}
                                  marker={marker}
                                  onRemove={() => props.removeMarker(index)}
                                  onMouseDown={(e) => this.onMarkerMouseDown(e, index, page.id)}
                                  onMouseDownResize={
                                    (e) => this.onMarkerMouseDownResize(e, index, page.id)
                                  }
                                />
                              );
                            }
                            return null;
                          })}
                        </div>

                      ))}

                    </Wrapper>
                  );
                })}
              </div>
            </If>
            <div
              className={cn('pdfViewerContainer', { onTheRight: showDiff })}
              onScroll={this.handleContainerScroll}
              ref={this.viewerContainer}
            >
              <div className="pdfViewer" />
            </div>
            {/* DIFF */}
            <If condition={showDiff}>
              <span className="pdfDiffName original">{props.activeRevisionNumber}</span>
              <span className="pdfDiffName">{props.diffRevisionNumber}</span>
              <div className="pdfViewerContainer diffPdfContainer" ref={this.viewerContainerDiff}>
                <div className="pdfViewer" />
              </div>
            </If>
          </div>
        </div>
        <If condition={state.progress !== null || state.diffProgress !== null}>
          <ProgressBar text="Loading file..." percent={state.progress} />
          <ProgressBar text="Loading file..." percent={state.diffProgress} />
        </If>{' '}
      </div>
    );
  }
}

Pdf.propTypes = {
  asset: object,
  revisionID: string,
  isAssetsComparing: bool,
  tmpMarkers: array,
  addMarker: func,
  removeMarker: func,
  listenToClick: bool,
  modifyTmpMarkers: func,
  addRevision: func,
  openEditor: func,
  handleDownload: func,
  isRemoveForever: bool,
  moveToTrash: func,
};

Pdf.defaultProps = {
  markers: [],
  tmpMarkers: [],
};

export default Pdf;
