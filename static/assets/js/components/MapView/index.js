/* global L */
import React from 'react'; // eslint-disable-line

import {
  Map, TileLayer, LayerGroup, Popup,
} from 'react-leaflet';
import throttle from 'lodash.throttle';
import isEqual from 'lodash.isequal';
import isEmpty from 'lodash.isempty';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ErrorBoundary from '../ErrorBoundary';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';
import ua from '../../ua';
import Logger from '../../services/Logger';
import picsioConfig from '../../../../../config';
import Placeholder from './Placeholder';
import Spinner from './Spinner';
import * as mainActions from '../../store/actions/main';
import * as assetsActions from '../../store/actions/assets';
import * as collectionsActions from '../../store/actions/collections';
import * as notificationsActions from '../../store/actions/notifications';
import * as lightboardsActions from '../../store/actions/lightboards';
import * as keywordsActions from '../../store/actions/keywords';

import * as UtilsLightboards from '../../store/utils/lightboards';

import Marker from './Marker';
import Cluster from './Cluster';
import { isRouteSearch, navigateToRoot, setSearchRoute } from '../../helpers/history';

const fullGeoSearch = {
  zoom: 2,
  bbox: [-180, -90, 180, 90],
};

class MapView extends React.Component {
  firstInit = false;

  isFitting = false;

  isNewRoute = true;

  mapInstance = React.createRef();

  $iframe = React.createRef();

  maxBounds = L.latLngBounds(L.latLng(90, 270), L.latLng(-90, -270));

  viewPortChange = throttle((viewport) => this.onViewportChanged(viewport), 500);

  state = {
    isMapInit: false, // needs for first init MapView
    isLoading: false, // needs for spinner
    zoom: ua.isMobileApp() ? 2 : 1,
    bbox: [],
    dragging: true,
    lastActiveCollectionID: null,
    location: {},

    viewport: this.props.viewport || {
      zoom: 2,
      center: [0, 0],
    },
  };

  constructor(props) {
    super(props);
    this.setRoute();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.location.query) && !isEqual(nextProps.location.query, prevState.location?.query)) {
      return {
        location: nextProps.location,
      };
    }

    if (!prevState.isMapInit) {
      const { bbox, zoom } = nextProps.location.query;
      if (bbox && zoom) {
        return {
          bbox,
          zoom: Number(zoom),
          isMapInit: true,
          lastActiveCollectionID: nextProps.activeCollectionID,
        };
      }
    }

    if (prevState.lastActiveCollectionID === null && nextProps.activeCollectionID) {
      return {
        lastActiveCollectionID: nextProps.activeCollectionID,
      };
    }

    if (!nextProps.isLoaded) {
      return { isLoading: true };
    }

    return null;
  }

  componentDidMount() {
    this.map = this.mapInstance.current && this.mapInstance.current.leafletElement;
    this.$iframe.current.contentWindow.addEventListener('resize', this.resizeListener);
    if (isRouteSearch()) {
      this.handleChangeSearchRoute();
    }
  }

  resizeListener = () => {
    window.dispatchEvent(new Event('resize'));
  };

  componentDidUpdate(prevProps, prevState) {
    const { props } = this;
    if (
      isRouteSearch()
      && (!isEmpty(props.location.query) && !isEqual(props.location.query, prevState.location.query))
      || (!isEmpty(props.location.query) && isEmpty(prevState.location.query))
    ) {
      this.handleChangeSearchRoute();
    }

    if (this.props.geo !== prevProps.geo && this.props.isLoaded) {
      this.setState({ isLoading: false });
    }

    // fitBounds when mapView initialized
    if (!this.firstInit && this.props.geo && this.props.geo.length) {
      if (!this.props.viewport) this.fitBounds(this.props.geo);
      this.firstInit = true;
      return;
    }

    // fitBounds when user changed search by pics.io interface
    if (
      this.props.activeCollectionID !== this.state.lastActiveCollectionID
      && !isEqual(this.props.geo, prevProps.geo)
    ) {
      this.isNewRoute = true;
      this.fitBounds(this.props.geo);
      this.props.geo.length && this.fitBounds(this.props.geo);
      this.setState({ lastActiveCollectionID: this.props.activeCollectionID });
    }
  }

  componentWillUnmount() {
    if (this.$iframe.current) this.$iframe.current.contentWindow.removeEventListener('resize', this.resizeListener);
  }

  fitBounds = (geo) => {
    if (geo.length) {
      if (geo.length === 1) {
        const position = geo[0].geometry.coordinates;
        const zoom = geo[0].properties.zoom > 2 ? geo[0].properties.zoom - 1 : geo[0].properties.zoom;
        this.isFitting = true;
        this.map.setView([position[1], position[0]], zoom);
        this.map.setView([position[1], position[0]], zoom || 2);
      } else {
        let bounds = L.latLngBounds(geo[0].geometry.coordinates);
        geo.forEach((data) => {
          bounds.extend(data.geometry.coordinates);
        });

        bounds = [[bounds._southWest.lng, bounds._southWest.lat], [bounds._northEast.lng, bounds._northEast.lat]];
        this.isFitting = true;
        this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 19 });
      }
    }
  };

  getGeoData = (geoData) => {
    if (!geoData) {
      geoData = fullGeoSearch;
    }
    this.props.assetsActions.getAssets(this.isNewRoute, null, geoData);
    this.isNewRoute = false;
  };

  handleChangeSearchRoute = async () => {
    const { props } = this;
    const {
      lightboardId, tagId, keywords, recursive,
    } = props.location.query;

    if (lightboardId) {
      await this.searchLightboard();
    } else if (tagId) {
      await this.searchCollection();
    } else {
      return;
    }

    props.keywordsActions.setActive(keywords || []);
    props.assetsActions.deselectAll();

    // Recursive search
    if (this.initialUrlRecursive !== null) {
      // get cookie, if checkbox is off - returns true
      const recursiveSearch =				utils.LocalStorage.get('picsio.recursiveSearch') !== null ? utils.LocalStorage.get('picsio.recursiveSearch') : true;

      if (this.initialUrlRecursive === undefined) {
        this.initialUrlRecursive = !recursive; // if url doesn't have "&recursive=false" set initialUrlRecursive to true
      } else if (this.initialUrlRecursive !== recursiveSearch) {
        // if recursiveSearch and initialUrlRecursive aren't equal we set Store "notRecursiveSearch" value from the cookie
        props.collectionsActions.setRecursiveSearch(!recursiveSearch);
        this.initialUrlRecursive = null;
      }
    }

    this.getGeoData(true);
  };

  async searchCollection() {
    const { props } = this;

    // tagId here is required
    // but actually backend search MIGHT work withiut tag
    // this is just frontend problem
    // this restrictions leads us to extra requests to db everywhere when we need to build urls
    // example - notificators
    const { tagId } = props.location.query;

    if (!tagId || tagId.length !== 24) {
      navigateToRoot();
      return;
    }

    try {
      props.collectionsActions.setActiveCollection(tagId);
    } catch (err) {
      navigateToRoot();
      Logger.error(new Error('Error finding collection'), { error: err, collectionId: tagId });
    }
  }

  async searchLightboard() {
    const { props } = this;

    const { lightboardId } = props.location.query;

    if (!lightboardId || lightboardId.length !== 24) {
      navigateToRoot();
      props.mainActions.changeTree('collections', picsioConfig.isProofing());
      return;
    }

    const lightboard = await UtilsLightboards.getLightboardWithId(lightboardId);
    if (!lightboard) {
      navigateToRoot();
      props.mainActions.changeTree('collections', picsioConfig.isProofing());
      return;
    }

    props.lightboardsActions.setActiveLightboard(lightboardId);
  }

  handleMapData = (data) => {
    const {
      zoom, bbox, center, viewport, radius,
    } = data;
    this.props.mainActions.setMapViewport(viewport);
    this.setState({
      zoom, bbox, center, viewport, radius,
    }, () => this.setRoute());
  };

  makeSearchRoute = () => {
    const {
      zoom, bbox, radius, center,
    } = this.state;
    const searchProps = { ...this.props.location.query };

    if (center && radius) {
      delete searchProps.bbox;
      delete searchProps.zoom;
      searchProps.center = [center.lat, center.lng];
      searchProps.radius = radius;
      this.radius = radius;
    }

    if (!radius && zoom) searchProps.zoom = zoom;
    if (!radius && bbox) searchProps.bbox = bbox;

    return searchProps;
  };

  setRoute = () => {
    const { bbox, zoom } = this.props.location.query;
    if (!this.firstInit && (bbox && zoom)) {

    } else {
      setSearchRoute(this.makeSearchRoute());
      if (this.radius) {
        this.props.mainActions.changeCatalogViewMode('grid');
        this.radius = null;
      }
    }
  };

  onViewportChanged = (viewport) => {
    /** in some scenario viewport.zoom && viewport.center may be undefined */
    if (!this.isFitting && !this.isAutopan && viewport.zoom && viewport.center) {
      const bounds = this.map.getBounds();
      const { zoom } = viewport;
      const { center } = viewport;
      const westLng = bounds.getWest().toFixed(4);
      const southLat = bounds.getSouth().toFixed(4);
      const eastLng = bounds.getEast().toFixed(4);
      const northLat = bounds.getNorth().toFixed(4);
      const bbox = [westLng, southLat, eastLng, northLat];

      this.handleMapData({
        zoom, bbox, center, viewport,
      });
    } else {
      this.isFitting = false;
    }
  };

  flyTo = (positions, zoom) => {
    this.map.flyTo(positions, zoom);
  };

  handleAutopanstart = () => {
    this.isAutopan = true;
  };

  handleMovestart = (e) => {
    if (e.target._popup && (!this.isFitting && !this.isAutopan)) {
      this.map.closePopup();
    }
    this.hadleMapPopupClose();
  };

  handleMoveend = () => {
    if (this.isAutopan) {
      setTimeout(() => {
        this.isAutopan = false;
      }, 1500);
    }
  };

  handleMouseout = () => {
    this.setState({ dragging: false });
  };

  handleMouseover = () => {
    if (this.state.dragging) return;
    this.setState({ dragging: true });
  };

  handleMapClick = (e) => {
    if (e.originalEvent.altKey) {
      this.setState({ popupCenter: e.latlng });
      Logger.log('User', 'MapViewClickWithAltKey');
    }
  };

  hadleMapPopupClose = () => {
    if (this.state.popupCenter) this.setState({ popupCenter: null });
  };

  checkIsBboxDefault = () => {
    const { bbox } = this.props.location.query;
    return bbox ? JSON.stringify(fullGeoSearch.bbox) === JSON.stringify(bbox.map((item) => Number(item))) : false;
  };

  render() {
    const { props, state } = this;

    return (
      <>
        <iframe className="geoIframeResizer" ref={this.$iframe} />
        {((props.geo.length < 1 && !props.isLoaded) || state.isLoading) && <Spinner />}
        {props.geo.length === 0 && this.checkIsBboxDefault() && !state.isLoading && (
          <Placeholder text={localization.MAPVIEW.placeholderNoAssets} />
        )}
        <div id="map">
          <Map
            ref={this.mapInstance}
            center={state.center}
            minZoom={1}
            maxZoom={19}
            zoom={state.zoom}
            dragging={state.dragging}
            maxBounds={this.maxBounds}
            onViewportChanged={this.viewPortChange}
            onMouseout={this.handleMouseout}
            onMouseover={this.handleMouseover}
            onClick={this.handleMapClick}
            onAutopanstart={this.handleAutopanstart}
            onMovestart={this.handleMovestart}
            onMoveend={this.handleMoveend}
            viewport={state.viewport}
            closePopupOnClick
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayerGroup>
              {props.geo.map((item) => {
                if (item.properties.cluster) {
                  return (
                    <Cluster
                      key={item.properties.cluster_id}
                      properties={item.properties}
                      position={item.geometry.coordinates}
                      storeItems={props.items}
                      assetsActions={props.assetsActions}
                      flyTo={this.flyTo}
                      ids={item.ids || []}
                    />
                  );
                }

                return (
                  <Marker
                    key={item.properties._id}
                    assetId={item.properties._id}
                    position={item.geometry.coordinates}
                    items={props.items}
                    assetsActions={props.assetsActions}
                  />
                );
              })}
            </LayerGroup>
            {state.popupCenter && (
              <Popup
                className="mapInfoPopup"
                maxWidth={300}
                minWidth={200}
                position={state.popupCenter}
                onClose={this.hadleMapPopupClose}
                autoPan={false}
              >
                Latitude: <b>{state.popupCenter.lat.toFixed(4)}</b>
                <br />
                Longitude: <b>{state.popupCenter.lng.toFixed(4)}</b>
              </Popup>
            )}
          </Map>
        </div>
      </>
    );
  }
}

const ConnectedMapView = connect(
  (state) => ({
    location: state.router.location,
    items: state.assets.items,
    geo: state.assets.geo,
    isLoaded: state.assets.isLoaded,
    selectedItems: state.assets.selectedItems,
    viewport: state.main.mapViewport,
    activeCollectionID: state.collections.activeCollection?._id,
  }),
  (dispatch) => ({
    assetsActions: bindActionCreators(assetsActions, dispatch),
    mainActions: bindActionCreators(mainActions, dispatch),
    collectionsActions: bindActionCreators(collectionsActions, dispatch),
    notificationsActions: bindActionCreators(notificationsActions, dispatch),
    lightboardsActions: bindActionCreators(lightboardsActions, dispatch),
    keywordsActions: bindActionCreators(keywordsActions, dispatch),
  }),
)(MapView);

export default (props) => (
  <ErrorBoundary>
    <ConnectedMapView {...props} />
  </ErrorBoundary>
);
