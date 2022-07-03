import React from 'react';
import PropTypes from 'prop-types';
// import picsioConfig from '../../../../../../../config';

const VideoSlider = (props) => {
  const {
    isCheckedAttachTime,
    paused,
    marginLeft,
    marginRight,
    handleMouseDownCommentRangeEnd,
    handleMouseDownCommentRangeStart,
    noProofingAccess,
  } = props;

  if (noProofingAccess) {
    return null;
  }

  return (
    <If condition={isCheckedAttachTime && paused}>
      <div className="commentsRangeContainer">
        <div style={{ marginRight, marginLeft }} className="commentsRangeControls">
          <div
            className="control left"
            onMouseDown={handleMouseDownCommentRangeStart}
          >
            [
          </div>
          <div className="commentsRangeIndicatorContainer">
            <div className="dot" />
            <div className="commentIndicator" />
          </div>
          <div
            className="control right"
            onMouseDown={handleMouseDownCommentRangeEnd}
          >
            ]
          </div>
        </div>
      </div>
    </If>
  );
};

VideoSlider.defaultProps = {
  paused: false,
};

VideoSlider.propTypes = {
  isCheckedAttachTime: PropTypes.bool.isRequired,
  paused: PropTypes.bool,
  marginLeft: PropTypes.number.isRequired,
  marginRight: PropTypes.number.isRequired,
  handleMouseDownCommentRangeEnd: PropTypes.func.isRequired,
  handleMouseDownCommentRangeStart: PropTypes.func.isRequired,
  noProofingAccess: PropTypes.bool.isRequired,
};

export default VideoSlider;
