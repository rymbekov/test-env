/* global L */
import React from 'react';
import {
  func, array, object, objectOf,
} from 'prop-types';
import { Marker, Popup } from 'react-leaflet';
import cn from 'classnames';
import Carousel from './Carousel';
import Logger from '../../services/Logger';

const PRELOAD_ITEMS_COUNT = 30;
const DIFF_ITEMS_INDEX_TO_START_LOAD_NEXT = 5;

class Cluster extends React.PureComponent {
  /** propTypes */
  static propTypes = {
    position: array,
    flyTo: func,
    properties: object,
    assets: array,
    storeItems: array,
    assetsActions: objectOf(func),
  };

  notLoadedAssets = {};

  state = {
    assets: [],
    prevStoreItems: null,
    popupBottom: true,
  };

  static getDerivedStateFromProps(props, state) {
    if (state.prevPropsAssets !== props.assets || state.prevStoreItems !== props.storeItems) {
      return {
        assets: props.ids.map((id) => props.storeItems.find((item) => item._id === id)).filter(Boolean),
        prevStoreItems: props.storeItems,
      };
    }
    return null;
  }

  getIcon = () => {
    const { props } = this;
    const count = props.properties.point_count;
    const size = count < 100 ? 'small' : count < 1000 ? 'medium' : 'large';
    return L.divIcon({
      html: `<div><span>${props.properties.point_count_abbreviated}</span></div>`,
      className: `marker-cluster marker-cluster-${size}`,
      iconSize: L.point(40, 40),
    });
  };

  handleClusterClick = (e) => {
    Logger.log('User', 'MapViewClusterClick');
    const { props, state } = this;
    if (props.ids.length) {
      let popupBottom = false;
      if (e.layerPoint.y < 250 && e.containerPoint.y < 250) {
        popupBottom = true;
      }
      this.setState({ popupBottom });
    }

    if (props.ids.length && !state.assets.length) {
      Logger.log('UI', 'MapViewCarouselShow');
      if (props.ids.length > PRELOAD_ITEMS_COUNT) {
        this.fillNotLoadedAssetsObj();
        if (this.notLoadedAssets[0]) {
          props.assetsActions.getAssetsByIds(this.notLoadedAssets[0]);
          this.notLoadedAssets[0] = undefined;
        }
      } else {
        props.assetsActions.getAssetsByIds(props.ids);
      }
      return;
    }
    if (state.assets.length === 0) {
      /* zoom map only if no assets described */
      props.flyTo([props.position[1], props.position[0]], props.properties.zoom);
    }
  };

  fillNotLoadedAssetsObj = () => {
    if (this.props.ids.length) {
      if (Object.entries(this.notLoadedAssets).length === 0) {
        const ids = [...this.props.ids];
        this.props.ids.forEach((id, index) => {
          if (index % PRELOAD_ITEMS_COUNT === 0) {
            this.notLoadedAssets[index] = ids.slice(index, index + PRELOAD_ITEMS_COUNT);
          }
        });
      }
    }
  };

  handleChangeSlide = (index) => {
    const startIndexOfNotLoadedAssets = index + DIFF_ITEMS_INDEX_TO_START_LOAD_NEXT;
    if (index && this.notLoadedAssets[startIndexOfNotLoadedAssets]) {
      this.props.assetsActions.getAssetsByIds(this.notLoadedAssets[startIndexOfNotLoadedAssets]);
      this.notLoadedAssets[startIndexOfNotLoadedAssets] = undefined;
    }
  };

  render() {
    const { props, state } = this;
    return (
      <Marker position={[props.position[1], props.position[0]]} icon={this.getIcon()} onClick={this.handleClusterClick}>
        {props.ids.length > 0 && (
          <Popup autoPan={!state.popupBottom} className={cn('popupContent', { popupBottom: state.popupBottom })}>
            <Carousel
              assets={state.assets}
              ids={props.ids}
              assetsActions={props.assetsActions}
              onChangeSlide={this.handleChangeSlide}
            />
          </Popup>
        )}
      </Marker>
    );
  }
}

export default Cluster;
