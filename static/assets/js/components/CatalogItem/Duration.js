import React, { memo } from 'react';
import PropTypes from 'prop-types';
import * as utils from '../../shared/utils';

function Duration(props) {
  const { duration } = props;
  const durationInSeconds = utils.hmsToSecondsOnly(duration);
  const normalizedDuration = utils.parseTime(durationInSeconds);

  return <div className="catalogItem__duration">{normalizedDuration}</div>;
}

Duration.propTypes = {
  duration: PropTypes.string.isRequired,
};

export default memo(Duration);
