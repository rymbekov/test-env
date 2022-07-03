import React from 'react';
import { string, any, func } from 'prop-types';
import cn from 'classnames';
import * as utils from '../../../../shared/utils';
import Icon from '../../../Icon';
import localization from '../../../../shared/strings';
import { Input } from '../../../../UIComponents';
import { makeVideoScreenshot } from './helpers';
import Tooltip from '../../../Tooltip';

class Crop extends React.Component {
  static propTypes = {
    $video: any,
    src: string,
    assetId: string,
    fileExtension: string,
    setCurrentTime: func,
  };

  $wrapper = React.createRef();

  SMALL_TRACK_WIDTH = 110;

  MIDDLE_TRACK_WIDTH = 210;

  state = {
    screens: [],
    crop: [this.props.$video.duration * 0.2, this.props.$video.duration * 0.8],
    tmpCropValues: [],
  };

  componentDidMount() {
    this.makeTimelineScreenshots();
  }

  makeTimelineScreenshots = () => {
    const { props } = this;
    const { videoWidth, videoHeight, duration } = props.$video;

    let videoRatio = videoWidth / videoHeight;
    /** some video height may be 0 */
    if (isNaN(videoRatio)) videoRatio = 16 / 9;

    const screenshotHeight = 95;
    const screenshotWidth = screenshotHeight * videoRatio;
    const config = {
      $video: props.$video,
      src: props.src,
      width: screenshotWidth,
      height: screenshotHeight,
      quality: 0.75,
      mimeType: 'image/jpeg',
    };
    const screenshotsCount = Math.ceil(this.$wrapper.current.offsetWidth / screenshotWidth);
    const screens = Array(screenshotsCount).fill();
    this.setState({ screens });
    screens.forEach(async (screen, i) => {
      const time = (duration / screenshotsCount) * i;
      const newScreen = await makeVideoScreenshot({ ...config, time });
      const screens = [...this.state.screens];
      screens[i] = newScreen;
      this.setState({ screens });
    });
  };

  /** Crop Start handlers */
  handleChangeCropStart = (event) => {
    const { value } = event.target;
    this.setState({ tmpCropValues: [value] });
  };

  handleBlurCropStart = (event) => {
    this.checkAndSetTime(event);
  };

  handleMouseDownCropStart = (event) => {
    event.stopPropagation();
    const mousemoveHandler = (e) => {
      let [start, end] = this.state.crop;
      start += (e.movementX / this.$wrapper.current.offsetWidth) * this.props.$video.duration;
      if (start >= 0 && start < end - 1) {
        this.setState({ crop: [start, end] });
        this.props.setCurrentTime(start);
      }
    };
    const mouseupHandler = () => {
      document.body.removeEventListener('mousemove', mousemoveHandler);
      document.body.removeEventListener('mouseup', mouseupHandler);
    };

    document.body.addEventListener('mousemove', mousemoveHandler);
    document.body.addEventListener('mouseup', mouseupHandler);
  };

  /** Crop End handlers */
  handleChangeCropEnd = (event) => {
    const { value } = event.target;
    this.setState({ tmpCropValues: [0, value] });
  };

  checkAndSetTime = (event) => {
    const { value } = event.currentTarget;
    let [start, end] = this.state.crop;
    let secondsToSet;
    if (this.props.currentVideoTimecode === 'Timecode') {
      const [hours, minutes, seconds, milliSecs] = value.split(':');
      secondsToSet = +seconds + (milliSecs / 100) + minutes * 60 + hours * 3600;
    } else {
      const [minutes, seconds] = value.split(':');
      secondsToSet = +seconds + minutes * 60;
    }
    if (
      typeof secondsToSet === 'number'
      && secondsToSet <= this.props.$video.duration
      && secondsToSet > start + 1
    ) {
      end = secondsToSet;
      this.props.setCurrentTime(end);
    }
    this.setState({ tmpCropValues: [], crop: [start, end] });
  }

  handleBlurCropEnd = (event) => {
    this.checkAndSetTime(event);
  };

  handleMouseDownCropEnd = (event) => {
    event.stopPropagation();
    const { duration } = this.props.$video;
    const mousemoveHandler = (e) => {
      let [start, end] = this.state.crop;
      end += (e.movementX / this.$wrapper.current.offsetWidth) * duration;
      if (end <= duration && end > start + 1) {
        this.setState({ crop: [start, end] });
        this.props.setCurrentTime(end);
      }
    };
    const mouseupHandler = () => {
      document.body.removeEventListener('mousemove', mousemoveHandler);
      document.body.removeEventListener('mouseup', mouseupHandler);
    };

    document.body.addEventListener('mousemove', mousemoveHandler);
    document.body.addEventListener('mouseup', mouseupHandler);
  };

  /** drag crop range */
  handleMouseDownCrop = () => {
    const { duration } = this.props.$video;
    const mousemoveHandler = (e) => {
      let [start, end] = this.state.crop;
      start += (e.movementX / this.$wrapper.current.offsetWidth) * this.props.$video.duration;
      end += (e.movementX / this.$wrapper.current.offsetWidth) * duration;
      if (start >= 0 && end <= duration) {
        this.setState({ crop: [start, end] });
        this.props.setCurrentTime(start);
      }
    };
    const mouseupHandler = () => {
      document.body.removeEventListener('mousemove', mousemoveHandler);
      document.body.removeEventListener('mouseup', mouseupHandler);
    };

    document.body.addEventListener('mousemove', mousemoveHandler);
    document.body.addEventListener('mouseup', mouseupHandler);
  };

  cropVideo = (event) => {
    const { props, state } = this;
    let url = `/video/crop/${
      props.assetId
    }?start=${
      state.crop[0]
    }&end=${
      state.crop[1]
    }&extension=${
      props.fileExtension}`;
    if (event.metaKey) url += '&force=true';
    window.open(url, '_blank');
  };

  render() {
    const { props, state } = this;
    const $wrapper = this.$wrapper.current;
    const marginLeft = $wrapper
      ? ($wrapper.offsetWidth * state.crop[0]) / props.$video.duration
      : 0;
    const marginRight = $wrapper
      ? ($wrapper.offsetWidth * (props.$video.duration - state.crop[1])) / props.$video.duration
      : 0;
    const trackWidth = $wrapper ? $wrapper.offsetWidth - (marginLeft + marginRight) : 0;
    let textRange = utils.parseTime(Math.floor(state.crop[1]) - Math.floor(state.crop[0]));
    if (trackWidth > this.MIDDLE_TRACK_WIDTH) {
      textRange = textRange.split(':');
      textRange = `${textRange[0] > 0 ? `${textRange[0]} min` : ''} ${textRange[1]} sec`;
    }
    return (
      <div className="cropVideoControls screenshotedTimeline" ref={this.$wrapper}>
        <div
          className={cn('trackToCrop', {
            middleTrackToCrop: trackWidth < this.MIDDLE_TRACK_WIDTH,
            smallTrackToCrop: trackWidth < this.SMALL_TRACK_WIDTH,
          })}
          onMouseDown={this.handleMouseDownCrop}
          style={{ marginLeft, marginRight }}
        >
          <div className="leftTrackSide" />
          <div className="rightTrackSide" />
          <div className="txtRangeToCrop">{textRange}</div>
          <Tooltip content={localization.VIDEO.cropVideoTooltip} placement="top">
            <div className="btnDownloadCropped" onClick={this.cropVideo}>
              <Icon name="download" />
            </div>
          </Tooltip>
          <div
            className={cn('btnLeftMarkerToCrop', {
              toRight: marginLeft < 25,
              toLeft: trackWidth < this.MIDDLE_TRACK_WIDTH,
              timeCode: props.currentVideoTimecode === 'Timecode',
            })}
            onMouseDown={this.handleMouseDownCropStart}
          >
            <Input
              isDefault
              value={state.tmpCropValues[0] || utils.parseTime(state.crop[0], { type: props.currentVideoTimecode })}
              onChange={this.handleChangeCropStart}
              onBlur={this.handleBlurCropStart}
              onMouseDown={this.handleMouseDownCropStart}
              type="text"
            />
          </div>
          <div
            className={cn('btnRightMarkerToCrop', {
              toLeft: marginRight < 25,
              toRight: trackWidth < this.MIDDLE_TRACK_WIDTH,
              timeCode: props.currentVideoTimecode === 'Timecode',
            })}
            onMouseDown={this.handleMouseDownCropEnd}
          >
            <Input
              isDefault
              value={state.tmpCropValues[1] || utils.parseTime(state.crop[1], { type: props.currentVideoTimecode })}
              onChange={this.handleChangeCropEnd}
              onBlur={this.handleBlurCropEnd}
              type="text"
            />
          </div>
        </div>
        <div className="videoScreenshots">
          {state.screens.length > 0
            && state.screens.map((screen, index) => (screen ? (
              <div
                key={index}
                className="itemVideoScreenshots"
                style={{ backgroundImage: `url(${screen})` }}
              />
            ) : (
              <div
                key={index}
                alt="loading"
                className="itemVideoScreenshots skeletonPending"
              />
            )))}
        </div>
      </div>
    );
  }
}

export default Crop;
