import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { EmojiPickerToggler, Icon } from '@picsio/ui';
import { Timer } from '@picsio/ui/dist/icons';

import * as utils from '../../../shared/utils';

import { Checkbox } from '../../../UIComponents';

import ua from '../../../ua';
import localization from '../../../shared/strings';
import Tooltip from '../../Tooltip';

const HistoryViewBottomBar = (props) => {
  const {
    videoElement: getVideoElement,
    tmpMarkers,
    markersDisabled,
    markersLocked,
    onClickAddMarker,
    isDisabledAttachTime,
    isCheckedAttachTime,
    onChangeCheckboxAttachtime,
    isAllowedApproving,
    isApproveDisabled,
    isApproved,
    onChangeApprove,
    selectEmoji,
    isCommentsNotAllowed,
  } = props;
  const isMobile = ua.browser.isNotDesktop();
  const markerTooltip = markersLocked
    ? localization.HISTORY.tooltipAddMarkersLocked
    : localization.HISTORY.tooltipAddMarkers;

  const videoElement = getVideoElement();

  return (
    <div className="historyView__bottombar">
      <div className={cn('leftTools', { isNotAllowed: isCommentsNotAllowed })}>
        <div className="leftTools__top">
          {!markersDisabled && !isMobile && (
            <div className="toolMarkers">
              <div className="wrapperSettedMarkers">
                {tmpMarkers.map((marker) => (
                  <div key={marker.number} className="itemTmpMarker">
                    {marker.number}
                  </div>
                ))}
                <Tooltip content={markerTooltip} placement="top">
                  <div
                    className={cn('btnAddMarker', { disabled: markersLocked })}
                    onClick={onClickAddMarker}
                  >
                    <span className="btnAddMarkerCircle">+</span>
                  </div>
                </Tooltip>
              </div>
            </div>
          )}
          <Tooltip content="Emoji" placement="top">
            <span>
              <EmojiPickerToggler onSelect={selectEmoji} iconSize="xl" />
            </span>
          </Tooltip>
        </div>
        <div className="leftTools__bottom">
          {videoElement && (
            <div className="checkboxVideoCurrentTime">
              <If condition={!isCheckedAttachTime}>
                <Checkbox
                  disabled={isDisabledAttachTime}
                  label="Attach time"
                  value={isCheckedAttachTime}
                  onChange={onChangeCheckboxAttachtime}
                />
              </If>
              <If condition={isCheckedAttachTime}>
                <Icon size="md" className="historyTimeRangeMargin">
                  <Timer />
                </Icon>
                <div className="historyTimeRangeMargin">
                  <If condition={videoElement.paused}>
                    <div>{utils.parseTime(props.commentTimeRange[0])}</div>
                  </If>
                  <If condition={!videoElement.paused}>
                    <div>{utils.parseTime(videoElement?.currentTime)}</div>
                  </If>
                  <If condition={Math.floor(props.commentTimeRange[0]) !== Math.floor(props.commentTimeRange[1])}>
                    - <div>{utils.parseTime(props.commentTimeRange[1])}</div>
                  </If>
                </div>
                <Checkbox
                  disabled={isDisabledAttachTime}
                  value={isCheckedAttachTime}
                  onChange={onChangeCheckboxAttachtime}
                />
              </If>
            </div>
          )}
        </div>
      </div>
      <div className="rightTools">
        {isAllowedApproving && (
          <Checkbox
            slide
            label={localization.HISTORY.approve}
            inProgress={isApproveDisabled}
            value={isApproved}
            onChange={onChangeApprove}
          />
        )}
      </div>
    </div>
  );
};

HistoryViewBottomBar.defaultProps = {
  videoElement: null,
  tmpMarkers: [],
};
HistoryViewBottomBar.propTypes = {
  videoElement: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
  tmpMarkers: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      createdAt: PropTypes.number,
      number: PropTypes.number,
    }),
  ),
  markersDisabled: PropTypes.bool.isRequired,
  markersLocked: PropTypes.bool.isRequired,
  onClickAddMarker: PropTypes.func.isRequired,
  isDisabledAttachTime: PropTypes.bool.isRequired,
  isCheckedAttachTime: PropTypes.bool.isRequired,
  onChangeCheckboxAttachtime: PropTypes.func.isRequired,
  isAllowedApproving: PropTypes.bool.isRequired,
  isApproveDisabled: PropTypes.bool.isRequired,
  isApproved: PropTypes.bool.isRequired,
  onChangeApprove: PropTypes.func.isRequired,
  selectEmoji: PropTypes.func.isRequired,
  isCommentsNotAllowed: PropTypes.bool.isRequired,
};

export default HistoryViewBottomBar;
