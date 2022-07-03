import React, { memo } from 'react';
import PropTypes from 'prop-types';
import * as utils from '../../shared/utils';

function VideoProgress(props) {
  const { progress, duration } = props;
  const durationInSeconds = utils.hmsToSecondsOnly(duration);
  const progressInPercents = (100 / durationInSeconds) * progress;

  return (
    <div className="catalogItem__videoProgress">
      <div
        className="catalogItem__videoProgress-bar"
        style={{ width: `${progressInPercents}%` }}
       />
    </div>
  );
}

VideoProgress.propTypes = {
  duration: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
};

export default memo(VideoProgress);
