import React from 'react'; // eslint-disable-line
import Icon from '../../Icon';

export default ({ reason }) => (
  <div className="warning restrictedAsset">
    <div className="warningIcon">
      <Icon name="warningFilled" />
    </div>
    <div className="warningText">{reason}</div>
  </div>
);
