import React from 'react';
import {
  string, object, array, number, func, oneOfType, bool,
} from 'prop-types';
import _isEmpty from 'lodash/isEmpty';
import ua from '../../../../ua';
import * as utils from '../../../../shared/utils';

import picsioConfig from '../../../../../../../config';
import ToolbarPreviewTop from '../../../toolbars/ToolbarPreviewTop';
import ToolbarPreviewLeft from '../../../toolbars/ToolbarPreviewLeft';
import ToolbarPreviewRightMobile from '../../../toolbars/ToolbarPreviewRightMobile';
import Logger from '../../../../services/Logger';
import Icon from '../../../Icon';
import Pages from './Pages';
import Spinner from '../Spinner';
import Marker from '../Marker';

const MIN_CANVAS_WIDTH = 1200; /** for readability */

const makeDefaultState = (props) => ({
  activePage: 1,
  activeDiffPage: props.diffPages ? 1 : null,
  fit: true,
  scale: 1,
  translateX: 0,
  translateY: 0,
  diffPosition: 50,
  diffImgLoaded: false,
  imagesLoaded: [],
  canvasRendered: false,
  showMultipagePanel:
    utils.getCookie('picsio.multipagePanelOpened') === null
      ? true
      : utils.getCookie('picsio.multipagePanelOpened'),
});

class Multipage extends React.Component {
  /** prop types */
  static propTypes = {
    model: object,
    revisionID: string,
    diffID: string,
    diffPages: array,
    activeRevisionNumber: oneOfType([number, string]),
    diffRevisionNumber: oneOfType([number, string]),
    markers: array,
    tmpMarkers: array,
    addMarker: func,
    openEditor: func,
    removeMarker: func,
    modifyTmpMarkers: func,
    isPdf: bool,
  };

  /** default props */
  static defaultProps = {
    markers: [],
    tmpMarkers: [],
    isPdf: false,
  };

  isMounted = true;

  renderTask = null;

  renderTaskDiff = null;

  image = React.createRef();

  canvas = React.createRef();

  diffCanvas = React.createRef();

  minZoom = 1;

  /** state */
  state = makeDefaultState(this.props);

  componentDidMount() {
    if (!this.state.canvasRendered && this.canvas.current) {
      this.renderCanvas();
    }
    this.getPages(this.props.model._id, this.props.asset2Id || this.props.diffID, this.props.revisionID);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.model._id !== this.props.model._id) {
      this.setState(makeDefaultState(nextProps));
      this.getPages(nextProps.model._id, nextProps.diffID);
      return;
    }
    if (nextProps.diffID !== this.props.diffID) { this.setState({ diffPosition: 50, diffImgLoaded: false }); }

    if (nextProps.revisionID !== this.props.revisionID) {
      this.getPages(nextProps.model._id, null, nextProps.revisionID);
      this.setState({
        scale: 1,
        translateX: 0,
        translateY: 0,
        activePage: 1,
      });
    }

    /* switch listener to add marker */
    if (nextProps.listenToClick) {
      document.addEventListener('mousedown', this.setMarker);
    } else {
      document.removeEventListener('mousedown', this.setMarker);
    }
  }

  componentDidUpdate() {
    this.updateMarkersWrapper();
    if (!this.state.canvasRendered && this.canvas.current) {
      this.renderCanvas();
    }
    if (!this.state.diffImgLoaded && this.diffCanvas.current && this.renderTaskDiff === null) {
      this.renderDiffCanvas();
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  getPages = (modelId, diffId, revisionId) => {
    if (this.props.isPdf) return;

    const ids = [];
    if (modelId) ids.push(modelId);
    if (diffId) ids.push(diffId);
    if (ids.length) {
      this.props.getPages(ids, revisionId);
    }
  };

  renderCanvas = async () => {
    const $canvas = this.canvas.current;
    if (this.renderTask !== null) await this.renderTask.cancel();
    if (!$canvas) return;

    if (_isEmpty(this.props.model.pages)) return;
    const pages = this.props.model.pages[this.props.revisionID || 'head'];
    if (!pages) return;
    const { page } = pages[
      this.state.activePage - 1
    ];
    const pageWidth = page.getViewport({ scale: 1.0 }).width;
    /** Calculate scale */
    const scale = Math.max(window.innerWidth, MIN_CANVAS_WIDTH) / pageWidth;
    const viewport = page.getViewport({ scale });
    $canvas.width = viewport.width;
    $canvas.height = viewport.height;
    const ctx = $canvas.getContext('2d');
    this.renderTask = page.render({
      canvasContext: ctx,
      viewport,
    });
    try {
      await this.renderTask.promise;
    } catch (err) {
      if (err && err.type && err.type === 'canvas') {
        Logger.info(err.message);
      } else {
        Logger.warn('Can not render canvas:', err, this.props.model);
      }
    }
    this.renderTask = null;
    if (this.isMounted) this.setState({ canvasRendered: true });
  };

  renderDiffCanvas = async () => {
    const $canvas = this.diffCanvas.current;
    if (!$canvas || !this.props.diffPages) return;
    if (this.renderTaskDiff !== null) await this.renderTaskDiff.cancel();

    this.setState({ diffImgLoaded: false });
    const pageNumber = this.state.activeDiffPage ? this.state.activeDiffPage - 1 : 0;
    const { page } = this.props.diffPages[pageNumber];
    const pageWidth = page.getViewport({ scale: 1.0 }).width;
    /** Calculate scale */
    const scale = Math.max(window.innerWidth, MIN_CANVAS_WIDTH) / pageWidth;
    const viewport = page.getViewport({ scale });
    $canvas.width = viewport.width;
    $canvas.height = viewport.height;
    const ctx = $canvas.getContext('2d');
    this.renderTaskDiff = page.render({
      canvasContext: ctx,
      viewport,
    });
    try {
      await this.renderTaskDiff.promise;
    } catch (err) {
      if (err && err.type && err.type === 'canvas') {
        Logger.info(err.message);
      } else {
        Logger.warn('Can not render canvas:', err, this.props.model);
      }
    }
    this.renderTaskDiff = null;
    if (this.isMounted) this.setState({ diffImgLoaded: true });
  };

  getImageRect = () => (this.image && this.image.current
    ? this.image.current.getBoundingClientRect()
    : this.canvas.current.getBoundingClientRect());

  updateMarkersWrapper = () => {
    const imageRect = this.getImageRect();
    const containerRect = this.container.getBoundingClientRect();

    this.markersContainer.style.left = `${imageRect.left - containerRect.left}px`;
    this.markersContainer.style.top = `${imageRect.top - containerRect.top}px`;
    this.markersContainer.style.width = `${imageRect.width}px`;
    this.markersContainer.style.height = `${imageRect.height}px`;
  };

  /**
   * Set marker from event click
   * @param {MouseEvent} event
   * @param {Number} event.clientX
   * @param {Number} event.clientY
   */
  setMarker = ({ clientX, clientY }) => {
    if (!this.image.current && !this.canvas.current) return;
    const imageRect = this.getImageRect();

    /* if pointer outside the image - do nothing */
    if (
      !(
        clientX > imageRect.left
        && clientX < imageRect.left + imageRect.width
        && clientY > imageRect.top
        && clientY < imageRect.top + imageRect.height
      )
    ) {
      return this.props.addMarker(null);
    }

    const left = (clientX - imageRect.left) / imageRect.width;
    const top = (clientY - imageRect.top) / imageRect.height;

    const offsetX = left;
    const offsetY = top;

    const markerData = {
      x: offsetX,
      y: offsetY,
      createdAt: Date.now(),
      page: this.state.activePage,
    };

    /* save marker */
    this.props.addMarker(markerData);
    document.removeEventListener('click', this.setMarker);
  };

  /**
   * Mouse down on tmp marker
   * @param {MouseEvent} event
   * @param {Number} index
   */
  onMarkerMouseDown(event, index) {
    event.stopPropagation();

    const { tmpMarkers } = this.props;
    const marker = tmpMarkers[index];

    if (marker) {
      const mousemoveHandler = (e) => {
        e.stopPropagation();
        const clientX = e.pageX;
        const clientY = e.pageY;
        const imageRect = this.getImageRect();

        /* if pointer outside the image - do nothing */
        if (
          !(
            clientX > imageRect.left
            && clientX < imageRect.left + imageRect.width
            && clientY > imageRect.top
            && clientY < imageRect.top + imageRect.height
          )
        ) {
          return;
        }

        const left = (clientX - imageRect.left) / imageRect.width;
        const top = (clientY - imageRect.top) / imageRect.height;

        const offsetX = left;
        const offsetY = top;

        // if rectangle selection - move 2 points
        if (marker.x2 !== undefined && marker.y2 !== undefined) {
          // handle x and x2
          const newX2 = marker.x2 + offsetX - marker.x;
          if (newX2 <= 1) {
            marker.x = offsetX;
            marker.x2 = newX2;
          } else {
            marker.x = offsetX + 1 - newX2;
            marker.x2 = 1;
          }

          // handle y and y2
          const newY2 = marker.y2 + offsetY - marker.y;
          if (newY2 <= 1) {
            marker.y2 = newY2;
            marker.y = offsetY;
          } else {
            marker.y = offsetY + 1 - newY2;
            marker.y2 = 1;
          }
        } else {
          // if single marker
          marker.x = offsetX;
          marker.y = offsetY;
        }

        this.props.modifyTmpMarkers(tmpMarkers);
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
  onMarkerMouseDownResize = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    const { tmpMarkers } = this.props;
    const marker = tmpMarkers[index];

    if (marker) {
      const mousemoveHandler = (e) => {
        e.stopPropagation();
        const clientX = e.pageX;
        const clientY = e.pageY;
        const imageRect = this.getImageRect();

        /* if pointer outside the image - do nothing */
        if (
          !(
            clientX > imageRect.left
            && clientX < imageRect.left + imageRect.width
            && clientY > imageRect.top
            && clientY < imageRect.top + imageRect.height
          )
        ) {
          return;
        }

        const left = (clientX - imageRect.left) / imageRect.width;
        const top = (clientY - imageRect.top) / imageRect.height;

        const offsetX = left;
        const offsetY = top;

        marker.x2 = marker.x > offsetX ? marker.x : offsetX;
        marker.y2 = marker.y > offsetY ? marker.y : offsetY;

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

  handlePageItemClick = (activePage) => {
    if (activePage !== this.state.activePage) {
      this.setState({
        scale: 1,
        translateX: 0,
        translateY: 0,
        fit: true,
        activePage,
        diffImgLoaded: this.state.activeDiffPage === null ? false : this.state.diffImgLoaded,
        canvasRendered: false,
      });
    }
  };

  handleDiffPageItemClick = (activeDiffPage) => {
    if (activeDiffPage !== this.state.activeDiffPage) {
      this.setState({
        scale: 1,
        translateX: 0,
        translateY: 0,
        fit: true,
        activeDiffPage,
        diffImgLoaded: false,
      });
    } else {
      this.setState({
        scale: 1,
        translateX: 0,
        translateY: 0,
        fit: true,
      });
    }
  };

  refMarkersContainer = (node) => (this.markersContainer = node);

  /**
   * Mouse down on image
   * @param {MouseEvent} event
   */
  onImgMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const start = {
      x: event.pageX,
      y: event.pageY,
    };

    if (event.touches && event.touches.length === 1) {
      start.x = event.touches[0].pageX;
      start.y = event.touches[0].pageY;
    }

    const mousemoveHandler = (e) => {
      const { x, y } = start;
      const { translateX, translateY, scale } = this.state;
      let { pageX, pageY } = e;
      if (e.touches && e.touches.length === 1) {
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
      }

      const imgRect = this.getImageRect();
      const img = {
        left: imgRect.left,
        top: imgRect.top,
        right: imgRect.left + imgRect.width,
        bottom: imgRect.top + imgRect.height,
      };

      const containerRect = this.container.getBoundingClientRect();
      const container = {
        left: containerRect.left,
        top: containerRect.top,
        right: containerRect.left + containerRect.width,
        bottom: containerRect.top + containerRect.height,
      };

      const diffX = (pageX - x) * scale;
      const diffY = (pageY - y) * scale;
      const directionX = diffX < 0 ? 'left' : diffX > 0 ? 'right' : null;
      const directionY = diffY < 0 ? 'top' : diffY > 0 ? 'bottom' : null;

      let newX = null;
      let newY = null;

      /** hadle move direction */
      switch (directionX) {
      /* move left */
      case 'left':
        if (img.left >= container.left || img.right >= container.right) {
          newX = translateX + diffX / scale;
        }
        break;
        /* move right */
      case 'right':
        if (img.right <= container.right || img.left <= container.left) {
          newX = translateX + diffX / scale;
        }
        break;
      }
      switch (directionY) {
      /* move up */
      case 'top':
        if (img.top >= container.top || img.bottom >= container.bottom) {
          newY = translateY + diffY / scale;
        }
        break;
        /* move down */
      case 'bottom':
        if (img.bottom <= container.bottom || img.top <= container.top) {
          newY = translateY + diffY / scale;
        }
        break;
      }

      if (newX !== null || newY !== null) {
        this.setState({
          translateX: newX !== null ? newX : translateX,
          translateY: newY !== null ? newY : translateY,
        });

        start.x = pageX;
        start.y = pageY;
      }
    };

    const mouseupHandler = (e) => {
      e.stopPropagation();
      document.removeEventListener('mousemove', mousemoveHandler);
      document.removeEventListener('mouseup', mouseupHandler);
      document.removeEventListener('touchmove', mousemoveHandler);
      document.removeEventListener('touchend', mouseupHandler);
    };

    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);
    document.addEventListener('touchmove', mousemoveHandler);
    document.addEventListener('touchend', mouseupHandler);
  };

  zoomIn = () => this.setState({ scale: this.state.scale * 1.25, fit: true });

  zoomOut = () => {
    let newScale = this.state.scale * 0.75;
    if (newScale < this.minZoom) {
      newScale = this.minZoom;
    }
    this.setState({ scale: newScale, fit: true });
  };

  /**
   * mousewheel on image
   * @param {MouseEvent} event
   */
  onWheel = (event) => {
    const INCREASE = 0.04;

    const {
      width, height, left, top,
    } = this.getImageRect();
    let { translateX, translateY, scale } = this.state;

    const { clientX, clientY } = event.nativeEvent;
    let offsetX;
    let offsetY;
    const x = clientX - left;
    const y = clientY - top;
    const diffWidth = width / 25;
    const diffHeight = height / 25;
    const halfDiffWidth = diffWidth / 2;
    const halfDiffHeight = diffHeight / 2;

    if (event.deltaY > 0) {
      scale -= scale * INCREASE;

      if (scale < this.minZoom) {
        return this.setState({
          scale: this.minZoom,
          translateX: 0,
          translateY: 0,
        });
      }

      offsetX = x;
      offsetY = y;

      translateX += diffWidth * (offsetX / width) - halfDiffWidth;
      translateY += diffHeight * (offsetY / height) - halfDiffHeight;
    }
    if (event.deltaY < 0) {
      scale += scale * INCREASE;

      offsetX = x;
      offsetY = y;

      translateX -= diffWidth * (offsetX / width) - halfDiffWidth;
      translateY -= diffHeight * (offsetY / height) - halfDiffHeight;
    }

    const newState = {
      scale,
      translateX,
      translateY,
    };
    this.setState(newState);
  };

  /**
   * Click on image
   * @param {MouseEvent} event
   */
  onImgClick = (event) => {
    if (ua.browser.isNotDesktop()) {
      event.preventDefault();
      this.fitImage();
    }
  };

  fitImage() {
    const currentScale = this.state.scale;
    const fit = !this.state.fit;
    const { image, canvas } = this;
    let scale;
    if (image && image.current) {
      scale = image.current.naturalWidth / (image.current.getBoundingClientRect().width / currentScale);
    }
    if (canvas && canvas.current) {
      scale = canvas.current.naturalWidth / (canvas.current.getBoundingClientRect().width / currentScale);
    }

    this.setState({
      translateX: 0,
      translateY: 0,
      fit,
      scale: fit ? this.minZoom : scale,
    });
  }

  /**
   * Mouse down on separator line
   * @param {MouseEvent} event
   */
  onLineMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    /**
     * Mouse move
     * @param {MouseEvent} e
     */
    const mouseMove = (e) => {
      e.stopPropagation();

      const rect = this.container.getBoundingClientRect();
      let position = (e.pageX - rect.left) / (rect.width / 100);
      if (position < 0) position = 0;
      if (position > 100) position = 100;

      this.setState({ diffPosition: position });
    };
    /**
     * Mouse up
     * @param {MouseEvent} e
     */
    const mouseUp = (e) => {
      e.stopPropagation();
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  onLineDoubleClick = () => {
    if (this.state.diffPosition !== 50) this.setState({ diffPosition: 50 });
  };

  handleOnClick = () => {
    if (this.state.showMultipagePanel) {
      Logger.log('User', 'MultiPagePanelHide');
      this.setState({ showMultipagePanel: false });
      utils.setCookie('picsio.multipagePanelOpened', false);
      window.dispatchEvent(new Event('preview:ui:resize'));
    } else {
      Logger.log('User', 'MultiPagePanelShow');
      this.setState({ showMultipagePanel: true });
      utils.setCookie('picsio.multipagePanelOpened', true);
      window.dispatchEvent(new Event('preview:ui:resize'));
    }
  };

  onImageLoadStart = (index) => this.setState({ imagesLoaded: this.state.imagesLoaded.filter((num) => num !== index) });

  onImageLoaded = (index) => this.setState({ imagesLoaded: [...this.state.imagesLoaded, index] });

  onDiffImgLoad = () => this.setState({ diffImgLoaded: true });

  render() {
    const { props, state } = this;
    const {
      model, revisionID, diffID, addRevision, handleDownload, moveToTrash,
    } = props;
    const { pages } = model;

    /** @type {Array} */
    const currentPages = pages[revisionID || 'head'];
    const diffPages = props.diffPages || pages[diffID] || (diffID && []);
    let diffUrl = null;
    if (diffPages) {
      if (diffPages[(state.activeDiffPage || state.activePage) - 1]) {
        diffUrl = diffPages[(state.activeDiffPage || state.activePage) - 1].url
          || diffPages[(state.activeDiffPage || state.activePage) - 1].page;
      } else {
        diffUrl = '';
      }
    }
    /** @type {boolean} */
    const showButtons = !model.trashed;
    /** @type {boolean} */
    const isImageLoaded = state.imagesLoaded.includes(state.activePage) || state.canvasRendered;
    const isRestricted = utils.isAssetRestricted(props.model.restrictSettings);
    return (
      <div className="multipageView">
        <If condition={!props.isAssetsComparing}>
          <If condition={picsioConfig.isMainApp()}>
            <ToolbarPreviewLeft
              assetId={model._id}
              isMultipage
              handleOnClick={this.handleOnClick}
              isActive={state.showMultipagePanel}
              addRevision={addRevision}
              download={handleDownload}
              moveToTrash={moveToTrash}
              openEditor={showButtons && props.openEditor}
              originalSizeImg={{
                handler: this.fitImage.bind(this),
                fit: this.state.fit,
              }}
              permissions={model.permissions}
              isRestricted={isRestricted}
              isRemoveForever={props.isRemoveForever}
            />
          </If>

          <ToolbarPreviewRightMobile
            originalSizeImg={{
              handler: this.fitImage.bind(this),
              fit: this.state.fit,
            }}
            zoomIn={this.zoomIn}
            zoomOut={this.zoomOut}
          />

          <ToolbarPreviewTop
            historyItems={this.props.historyItems}
            isSupportedForDiff={this.props.isSupportedForDiff}
            setActive={this.props.setActive}
            isDownloadable={this.props.isDownloadable}
            activeRevisionID={this.props.activeRevisionID}
            lastRevisionNumber={this.props.lastRevisionNumber}
            addRevision={this.props.addRevision}
            isAllowedUploadingRevision={this.props.isAllowedUploadingRevision}
            subscriptionFeatures={this.props.subscriptionFeatures}
            isRevisionUploading={this.props.isRevisionUploading}
            assetName={this.props.assetName}
            download={this.props.downloadProofing}
            onClose={picsioConfig.isSingleApp() ? null : this.props.close}
            historyPanel={this.props.history}
            details={this.props.details}
            analytics={this.props.analytics}
            pages={currentPages && currentPages.length}
            activePageNumber={state.activePage}
            showRevisions={this.props.showRevisions}
          />
        </If>
        {props.diffPages && props.diffPages.length && (
          <Pages
            pages={props.diffPages}
            activePageNumber={state.activeDiffPage}
            onClick={this.handleDiffPageItemClick}
            onImageLoaded={this.onImageLoaded}
            onImageLoadStart={this.onImageLoadStart}
            imagesLoaded={state.imagesLoaded}
            showMultipagePanel={state.showMultipagePanel}
            isPdf={props.isPdf}
          />
        )}
        {currentPages && currentPages.length && (
          <Pages
            pages={currentPages}
            activePageNumber={state.activePage}
            onClick={this.handlePageItemClick}
            onImageLoaded={this.onImageLoaded}
            onImageLoadStart={this.onImageLoadStart}
            imagesLoaded={state.imagesLoaded}
            showMultipagePanel={state.showMultipagePanel}
            isPdf={props.isPdf}
            markers={props.markers}
            tmpMarkers={props.tmpMarkers}
          />
        )}
        <div className="multipageViewContent">
          <div className="containerMediaFile">
            <div className="innerContainerMediaFile" ref={(el) => (this.container = el)}>
              <div
                ref={this.refMarkersContainer}
                onWheel={this.onWheel}
                className="markersContainer"
              >
                {/* Comment markers */}
                {props.markers.length > 0
                  && props.markers.map((markersItem) => markersItem.markers.map((marker, index) => {
                    if (Number(marker.page) !== state.activePage) return null;
                    return (
                      <Marker
                        key={marker.number || index}
                        marker={marker}
                        onAreaMouseDown={this.onImgMouseDown}
                      />
                    );
                  }))}
                {/* Tmp Markers */}
                {props.tmpMarkers.length > 0
                  && props.tmpMarkers.map((marker, index) => {
                    if (marker.page !== state.activePage) return null;
                    return (
                      <Marker
                        key={marker.number}
                        marker={marker}
                        onRemove={() => props.removeMarker(index)}
                        onMouseDown={(event) => this.onMarkerMouseDown(event, index)}
                        onMouseDownResize={(event) => this.onMarkerMouseDownResize(event, index)}
                        onAreaMouseDown={this.onImgMouseDown}
                      />
                    );
                  })}
              </div>
              <div className="theMediaFile">
                {!isImageLoaded && currentPages && <Spinner />}
                {!currentPages && (
                  <div className="placeholderMediaFile">
                    <div className="innerPlaceholderMediaFile">
                      <div className="icon" style={{ color: '#474747' }}>
                        <Icon name="noPreviewCatalogItem" />
                      </div>
                      <div className="text">
                        no preview <br />
                        available
                      </div>
                    </div>
                  </div>
                )}
                {currentPages && currentPages[state.activePage - 1].url ? (
                  <img
                    ref={this.image}
                    src={currentPages && currentPages[state.activePage - 1].url}
                    alt={model.name}
                    style={{
                      opacity: isImageLoaded ? 1 : 0,
                      transform: `
                scale(${state.scale})
                translate(${(state.translateX / state.scale).toFixed(6)}px, ${(
                    state.translateY / state.scale
                  ).toFixed(6)}px)`,
                    }}
                    onWheel={this.onWheel}
                    onMouseDown={this.onImgMouseDown}
                    onTouchStart={this.onImgMouseDown}
                    onClick={this.onImgClick}
                  />
                ) : (
                  <canvas
                    ref={this.canvas}
                    alt={model.name}
                    style={{
                      opacity: isImageLoaded ? 1 : 0,
                      transform: `
                scale(${state.scale})
                translate(${(state.translateX / state.scale).toFixed(6)}px, ${(
                    state.translateY / state.scale
                  ).toFixed(6)}px)`,
                    }}
                    onWheel={this.onWheel}
                    onMouseDown={this.onImgMouseDown}
                    onTouchStart={this.onImgMouseDown}
                    onClick={this.onImgClick}
                  />
                )}
              </div>
              {/* diff vertical line */}
              {diffUrl !== null && (
                <div
                  style={{ left: `${state.diffPosition}%` }}
                  className="diffLine"
                  onMouseDown={this.onLineMouseDown}
                  onDoubleClick={this.onLineDoubleClick}
                >
                  <span>{props.diffRevisionNumber}</span>
                  <span>{props.activeRevisionNumber}</span>
                </div>
              )}
              {/* diff */}
              {diffUrl !== null && (
                <div className="diffContainer" style={{ right: `${100 - state.diffPosition}%` }}>
                  {diffUrl ? (
                    <div
                      className="diffContainerInner"
                      style={{ width: `${(100 / state.diffPosition) * 100}%` }}
                    >
                      {!state.diffImgLoaded && <Spinner />}
                      {model.isPdf ? (
                        <canvas
                          ref={this.diffCanvas}
                          alt={model.name}
                          style={{
                            opacity: state.diffImgLoaded ? 1 : 0,
                            transform: `
                    scale(${state.scale})
                    translate(${(state.translateX / state.scale).toFixed(6)}px,${(
                          state.translateY / state.scale
                        ).toFixed(6)}px)`,
                          }}
                          onWheel={this.onWheel}
                          onMouseDown={this.onImgMouseDown}
                        />
                      ) : (
                        <img
                          src={diffUrl}
                          alt={model.name}
                          style={{
                            opacity: state.diffImgLoaded ? 1 : 0,
                            transform: `
                    scale(${state.scale})
                    translate(${(state.translateX / state.scale).toFixed(6)}px,${(
                          state.translateY / state.scale
                        ).toFixed(6)}px)`,
                          }}
                          onLoad={this.onDiffImgLoad}
                          onWheel={this.onWheel}
                          onMouseDown={this.onImgMouseDown}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="diffPlaceholder">
                      <span>
                        Revision {props.diffRevisionNumber} <br />
                        does not contain page {state.activePage}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Multipage;
