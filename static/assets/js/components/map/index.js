/* global L */
import React from 'react';

import { Map, TileLayer } from 'react-leaflet';
import 'leaflet.markercluster';

class LeafletMap extends React.Component {
  constructor(props) {
    super(props);
    this.mapInstance = React.createRef();

    this.state = {
      locations: [],
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.locations !== state.locations) {
      return {
        locations: props.locations,
      };
    }

    return null;
  }

  componentDidMount() {
    this.map = this.mapInstance.current && this.mapInstance.current.leafletElement;
    this.bounds = new L.LatLngBounds();

    this.setMarkers(this.state.locations);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.locations !== this.props.locations) {
      this.markerCluster.clearLayers();
      this.setMarkers(this.props.locations);
    }
  }

  setMarkers(locations) {
    locations.map((location) => {
      const loc = new L.LatLng(location.lat, location.lng);
      this.bounds.extend(loc);
    });

    if (locations.length > 1) {
      this.map.fitBounds(this.bounds, { padding: [20, 20] });
    } else if (locations.length === 1) {
      this.map.setView({ lat: locations[0].lat, lng: locations[0].lng }, 8);
    }
    this.markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      singleMarkerMode: false,
      spiderfyOnMaxZoom: false,
    });

    this.state.locations.forEach((asset) => {
      const icon = L.divIcon({
        html: '<div class="marker-pin"></div>',
        className: 'marker-default',
        iconSize: L.point(43, 43),
      });
      const marker = L.marker(new L.LatLng(asset.lat, asset.lng), { icon });
      this.markerCluster.addLayer(marker);
    });

    this.map.addLayer(this.markerCluster);
  }

  render() {
    return (
      <Map ref={this.mapInstance} className="map" center={[51.0, 19.0]} zoom={4} maxZoom={18}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </Map>
    );
  }
}

export default LeafletMap;
