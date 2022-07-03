import React from 'react'; // eslint-disable-line
import { array } from 'prop-types';
import Map from '../../map';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';

const DetailsMap = ({ collection }) => {
  const locations = [];
  collection.forEach((asset) => {
    if (asset.meta && utils.isNumber(asset.meta.GPSLatitude) && utils.isNumber(asset.meta.GPSLongitude)) {
      locations.push({
        lat: Number(asset.meta.GPSLatitude),
        lng: Number(asset.meta.GPSLongitude),
      });
    }
  });

  /** if no locations - show placeholder */
  if (locations.length === 0) { return <div className="detailsPanel__placeholder">{localization.DETAILS.panelPlaceholderNoCoordinates}</div>; }
  /** else - show map */
  return <Map locations={locations} />;
};

DetailsMap.propTypes = {
  collection: array,
};

export default DetailsMap;
