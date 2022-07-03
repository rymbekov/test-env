import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import styled from 'styled-components';
import isEqual from 'lodash.isequal';
import isEmpty from 'lodash.isempty';
import cn from 'classnames';
import ErrorBoundary from '../ErrorBoundary';
import localization from '../../shared/strings';
import picsioConfig from '../../../../../config';
import ua from '../../ua';
import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';
import RecursiveSearchPanel from '../recursiveSearchPanel';
import NotificationPanel from '../notificationPanel';
import calculateGrid from './helpers/grid';
import getRange from './helpers/getRange';
import CatalogItem from '../CatalogItem';
import Spinner from './Spinner';
import PullToRefresh from '../PullToRefresh';
// import Placeholder from '../import/Placeholder';
import PlaceholderEmpty from './PlaceholderEmpty';
import PlaceholderNotAllowedCollections from './PlaceholderNotAllowedCollections';
import {
  setSearchRoute,
  navigateToRoot,
  isRouteFiltering,
  isRouteSearch,
} from '../../helpers/history';

const {
  collectionUpdated,
  inboxUpdated,
  searchByLocationEnabled,
} = localization.CATALOG_VIEW.notifications;

class CatalogView extends React.Component {
  lastScrollTop = 0;

  recursiveSearchPanelHeight = 0;

  notificationPanelHeight = 0;

  memoizedCalculateGrid = memoize(calculateGrid);

  memoizedGetRange = memoize(getRange);

  $innerCatalog = React.createRef();

  $wrapperTiles = React.createRef();

  $iframe = React.createRef();

  recursiveSearchPanel = React.createRef();

  notificationPanel = React.createRef();

  state = {
    wrapperHeight: 0,
    startVisibleIndex: 0,
    visibleItems: [],
    itemsStyles: [],
    changedTags: [],
    searchQuery: {},

    recursiveSearchPanelCollapse: false,
    isNotificationsReceive: false,
    notificationText: '',
    notificationIcon: 'sync',

    activeCollectionID: null,
    activeInboxID: null,
  };

  componentDidMount() {
    window.addEventListener('catalog:scrollToTop', this.scrollToTop, false);
    window.addEventListener('images:dropped', this.delayedGetGrid, false);
    this.$innerCatalog.current.addEventListener('scroll', this.scrollListener);
    this.$iframe.current.contentWindow.addEventListener('resize', this.delayedGetGrid);
    if (this.props.searchQuery) this.handleChangeSearchRoute(this.props.searchQuery);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { archived } = nextProps.searchQuery;

    if (
      isRouteSearch()
      && !isEmpty(nextProps.searchQuery)
      && !isEqual(nextProps.searchQuery, prevState.searchQuery)
    ) {
      return {
        searchQuery: nextProps.searchQuery,
      };
    }

    if (
      JSON.stringify(nextProps.changedTags) !== JSON.stringify(prevState.changedTags)
      && (nextProps.changedTags.includes(prevState.activeCollectionID)
        || nextProps.changedTags.includes(prevState.activeInboxID))
    ) {
      return {
        changedTags: nextProps.changedTags,
        isNotificationsReceive: true,
        notificationsPanelCollapse: false,
        notificationText: prevState.activeCollectionID ? collectionUpdated : inboxUpdated,
        notificationIcon: 'sync',
      };
    }

    if (
      (prevState.isNotificationsReceive !== true
        && nextProps.activeCollectionID !== prevState.activeCollectionID)
      || nextProps.activeInboxID !== prevState.activeInboxID
    ) {
      return {
        activeCollectionID: nextProps.activeCollectionID,
        activeInboxID: nextProps.activeInboxID,
        recursiveSearchPanelCollapse: false,
        isNotificationsReceive: false,
      };
    }

    if (archived && nextProps.changedTags.includes(nextProps.activeArchivedCollectionId)) {
      this.setState({
        isNotificationsReceive: true,
        notificationsPanelCollapse: false,
        notificationText: collectionUpdated,
        notificationIcon: 'sync',
      });
    }

    return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { props, state } = this;
    // this case for archive assets
    if (state.visibleItems.length > nextState.visibleItems.length) {
      return true;
    }
    // this case for delete assets
    if (state.visibleItems.length > props.assets.length) {
      return null;
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const { state, props } = this;
    if (
      isRouteSearch()
      && (!isEmpty(props.searchQuery) && !isEqual(props.searchQuery, prevState.searchQuery))
    ) {
      this.handleChangeSearchRoute(props.searchQuery);
      return;
    }

    if (
      prevProps.catalogViewMode !== props.catalogViewMode
      || prevProps.assets.length !== props.assets.length
      || prevProps.catalogViewItemSize !== props.catalogViewItemSize
    ) {
      if (props.assets.length > 0) {
        return this.getGrid();
      }
    }

    if (prevProps.assets !== props.assets) {
      this.findVisibleItems();
    }
    if (
      this.lastScrollTop === 0
      && /** items not scrolled */ prevState.visibleItems.length !== state.visibleItems.length
      && /** received new assets */ state.visibleItems.length === props.assets.length
      && /** all assets is visible */ props.tmpItemIDsLength !== props.assets.length
      && /** if assets in store is not a temporary */ !props.full
      && /** next page exists */ props.isLoaded /** next page is not loading */
    ) {
      /** Load next page */

      props.assetsActions.getAssets();
    }

    return null;
  }

  componentWillUnmount() {
    window.removeEventListener('catalog:scrollToTop', this.scrollToTop, false);
    window.removeEventListener('images:dropped', this.delayedGetGrid, false);
    this.$innerCatalog.current.removeEventListener('scroll', this.scrollListener);
    this.$iframe.current.contentWindow.removeEventListener('resize', this.delayedGetGrid);
  }

  scrollListener = () => {
    const { isLoaded, full, assetsActions } = this.props;
    this.findVisibleItems();
    const { $innerCatalog, state } = this;

    const translateY = 0;
    // Scroll up and down
    const panelHeight = 40;
    const scrollTop = $innerCatalog.current.scrollTop - translateY;
    const windowHeight = window.innerHeight;
    const wrapperTilesHeight = this.$wrapperTiles.current && this.$wrapperTiles.current.clientHeight;
    this.setPanelState(
      scrollTop,
      this.lastScrollTop,
      windowHeight,
      wrapperTilesHeight,
      panelHeight,
    );

    this.lastScrollTop = scrollTop;

    if (!isLoaded || state.wrapperHeight === 0) return;

    if (!full) {
      if (scrollTop >= state.wrapperHeight - window.innerHeight * 2) {
        assetsActions.getAssets();
      }
    }
  };

  setPanelState = (scrollTop, lastScrollTop, windowHeight, wrapperTilesHeight, panelHeight) => {
    if (
      (this.recursiveSearchPanel && this.recursiveSearchPanel.current)
      || (this.notificationPanel && this.notificationPanel.current)
    ) {
      // Scroll Down
      if (scrollTop > lastScrollTop && scrollTop > panelHeight) {
        if (this.state.recursiveSearchPanelCollapse === false) {
          this.setState({
            recursiveSearchPanelCollapse: true,
            notificationsPanelCollapse: true,
          });
        }
      }
      // Scroll Up
      if (scrollTop + windowHeight < wrapperTilesHeight) {
        if (this.state.recursiveSearchPanelCollapse === true) {
          this.setState({
            recursiveSearchPanelCollapse: false,
            notificationsPanelCollapse: false,
          });
        }
      }
    }
  };

  handleChangeSearchRoute = (search) => {
    const catalogViewMode = utils.LocalStorage.get('picsio.catalogViewMode') || 'grid';
    if (catalogViewMode !== 'geo') {
      const { bbox, zoom } = search;
      if (bbox && zoom) {
        this.setState({
          wrapperHeight: 0,
          startVisibleIndex: 0,
          visibleItems: [],
          itemsStyles: [],
          changedTags: [],
          isNotificationsReceive: true,
          notificationsPanelCollapse: false,
          notificationText: searchByLocationEnabled,
          notificationIcon: 'globe',
        });
      } else {
        /** reset view */
        this.setState({
          wrapperHeight: 0,
          startVisibleIndex: 0,
          visibleItems: [],
          itemsStyles: [],
          changedTags: [],
          isNotificationsReceive: false,
        });
      }
    }
  };

  getGrid = () => {
    const { wrapperHeight, itemsStyles } = this.memoizedCalculateGrid(
      this.props.assets,
      this.$wrapperTiles.current.offsetWidth,
      this.props.catalogViewMode === 'list',
      this.props.catalogViewItemSize || 1,
    );

    if (this.recursiveSearchPanel.current) {
      this.recursiveSearchPanelHeight = this.recursiveSearchPanel.current.clientHeight;
    }
    if (this.notificationPanel.current) {
      this.notificationPanelHeight = this.notificationPanel.current.clientHeight;
    }

    this.setState({ wrapperHeight, itemsStyles }, this.findVisibleItems);
  };

  // eslint-disable-next-line react/sort-comp
  delayedGetGrid = setTimeout.bind(window, this.getGrid, 10);

  scrollToTop = () => {
    this.$innerCatalog.current.scrollTop = 0;
  };

  updateVisibleItems = (range, assets) => {
    const visibleItems = assets.slice(range[0], range[1] + 1);
    this.setState({ visibleItems, startVisibleIndex: range[0] });
  };

  findVisibleItems = () => {
    const { itemsStyles = [] } = this.state;
    const { scrollTop } = this.$innerCatalog.current;
    const topLimit = scrollTop - window.innerHeight * 2;
    const bottomLimit = scrollTop + window.innerHeight * 2;

    const range = this.memoizedGetRange(itemsStyles, topLimit, bottomLimit);
    this.updateVisibleItems(range, this.props.assets);
  };

  goToRoot = () => {
    navigateToRoot();
    this.props.mainActions.changeTree('collections', picsioConfig.isProofing());
  };

  onChangeUpload = (event) => {
    Logger.log('User', 'UploadFilesInEmptyCollectionClicked');
    const { files } = event.target;
    if (files && files.length > 0) {
      window.dispatchEvent(new CustomEvent('importPanel:add', { detail: files }));
      event.target.value = '';
    }
  };

  refreshCatalog = () => {
    const { searchQuery } = this.props;
    this.setState({
      isNotificationsReceive: false,
    });
    if (searchQuery.bbox && searchQuery.zoom) {
      delete searchQuery.bbox;
      delete searchQuery.zoom;
      setSearchRoute(searchQuery); // @TODO: fix with keywords and etc.
      this.props.mainActions.setMapViewport(null);
      return;
    }
    this.props.notificationsActions.clearChangedTagsIds();
    this.props.assetsActions.getAssets(true);
  };

  notificationPanelClose = () => {
    this.setState({
      isNotificationsReceive: false,
    });
  };

  handleRefresh = async () => {
    Logger.log('User', 'CatalogPullRefresh');
    this.props.assetsActions.getAssets(true);
  };

  expandPanel = () => {
    this.setState({ recursiveSearchPanelCollapse: false });
  };

  getMessage = () => {
    let message;
    const { props } = this;
    if (props.isLoaded && props.assets.length === 0) {
      if (picsioConfig.isProofing()) {
        if (isRouteFiltering()) {
          message = localization.NO_PHOTO_IN_SEARCH;
        } else if (props.searchQuery.tagId) {
          message = localization.NO_PHOTO_IN_PROOFING_COLLECTION;
        } else {
          message = localization.NO_PHOTO_IN_PROOFING_TEMPLATE;
        }
      } else if (isRouteFiltering()) {
        message = localization.NO_PHOTO_IN_SEARCH;
      } else if (!props.isAllowedUpload) {
        message = localization.NO_PHOTO_IN_COLLECTION_WITHOUT_UPLOAD;
      } else if (props.searchQuery.lightboardId) {
        message = localization.NO_PHOTO_IN_LIGHTBOARD;
      } else if (props.notRecursiveSearch && props.activeCollectionHasChild) {
        message = localization.NO_PHOTO_IN_COLLECTION_RECURSIVE;
      } else {
        message = localization.NO_PHOTO_IN_COLLECTION;
      }
    }
    return message;
  };

  render() {
    const { state, props } = this;
    const {
      assets,
      catalogViewMode,
      catalogViewItemSize,
      assetsActions,
      isLoaded,
      full,
      uiBlocked,
      user,
      isAllowedUpload,
      isMobileView,
      searchQuery,
    } = props;
    const { tagId, lightboardId } = searchQuery;
    const { recursiveSearchPanelCollapse } = state;
    const isRecursiveSearchPanelVisible = Boolean(
      this.recursiveSearchPanel && this.recursiveSearchPanel.current,
    );
    const isNotificationPanelVisible = Boolean(
      this.notificationPanel && this.notificationPanel.current,
    );
    const stylesNotifications = state.notificationsPanelCollapse && isNotificationPanelVisible
      ? { transform: `translate3d(0, ${-this.notificationPanelHeight + 3}px, 0)` }
      : {};

    // const message = this.getMessage();

    const isLightboardsView = !!lightboardId;
    const size = catalogViewItemSize && catalogViewItemSize.toString().replace('.', '_');
    return (
      <PullToRefresh
        onRefresh={this.handleRefresh}
        spinnerSize={30}
        spinnerColor="var(--secondary-contrast-color)"
        refreshDuration={0}
        shouldPullToRefresh={() => this.$innerCatalog.current.scrollTop <= 0}
        disabled={window.innerWidth > 1024}
        childrenWrapperClassName="pullToRefreshWrapper"
      >
        <>
          <If
            condition={
              picsioConfig.isMainApp()
              && searchQuery.trashed !== 'true'
              && !state.isNotificationsReceive
              && (props.activeCollectionID !== null || state.isNotificationsReceive)
            }
          >
            <RecursiveSearchPanel
              customRef={this.recursiveSearchPanel}
              activeCollectionHasChild={props.activeCollectionHasChild}
              notRecursiveSearch={props.notRecursiveSearch}
              recursiveSearchToggle={props.collectionsActions.recursiveSearchToggle}
              id={props.activeCollectionID}
              expand={this.expandPanel}
              recursiveSearchPanelCollapse={recursiveSearchPanelCollapse}
              isRecursiveSearchPanelVisible={isRecursiveSearchPanelVisible}
              recursiveSearchPanelHeight={this.recursiveSearchPanelHeight}
            />
          </If>
          <If condition={state.isNotificationsReceive}>
            <NotificationPanel
              customRef={this.notificationPanel}
              panelHeight={this.notificationPanelHeight}
              refresh={this.refreshCatalog}
              text={state.notificationText}
              icon={state.notificationIcon}
              styles={stylesNotifications}
              close={this.notificationPanelClose}
            />
          </If>

          <InnerCatalog
            ref={this.$innerCatalog}
            className="innerCatalog"
            isNotificationsReceive={state.isNotificationsReceive}
            notificationsPanelCollapse={state.notificationsPanelCollapse}
            isNotificationPanelVisible={isNotificationPanelVisible}
            notificationPanelHeight={this.notificationPanelHeight}
            recursiveSearchPanelCollapse={recursiveSearchPanelCollapse}
            isRecursiveSearchPanelVisible={isRecursiveSearchPanelVisible}
            recursiveSearchPanelHeight={this.recursiveSearchPanelHeight}
          >
            <div ref={this.$wrapperTiles} className="wrapperTiles">
              <Tiles
                id="tiles"
                className={cn(`catalogView_${catalogViewMode}`, catalogViewItemSize && `catalogViewSize_${size}`)}
                visibleItemsLength={state.visibleItems.length}
                wrapperHeight={state.wrapperHeight}
              >
                <iframe
                  className="tilesIframe"
                  title="resizer"
                  tabIndex="-1"
                  frameBorder="0"
                  ref={this.$iframe}
                />
                <Choose>
                  <When condition={isLoaded && assets.length === 0}>
                    <>
                      <Choose>
                        <When
                          condition={
                            picsioConfig.isMainApp() && !user.isAllowedCollections && tagId
                          }
                        >
                          <PlaceholderNotAllowedCollections />
                        </When>
                        <Otherwise>
                          <PlaceholderEmpty />
                          {/* <>
                            <Choose>
                              <When condition={isAllowedUpload}>
                                <div className="emptyCollectionPlaceholder">
                                  <Placeholder onChange={this.onChangeUpload} />
                                </div>
                              </When>
                              <Otherwise>
                                <div className="emptyCollection">
                                  <div
                                    className="textEmptyCollection"
                                    dangerouslySetInnerHTML={{
                                      __html: utils.sanitizeXSS(message),
                                    }}
                                  />
                                </div>
                              </Otherwise>
                            </Choose>
                          </> */}
                        </Otherwise>
                      </Choose>
                    </>
                  </When>
                  <Otherwise>
                    {state.visibleItems.map((asset, index) => (
                      <ErrorBoundary
                        className="catalogItem"
                        key={asset._id}
                        styles={state.itemsStyles[state.startVisibleIndex + index] || null}
                      >
                        <CatalogItem
                          isLightboardsView={isLightboardsView}
                          asset={asset}
                          number={state.startVisibleIndex + index + 1}
                          styles={state.itemsStyles[state.startVisibleIndex + index] || {}}
                          isListViewMode={catalogViewMode === 'list'}
                          assetsActions={assetsActions}
                          isMobileView={isMobileView}
                          isOdd={!((state.startVisibleIndex + index) % 2)}
                        />
                      </ErrorBoundary>
                    ))}
                  </Otherwise>
                </Choose>

                {/* for dragNdrop */}
                <div
                  className={`cursorReorderImages${
                    catalogViewMode === 'list' ? ' cursorForCatalogViewMode' : ''
                  }`}
                />

                {/* Load more */}
                <If condition={!full || uiBlocked}>
                  <Spinner big={!!uiBlocked} />
                </If>
              </Tiles>
            </div>
          </InnerCatalog>
        </>
      </PullToRefresh>
    );
  }
}

const Tiles = styled.div`
  height: ${(props) => (props.visibleItemsLength > 0
    ? `${props.wrapperHeight}px`
    : `calc(100vh - 50px - ${ua.browser.isNotDesktop() ? '56px' : '0px'})`)};
`;

const InnerCatalog = styled.div`
  transform: ${(props) => (props.isNotificationsReceive
    && props.notificationsPanelCollapse
    && props.isNotificationPanelVisible
    ? `translate3d(0, ${-props.notificationPanelHeight + 3}px, 0)`
    : props.recursiveSearchPanelCollapse && props.isRecursiveSearchPanelVisible
      ? `translate3d(0, ${-props.recursiveSearchPanelHeight + 3}px, 0)`
      : 'translate3d(0, 0, 0)')};
`;

CatalogView.defaultProps = {
  uiBlocked: false,
  isMobileView: false,
};

CatalogView.propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  uiBlocked: PropTypes.bool,
  full: PropTypes.bool.isRequired,
  catalogViewMode: PropTypes.string.isRequired,
  catalogViewItemSize: PropTypes.number,
  assets: PropTypes.array.isRequired,
  tmpItemIDsLength: PropTypes.number.isRequired,
  isMobileView: PropTypes.bool,
};

export default CatalogView;
