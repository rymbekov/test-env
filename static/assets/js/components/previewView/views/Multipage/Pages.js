import React from 'react'; // eslint-disable-line
import {
  array, number, func, bool,
} from 'prop-types';

import cn from 'classnames';
import { bindActionCreators } from 'redux';
import ImgItem from './PageItem';
import CanvasItem from './CanvasPageItem';
import * as utils from '../../../../shared/utils';
import ua from '../../../../ua';
import store from '../../../../store';
import { resizePanel } from '../../../../store/actions/main';

const mainActions = bindActionCreators({ resizePanel }, store.dispatch);

const PANEL_HORIZONTAL_PADDINGS = 42;
const PAGE_VERTICAL_PADDINGS = 41;

function isMobile() {
  return ua.browser.isNotDesktop();
}

/**
 * Pages Component
 * @param {Object} params
 * @param {Object[]} params.pages
 * @param {number} params.activePageNumber
 * @param {number[]} params.imagesLoaded
 * @param {Function} params.onClick
 * @param {Function} params.onImageLoadStart
 * @param {Function} onImageLoaded
 * @returns {JSX}
 */

class Pages extends React.Component {
  static propTypes = {
    pages: array,
    activePageNumber: number,
    imagesLoaded: array,
    onClick: func,
    onImageLoaded: func,
    onImageLoadStart: func,
    showMultipagePanel: bool,
    isPdf: bool,
    markers: array,
    tmpMarkers: array,
  };

  static defaultProps = {
    isPdf: false,
    markers: [],
    tmpMarkers: [],
    onImageLoadStart: () => {},
  };

  wrapper = React.createRef();

  list = React.createRef();

  isMounted = true;

  state = {
    pages: [],
    coordinates: [],
    visiblePages: [0, 10],
    tmpMarkers: [],
    markers: [],
    combinedMarkers: [],
  };

  static getDerivedStateFromProps(props, state) {
    let newState = {};

    if (props.pages !== state.pages && props.isPdf && !isMobile()) {
      newState = {
        pages: props.pages,
        coordinates: calculatePageCoordinates(props.pages),
      };
    }

    if (props.markers !== state.markers || props.tmpMarkers !== state.tmpMarkers) {
      newState = {
        ...newState,
        markers: props.markers,
        tmpMarkers: props.tmpMarkers,
        combinedMarkers: [
          ...props.tmpMarkers,
          ...props.markers.reduce((markers, currentComment) => [...markers, ...currentComment.markers], []),
        ],
      };
    }

    return Object.keys(newState).length > 0 ? newState : null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { props, state } = this;
    if (
      prevState.combinedMarkers.length === 0 // no markers before
      && state.combinedMarkers.length > 0 // has markers
      && props.tmpMarkers.length !== state.combinedMarkers.length // markers isn't temporary
    ) {
      /** Activate first page with marker */
      props.onClick(Number(state.combinedMarkers[0].page));
    }
    if (props.isPdf && !isMobile() && prevProps.activePageNumber !== props.activePageNumber) {
      /** Active page changed [only for pdf] */
      this.checkVisibilityActivePage();
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  checkVisibilityActivePage = () => {
    const { activePageNumber } = this.props;
    const { coordinates } = this.state;
    const $wrapper = this.wrapper.current;
    const $list = this.list.current;

    if ($wrapper !== null && $list !== null) {
      const { offsetHeight, scrollTop } = $wrapper;
      const pageCoordinates = coordinates[activePageNumber - 1];
      const { top, height } = pageCoordinates;

      const topLimit = scrollTop;
      const bottomLimit = topLimit + offsetHeight;
      const middle = topLimit + offsetHeight / 2;
      /** if page is visible */
      if (top > topLimit && top + height < bottomLimit) return;
      const newTop = top > middle ? top + height - offsetHeight : top; /** stick to top or bottom */
      utils.animatedScrollTo($wrapper, newTop, 300);
    }
  };

  handlePagesScroll = (event) => {
    if (!this.props.isPdf || isMobile()) return;

    const { scrollTop, offsetHeight } = event.currentTarget;
    const topLimit = scrollTop - offsetHeight;
    const bottomLimit = scrollTop + offsetHeight * 2;
    const visiblePages = [];
    this.state.coordinates.forEach((coordinate, index) => {
      if (coordinate.top >= topLimit && visiblePages[0] === undefined) visiblePages[0] = index;
      if (coordinate.top <= bottomLimit) visiblePages[1] = index;
    });
    this.setState({ visiblePages });
  };

  resizePanel = async (event) => {
    await mainActions.resizePanel(event, 'previewView.multipage');
    if (this.isMounted && this.props.isPdf && !isMobile()) {
      this.setState({ coordinates: calculatePageCoordinates(this.props.pages) });
    }
  };

  render() {
    const { props, state } = this;
    const lastPage = state.coordinates[state.coordinates.length - 1];
    const pagesHeight = lastPage ? lastPage.top + lastPage.height : 'auto';

    return (
      <div
        className={cn('multipageViewPages', { hidePanel: !props.showMultipagePanel })}
        style={{ width: getPanelWidth() }}
        onScroll={props.pages[0].page ? this.handlePagesScroll : null}
        ref={this.wrapper}
      >
        <div className="panelResizer" onMouseDown={this.resizePanel} />
        <div
          className={cn('listPages', { absolute: pagesHeight !== 'auto' })}
          ref={this.list}
          style={{ height: pagesHeight }}
        >
          {props.pages.map((page, index) => {
            if (page.url || isMobile()) {
              /** render img */
              return (
                <ImgItem
                  key={(page.name || '') + page.url}
                  isActive={props.activePageNumber === index + 1}
                  number={index + 1}
                  total={props.pages.length}
                  name={page.name}
                  url={page.url}
                  onClick={props.onClick}
                  onImageLoaded={props.onImageLoaded}
                  onImageLoadStart={props.onImageLoadStart}
                  imagesLoaded={props.imagesLoaded}
                  markers={state.combinedMarkers.filter(
                    (marker) => Number(marker.page) === index + 1,
                  )}
                />
              );
            }
            /** render canvas */
            return index >= state.visiblePages[0] && index <= state.visiblePages[1] ? (
              <CanvasItem
                key={(page.name || '') + index}
                coordinates={state.coordinates[index]}
                isActive={props.activePageNumber === index + 1}
                number={index + 1}
                page={page}
                total={props.pages.length}
                onClick={props.onClick}
                markers={state.combinedMarkers.filter(
                  (marker) => Number(marker.page) === index + 1,
                )}
              />
            ) : null;
          })}
        </div>
      </div>
    );
  }
}
export default Pages;

function getPanelWidth() {
  const panelWidth = utils.LocalStorage.get('picsio.panelsWidth');
  return panelWidth && panelWidth.previewView.multipage ? panelWidth.previewView.multipage : 200;
}

function calculatePageCoordinates(pages) {
  const panelWidth = getPanelWidth();
  return pages.reduce((coordinates, page, index) => {
    const ratio = page.width / page.height;
    if (index === 0) {
      coordinates.push({
        top: 0,
        height: (panelWidth - PANEL_HORIZONTAL_PADDINGS) / ratio + PAGE_VERTICAL_PADDINGS,
      });
    } else {
      coordinates.push({
        top: coordinates[index - 1].top + coordinates[index - 1].height,
        height: (panelWidth - PANEL_HORIZONTAL_PADDINGS) / ratio + PAGE_VERTICAL_PADDINGS,
      });
    }
    return coordinates;
  }, []);
}
