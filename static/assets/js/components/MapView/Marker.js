/* global L */
import React from 'react';
import {
  func, array, objectOf, string,
} from 'prop-types';
import { Marker, Popup } from 'react-leaflet';
import cn from 'classnames';
import Asset from './Asset';
import Logger from '../../services/Logger';

class AssetMarker extends React.PureComponent {
  /** propTypes */
  static propTypes = {
    position: array,
    assetId: string,
    storeItems: array,
    assetsActions: objectOf(func),
  };

  state = {
    popupBottom: false,
  };

  icon = L.divIcon({
    html: '<div class="marker-pin"></div>',
    className: 'marker-default',
    iconSize: L.point(43, 43),
  });

  handleMarkerClick = (e) => {
    let popupBottom = false;
    if (e.layerPoint.y < 250 && e.containerPoint.y < 250) {
      popupBottom = true;
    }
    this.setState({ popupBottom });
    Logger.log('User', 'MapViewMarkerClick');
  };

  render() {
    const { props, state } = this;
    const asset = props.items.find((item) => item._id === props.assetId);
    return (
      <Marker position={[props.position[1], props.position[0]]} icon={this.icon} onClick={this.handleMarkerClick}>
        <Popup
          autoPan={!state.popupBottom}
          className={cn('popupContent', { popupBottom: state.popupBottom })}
          maxWidth={202}
          minWidth={200}
        >
          {asset && <Asset data={asset} assetsActions={props.assetsActions} />}
        </Popup>
      </Marker>
    );
  }
}

export default AssetMarker;
