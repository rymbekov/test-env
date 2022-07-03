import React from 'react';
import PropTypes from 'prop-types';
import Logger from '../../../services/Logger';

const WatermarkPosition = (props) => {
  const {
    handleChange, positions, selected,
  } = props;
  const res = Object.keys(positions);
  return (
    <div className="watermarkPosition">
      Position
      <div
        className="dotItems"
        onClick={() => Logger.log('User', 'WatermarkNewImagePositionChanged')}
      >
        {
          res.map((position) => (
            <div
              className="watermarkDot"
              style={{ background: position === selected ? '#FFCC00' : '' }}
              key={position}
              onClick={() => handleChange({ position, value: 'position' })}
            />
          ))
        }
      </div>
    </div>
  );
};

WatermarkPosition.defaultProps = {
  selected: '',
  positions: {},
};
WatermarkPosition.propTypes = {
  handleChange: PropTypes.func.isRequired,
  positions: PropTypes.objectOf(PropTypes.any),
  selected: PropTypes.string,
};

export default WatermarkPosition;
