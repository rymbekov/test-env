import React from 'react';
import memoize from 'memoize-one';
import {
  func, object, number, string,
} from 'prop-types';
import cn from 'classnames';
import uniqBy from 'lodash/uniqBy';
import { IconButton } from '@picsio/ui';
import { RewindLeft, RewindRight } from '@picsio/ui/dist/icons';
import ReactSelect from '../../../../UIComponents/ReactSelect';
import picsioConfig from '../../../../../../../config';
import * as utils from '../../../../shared/utils';
import Logger from '../../../../services/Logger';
import localization from '../../../../shared/strings';
import uiBlocker from '../../../../services/UiBlocker';
import { parseTime, LocalStorage } from '../../../../shared/utils';
import Icon from '../../../Icon';
import ua from '../../../../ua';
import {
  makeVideoScreenshot,
  isScreenshotSupported,
  makeScreenshotName,
  uploadThumbail,
  getVideoQualities,
  QUALITIES_IN_PROGRESS,
  getSavedCurrentTime,
  saveVideoCurrentTime,
  MEDIA_ERRORS,
} from './helpers';
import Crop from './Crop';
import VideoError from './Error';
import Spinner from '../Spinner';
import Tooltip from '../../../Tooltip';
import Dialog, { showErrorDialog } from '../../../dialog';
import MenuOnHover from '../../../MenuOnHover';
import playbackRates from './playbackRates';
import VideoSlider from '../../../VideoSlider';

const MP4 = 'video/mp4';
const QUALITIES_STATUS = {
  initial: 'Video quality',
  processing: 'Please wait, video is processing...',
  unavailable: 'Quality change is not available at the moment',
};
const OPTIONS = [{ label: 'Standard', value: 'Standard' }, { label: 'Timecode', value: 'Timecode' }];

const isMobile = ua.browser.isNotDesktop();
const makeInitialState = (assetId) => {
  const currentTime = getSavedCurrentTime(assetId) || 0;
  return {
    videoError: null,
    isVideoReady: false,
    isDiffVideoReady: false,
    isVideoPlaying: false,
    isVideoWaiting: false,
    isDiffVideoWaiting: false,
    currentTime,
    diffCurrentTime: 0,
    duration: 0,
    diffDuration: 0,
    volume: typeof LocalStorage.get('volume') === 'number' ? LocalStorage.get('volume') : 0.7,
    isMuted: LocalStorage.get('muted'),
    isDiffMuted: true,
    progress: 0,
    diffProgress: 0,
    timeHovered: {},
    isScreenshotInProgress: false,
    isCustomThumbnailInProgress: false,
    showCrop: false,
    qualities: [],
    qualitiesStatus: QUALITIES_STATUS.initial,
    currentQuality: null,
    showInitialThumbnail: true,
    showError: false,
    playbackRate: 1,
    currentVideoTimecode: { label: utils.LocalStorage.get('picsio.timecodeType') || 'Standard', value: utils.LocalStorage.get('picsio.timecodeType') || 'Standard' },
    diffVideoTimecode: { label: utils.LocalStorage.get('picsio.timecodeType') || 'Standard', value: utils.LocalStorage.get('picsio.timecodeType') || 'Standard' },
  };
};

class Player extends React.Component {
  state = makeInitialState(this.props.data._id);

  isMainApp = picsioConfig.isMainApp();

  saveCurrentTimeInterval = null;

  $container = React.createRef();

  $video = React.createRef();

  $diffVideo = React.createRef();

  $videoControls = React.createRef();

  $diffVideoControls = React.createRef();

  $dialogWrapper = React.createRef();

  $commentsRangeWrapper = React.createRef();

  $hoveredTracks = {
    main: React.createRef(),
    diff: React.createRef(),
  };

  $hoveredTrackTimes = {
    main: React.createRef(),
    diff: React.createRef(),
  };

  $bufferedTracks = {
    main: React.createRef(),
    diff: React.createRef(),
  };

  $fileInput = React.createRef();

  /** needs for skip update volume after set muted, native player set volume to 1 by default */
  muteSetted = false;

  indicatorTimeout = null;

  cachedSrcData = {};

  uploadSizeLimit = 5 * 1024000;

  memoizedNormalizeQualitiesList = memoize((qualities) => {
    if (!qualities.length) return [];

    return qualities.map((item) => ({
      text: `${item.quality}p`,
      value: item.quality,
    }));
  });

  componentDidMount() {
    this.mounted = true;
    this.getQualities();
    /** Set initial values */
    const { isMuted, volume, currentTime } = this.state;
    this.$video.current.volume = volume;
    this.$video.current.muted = isMuted;
    this.$video.current.currentTime = currentTime;
    /** Add event listeners */
    this.$video.current.addEventListener('play', this.handlePlay);
    this.$video.current.addEventListener('pause', this.handlePause);
    this.$video.current.addEventListener('timeupdate', this.handleTimeUpdate);
    this.$video.current.addEventListener('volumechange', this.handleVolumeChange);
    this.$video.current.addEventListener('waiting', this.handleWaiting);
    this.$video.current.addEventListener('playing', this.handlePlaying);
    this.$video.current.addEventListener('progress', this.handleProgress);
    this.$video.current.addEventListener('ratechange', this.handleRateChange);

    // show default video controls for iOS app. It allows to make fullscreen video.
    if (isMobile && !this.$diffVideo.current) { this.$video.current.setAttribute('controls', 'controls'); }

    if (this.$diffVideo.current) {
      this.addListenersToDiffVideo();
    }

    document.body.addEventListener('keydown', this.keyDownListeners);
    window.addEventListener('beforeunload', this.saveVideoCurrentTime);

    /** Start save current video time interval */
    this.saveCurrentTimeInterval = setInterval(this.saveVideoCurrentTime, 1000 * 10);
  }

  componentDidUpdate(prevProps, prevState) {
    /** reload <video> if quality or data.src changed */
    if (
      (prevState.currentQuality !== null
        && prevState.currentQuality !== this.state.currentQuality)
      || (prevProps.data.src !== this.props.data.src && this.$video.current)
    ) {
      /** Set new src to qualities */
      if (
        this.props.data.src
        && prevProps.data.src !== this.props.data.src
        && this.state.qualities.length
      ) {
        const startSrc = this.props.data.src.slice(0, 34); // https://proxy.pics.io/googledrive/
        const qualities = this.state.qualities.map((quality) => (quality.proxyLink.startsWith(startSrc)
          ? { ...quality, proxyLink: this.props.data.src }
          : quality));
        this.setState({ qualities });
      }
      const $video = this.$video.current;
      const { isVideoPlaying, currentTime } = this.state;
      $video.load();
      this.setCurrentTime(currentTime);
      if (isVideoPlaying) $video.play();
    }

    if (
      prevProps.data._id !== this.props.data._id
      || prevProps.revisionsUploadedCount !== this.props.revisionsUploadedCount
    ) {
      this.setState(makeInitialState(this.props.data._id));
      this.getQualities();
    }

    /** switch asset */
    if (prevProps.data._id !== this.props.data._id) {
      const { currentTime } = prevState;
      this.saveVideoCurrentTime(prevProps.data._id, currentTime);
    }

    /** switch revision */
    if (prevProps.revisionId !== this.props.revisionId) {
      this.setState(makeInitialState(this.props.data._id));
      this.getQualities();
    }
    if (this.props.diffData && !prevProps.diffData) {
      this.addListenersToDiffVideo();
    }
    if (!this.props.diffData && prevProps.diffData) {
      this.removeListenersFromDiffVideo();
    }
  }

  componentWillUnmount() {
    this.saveVideoCurrentTime();
    this.mounted = false;
    /** remove event listeners */
    this.$video.current.removeEventListener('play', this.handlePlay);
    this.$video.current.removeEventListener('pause', this.handlePause);
    this.$video.current.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.$video.current.removeEventListener('volumechange', this.handleVolumeChange);
    this.$video.current.removeEventListener('waiting', this.handleWaiting);
    this.$video.current.removeEventListener('playing', this.handlePlaying);
    this.$video.current.removeEventListener('progress', this.handleProgress);
    this.$video.current.removeEventListener('ratechange', this.handleRateChange);
    if (this.qualitiesTimeout) clearTimeout(this.qualitiesTimeout);

    document.body.removeEventListener('keydown', this.keyDownListeners);
    this.removeListenersFromDiffVideo();
    window.dispatchEvent(new CustomEvent('preview:video:pausing')); // to set default preview hotkeys
    window.removeEventListener('beforeunload', this.saveVideoCurrentTime);

    /** Stop save current video time interval */
    if (this.saveCurrentTimeInterval !== null) {
      clearInterval(this.saveCurrentTimeInterval);
      this.saveCurrentTimeInterval = null;
    }
  }

  getQualities = async () => {
    const { revisionId, data } = this.props;
    const { _id, storageId, mimeType } = data;
    let qualities;
    /** variable in order to set the right quality value */
    this.qualitiesFor = storageId;
    try {
      const params = [_id];
      if (revisionId) params.push(revisionId);
      qualities = await getVideoQualities(...params);
    } catch (err) {
      if (!this.mounted) return;
      if (err === QUALITIES_IN_PROGRESS) {
        if (this.qualitiesFor === storageId) {
          this.qualitiesTimeout = setTimeout(this.getQualities, 5000);
          this.setState({ qualitiesStatus: QUALITIES_STATUS.processing });
        }
        return;
      }
      this.setState({ qualitiesStatus: QUALITIES_STATUS.unavailable });

      if (mimeType !== MP4 || this.state.videoError) this.showError(this.state.videoError);
    }

    if (this.mounted && qualities && this.qualitiesFor === storageId) {
      const originalQuality = this.state.qualities[0];
      /** if original file is broken - its has zero height size */
      let newQualities = originalQuality && originalQuality.quality !== 0
        ? [...this.state.qualities, ...qualities]
        : qualities;
      newQualities = uniqBy(newQualities, 'quality');
      this.setState({
        qualities: newQualities,
        qualitiesStatus: QUALITIES_STATUS.initial,
        currentQuality: mimeType === MP4 ? this.state.currentQuality : newQualities[0].quality,
      });
    }
  };

  addListenersToDiffVideo() {
    if (this.$diffVideo.current) {
      this.$diffVideo.current.addEventListener('waiting', this.handleWaiting);
      this.$diffVideo.current.addEventListener('playing', this.handlePlaying);
      this.$diffVideo.current.addEventListener('progress', this.handleProgress);
      this.$diffVideo.current.addEventListener('timeupdate', this.handleTimeUpdate);
    }
  }

  removeListenersFromDiffVideo() {
    if (this.$diffVideo.current) {
      this.$diffVideo.current.removeEventListener('waiting', this.handleWaiting);
      this.$diffVideo.current.removeEventListener('playing', this.handlePlaying);
      this.$diffVideo.current.removeEventListener('progress', this.handleProgress);
      this.$diffVideo.current.removeEventListener('timeupdate', this.handleTimeUpdate);
    }
  }

  saveVideoCurrentTime = (_id, currentTime) => {
    /** when save on window before reload/close -> first argument is `beforeunload` event */
    const id = typeof _id === 'string' ? _id : this.props.data._id;
    saveVideoCurrentTime(id, currentTime || this.state.currentTime);
  }

  handleProgress = (event) => {
    /* progress event may be triggered on the unmounted video */
    if (event.target !== this.$video.current && event.target !== this.$diffVideo.current) return;

    const isMain = event.target === this.$video.current;
    const { buffered, duration } = isMain ? this.$video.current : this.$diffVideo.current;
    const type = isMain ? 'main' : 'diff';
    const $bufferedTrack = this.$bufferedTracks[type].current;

    if (buffered && buffered.length && duration) {
      const bufferedEnd = buffered.end(0);
      const progress = (bufferedEnd / duration) * 100;

      if ($bufferedTrack) $bufferedTrack.style.width = `${progress}%`;
    }
  };

  /** @param {KeyboardEvent} event */
  keyDownListeners = (event) => {
    const { state } = this;
    const {
      keyCode, shiftKey, altKey, ctrlKey, metaKey,
    } = event;
    const isSomeInputFocused = document.activeElement
      && (document.activeElement.contentEditable === 'true'
        || ['INPUT', 'TEXTAREA'].includes(document.activeElement.nodeName.toUpperCase()));
    /** e.g. cmd + C */
    const additionalKeyPressed = shiftKey || altKey || ctrlKey || metaKey;

    if (!state.isVideoReady || isSomeInputFocused || additionalKeyPressed) return;
    event.preventDefault();

    switch (keyCode) {
    /** ArrowRight -> forward */
    case 39:
      if (state.isVideoPlaying || state.isVideoWaiting) {
        event.stopPropagation();
        const newTime = state.currentTime + 5;
        this.setIndicator('+5 sec');
        if (newTime <= state.duration) return this.setCurrentTime(newTime);
        if (state.currentTime < state.duration) this.setCurrentTime(state.duration);
      }
      return;

    /** KeyL -> forward */
    case 76: {
      const newTime = state.currentTime + 5;
      this.setIndicator('+5 sec');
      if (newTime <= state.duration) return this.setCurrentTime(newTime);
      if (state.currentTime < state.duration) this.setCurrentTime(state.duration);
      return;
    }
    /** ArrowLeft -> rewind */
    case 37:
      if (state.isVideoPlaying || state.isVideoWaiting) {
        event.stopPropagation();
        const newTime = state.currentTime - 5;
        this.setIndicator('-5 sec');
        if (newTime >= 0) return this.setCurrentTime(newTime);
        if (state.currentTime > 0) this.setCurrentTime(0);
      }
      return;

    /** KeyJ -> rewind */
    case 74: {
      const newTime = state.currentTime - 5;
      this.setIndicator('-5 sec');
      if (newTime >= 0) return this.setCurrentTime(newTime);
      if (state.currentTime > 0) this.setCurrentTime(0);
      return;
    }

    /** Spacebar | KeyK */
    case 32:
    case 75:
      this.togglePlayState();
      return;

    /** KeyF */
    case 70:
      this.toggleFullscreen();
      return;

    /** KeyM */
    case 77:
      this.toggleMuteState();
      this.setIndicator(this.state.isMuted ? 'Mute' : 'Unmute');
      return;

    /** ArrowUp */
    case 38:
      this.volumeUp();
      this.setIndicator('Volume+');
      return;

    /** ArrowDown */
    case 40:
      this.volumeDown();
      this.setIndicator('Volume-');
      return;

    /** KeyC */
    case 67:
      if (this.props.diffData) return;
      this.toggleCrop();
      this.setIndicator('Crop');
      return;

    /** KeyT */
    case 84:
      this.handleClickCustomThumbnail();
      this.setIndicator('Create custom thumbnail');
      return;

    /** KeyU */
    case 85:
      if (this.props.diffData) return;
      this.handleClickUploadCustomThumbnail(event);
      this.setIndicator('Upload custom thumbnail');
    // no default
    }
  };

  setIndicator = (text) => {
    if (this.indicatorTimeout) clearTimeout(this.indicatorTimeout);
    if (text) {
      this.indicatorTimeout = setTimeout(this.setIndicator, 500);
    }
    this.setState({ indicator: text });
  };

  handleCanPlay = () => {
    const { videoHeight, duration } = this.$video.current;
    const { state } = this;

    if (isNaN(duration)) return;

    const isCurrentQualityAdded = Boolean(
      state.qualities.find((item) => item.quality === videoHeight),
    );
    const qualities = isCurrentQualityAdded || !this.props.data.src || videoHeight === 0
      ? state.qualities
      : [{ quality: videoHeight, proxyLink: this.props.data.src }, ...state.qualities];

    this.setState({
      isVideoReady: true,
      isVideoWaiting: false,
      duration: this.$diffVideo.current ? Math.max(this.state.duration, duration) : duration,
      qualities,
      currentQuality: state.currentQuality || (qualities[0] ? qualities[0].quality : videoHeight),
    });
    this.props.onCanPlay();
  };

  handleCanPlayDiff = () => {
    this.setState({
      isDiffVideoReady: true,
      isDiffVideoWaiting: false,
      diffDuration: this.$diffVideo.current.duration,
      diffCurrentTime: this.$diffVideo.current.currentTime,
    });
  };

  handleError = (event) => {
    const { state } = this;
    const { error } = event.currentTarget;

    const numberOfQualities = state.qualities.length;
    if (state.qualitiesStatus === QUALITIES_STATUS.unavailable) {
      this.showError(error);
      return;
    }

    if (!numberOfQualities) {
      this.setState({ videoError: error });
      return;
    }
    if (
      numberOfQualities
      && state.currentQuality !== state.qualities[numberOfQualities - 1].quality
    ) {
      /** if can't play not last quality -> try to play next(lower) quality */
      const currentQualityIndex = state.qualities.findIndex(
        (q) => q.quality === state.currentQuality,
      );
      if (currentQualityIndex > -1) {
        const { currentQuality } = state;
        const nextQuality = state.qualities[currentQualityIndex + 1].quality;
        this.changeQuality(nextQuality, true);
        this.setIndicator(`Can not play in ${currentQuality}p, try to play ${nextQuality}p`);
      }
    } else {
      this.showError(error);
    }
    /** otherwise -> wait for quality */
    this.setState({ videoError: error });
  };

  handlePlay = () => {
    this.setState({ isVideoPlaying: true, showInitialThumbnail: false });
    this.props.toggleMarkers(this.props.markers);
    window.dispatchEvent(new CustomEvent('preview:video:playing')); // to remove arrow hotkeys from preview
  };

  handlePause = () => {
    this.setState({ isVideoPlaying: false });
    window.dispatchEvent(new CustomEvent('preview:video:pausing')); // to set default preview hotkeys
  };

  handleTimeUpdate = (event) => {
    const { currentTime, paused } = event.target;
    const { duration, isVideoWaiting, isVideoReady } = this.state;
    if (!paused) {
      this.props.setCommentTimeRange([currentTime, currentTime]);
    }

    /**
     * for some reason in chrome timeupdate triggers several times before video is ready
     * if src on tag <video> instead of <source>
     */
    if (!isVideoReady) return;

    if (event.target === this.$video.current) {
      this.setState({
        currentTime,
        isVideoWaiting: currentTime === duration ? false : isVideoWaiting,
      });
    } else {
      const { diffDuration, isDiffVideoWaiting } = this.state;

      this.setState({
        diffCurrentTime: currentTime,
        isDiffVideoWaiting: currentTime === diffDuration ? false : isDiffVideoWaiting,
      });
    }
  };

  handleVolumeChange = (event) => {
    /** prevent update volume when pressed "Mute" button */
    const { volume } = event.target;
    if (this.muteSetted || this.state.volume === volume) return (this.muteSetted = false);

    const muted = volume === 0;
    this.setState({
      volume,
      isMuted: muted,
    });
    LocalStorage.set('muted', muted);
    LocalStorage.set('volume', volume);
    /** remove mute property on native player if setted */
    if (!muted && this.$video.current.muted) this.$video.current.muted = false;
  };

  /** Fires when the video stops because it needs to buffer the next frame */
  handleWaiting = (event) => {
    if (event.target === this.$video.current) {
      this.setState({ isVideoWaiting: true });
    } else {
      this.setState({ isDiffVideoWaiting: true });
    }
  };

  /** Fires when the audio/video is playing after having been paused or stopped for buffering */
  handlePlaying = (event) => {
    if (event.target === this.$video.current) {
      this.setState({ isVideoWaiting: false });
    } else {
      this.setState({ isDiffVideoWaiting: false });
    }
  };

  handleRewindLeft = () => {
    const { currentTime } = this.$video.current;
    let rewindedTime;
    rewindedTime = currentTime - 2;
    rewindedTime = rewindedTime > 0 ? rewindedTime : 0;
    this.$video.current.currentTime = rewindedTime;
  }

  handleRewindRight = () => {
    const { currentTime, duration } = this.$video.current;
    let rewindedTime;
    rewindedTime = currentTime + 2;
    rewindedTime = rewindedTime < duration ? rewindedTime : duration;
    this.$video.current.currentTime = rewindedTime;
  }

  handleClickTimeline = (event) => {
    const { clientX } = event.nativeEvent;
    const isClickOnMainTimeline = this.$videoControls.current.contains(event.currentTarget);
    const { duration } = isClickOnMainTimeline ? this.$video.current : this.$diffVideo.current;
    const { left, width } = isClickOnMainTimeline
      ? this.$videoControls.current.getBoundingClientRect()
      : this.$diffVideoControls.current.getBoundingClientRect();
    const currentTime = (duration * (clientX - left)) / width;
    const mainVideoDuration = this.$video.current.duration;
    const mainCurrentTime = currentTime < mainVideoDuration ? currentTime : mainVideoDuration;

    const state = { currentTime: mainCurrentTime };
    if (this.$diffVideo.current) {
      const diffVideoDuration = this.$diffVideo.current.duration;
      const diffCurrentTime = currentTime < diffVideoDuration ? currentTime : diffVideoDuration;
      state.diffCurrentTime = diffCurrentTime;
      this.$diffVideo.current.currentTime = diffCurrentTime;
    }
    this.$video.current.currentTime = mainCurrentTime;
    this.props.toggleMarkers(this.props.markers);
    this.setState(state);
  };

  handleTimeLineHover = (event, type) => {
    const isMain = type === 'main';
    const $videoControls = isMain ? this.$videoControls.current : this.$diffVideoControls.current;
    const $video = isMain ? this.$video.current : this.$diffVideo.current;

    if (!isNaN($video.duration)) {
      const $hoveredTrack = this.$hoveredTracks[type].current;
      const $hoveredTrackTime = this.$hoveredTrackTimes[type].current;
      const controlsLeft = $videoControls.getBoundingClientRect().left;
      const width = event.clientX - controlsLeft;

      if (event.clientX < controlsLeft + 31) {
        $hoveredTrack.classList.add('leftPart');
      } else if (event.clientX > $videoControls.offsetWidth + controlsLeft - 31) {
        $hoveredTrack.classList.add('rightPart');
      } else {
        $hoveredTrack.classList.remove('leftPart');
        $hoveredTrack.classList.remove('rightPart');
      }

      $hoveredTrack.style.width = `${width}px`;
      $hoveredTrackTime.innerText = parseTime(
        ($video.duration * width) / $videoControls.offsetWidth,
      );
    }
  };

  togglePlayState = async () => {
    const { isVideoPlaying, isVideoWaiting, isDiffVideoWaiting } = this.state;

    if (isVideoPlaying && !this.isPlayPromiseWaiting) {
      if (this.$diffVideo.current) this.$diffVideo.current.pause();
      return this.$video.current.pause();
    }
    if (isVideoWaiting || isDiffVideoWaiting || this.isPlayPromiseWaiting) {
      return;
    }

    if (this.$diffVideo.current) {
      this.isPlayPromiseWaiting = await Promise.all([
        this.$video.current.play(),
        this.$diffVideo.current.play(),
      ]);
    } else {
      this.isPlayPromiseWaiting = await this.$video.current.play();
    }
    this.isPlayPromiseWaiting = undefined;
  };

  toggleMuteState = () => {
    this.muteSetted = true;

    const muted = !this.$video.current.muted;
    this.$video.current.muted = muted;
    this.setState({ isMuted: muted });
    LocalStorage.set('muted', muted);
  };

  toggleDiffMuteState = () => {
    const muted = !this.$diffVideo.current.muted;
    this.$diffVideo.current.muted = muted;
    this.setState({ isDiffMuted: muted });
  };

  handleInputVolumeChange = (event) => {
    const { value } = event.currentTarget;
    this.setVolume(value);
  };

  volumeUp = () => {
    this.setVolume(this.$video.current.volume + 0.02);
  };

  volumeDown = () => {
    this.setVolume(this.$video.current.volume - 0.02);
  };

  setVolume = (value) => {
    if (value < 0) value = 0;
    if (value > 1) value = 1;
    this.$video.current.volume = value;
    LocalStorage.set('volume', value);
  };

  /** @param {number} time - in seconds */
  setCurrentTime = (time, setPause = false) => {
    this.props.toggleMarkers(this.props.markers);

    this.setState({ currentTime: time });
    this.$video.current.currentTime = time;
    if (setPause && !this.$video.current.paused) this.$video.current.pause();
  };

  handleClickScreenshot = async () => {
    Logger.log('User', 'VideoCaptureVideoScreen');
    if (!isScreenshotSupported()) return;

    const { state, props, $video } = this;
    const time = $video.current.currentTime;
    this.setState({ isScreenshotInProgress: true });
    const src = state.currentQuality
      ? state.qualities.find((item) => item.quality === state.currentQuality).proxyLink
      : props.data.src;
    const config = {
      $video: $video.current,
      src,
      time,
      type: 'blob',
      quality: 1,
    };
    const screenshot = await makeVideoScreenshot(config);

    try {
      const screenName = makeScreenshotName(this.props.data.name, time);
      utils.saveFile(screenshot, screenName);
    } catch (err) {
      showErrorDialog(localization.VIDEO.errorCreatingScreenshot);
      Logger.error(new Error('Video: can not download screenshot'), { error: err }, [
        'VideoDownloadScreenshotFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
    this.setState({ isScreenshotInProgress: false });
  };

  uploadCustomThumbnail = async (thumbnail) => {
    const {
      data: { _id: assetId },
    } = this.props;
    uiBlocker.block('Uploading');
    await uploadThumbail(assetId, thumbnail);
    uiBlocker.unblock();
  };

  openCustomThumbnailDialog = (thumbnail) => {
    const img = (
      <img
        alt="New custom thumbnail"
        src={window.URL.createObjectURL(thumbnail)}
        style={{ width: '100%', height: 'auto' }}
      />
    );

    new Dialog({
      parentEl: this.$dialogWrapper.current,
      data: {
        title: 'New custom thumbnail',
        children: img,
        textBtnOk: 'Create',
        textBtnCancel: 'Cancel',
        onOk: () => this.uploadCustomThumbnail(thumbnail),
      },
    });
  };

  handleClickCustomThumbnail = async () => {
    Logger.log('User', 'VideoCreateCustomThumnail');

    if (!isScreenshotSupported()) return;

    this.setState({ isCustomThumbnailInProgress: true });

    const { props, state, $video } = this;
    const time = $video.current.currentTime;
    const src = state.currentQuality
      ? state.qualities.find((item) => item.quality === state.currentQuality).proxyLink
      : props.data.src;
    const config = {
      $video: $video.current,
      src,
      time,
      type: 'blob',
      mimeType: 'image/jpeg',
      quality: 0.8,
    };
    const screenshot = await makeVideoScreenshot(config);

    this.setState({ isCustomThumbnailInProgress: false });
    this.openCustomThumbnailDialog(screenshot);
  };

  handleClickUploadCustomThumbnail = (e) => {
    e.preventDefault();

    this.$fileInput.current.click();
  };

  handleUploadCustomThumbnail = async (e) => {
    Logger.log('User', 'VideoUploadCustomThumbnail');

    const file = e.target.files[0];
    const { size } = file;

    if (size > this.uploadSizeLimit) {
      const { FILE_TO_LARGE } = localization.DIALOGS;
      const parsedLimit = utils.bytesToSize(this.uploadSizeLimit);
      const parsedSize = utils.bytesToSize(size);

      showErrorDialog(FILE_TO_LARGE.TEXT(parsedLimit, parsedSize), FILE_TO_LARGE.TITLE);
    } else {
      this.openCustomThumbnailDialog(file);
    }
  };

  requestFullscreen = () => {
    const $container = this.props.container || this.$container.current;
    $container.classList.add('fullScreen');
    if ($container.requestFullscreen) {
      $container.requestFullscreen();
    } else if ($container.mozRequestFullScreen) {
      $container.mozRequestFullScreen();
    } else if ($container.webkitRequestFullscreen) {
      $container.webkitRequestFullscreen();
    } else if ($container.msRequestFullscreen) {
      $container.msRequestFullscreen();
    }
  };

  exitFullscreen = () => {
    const $container = this.props.container || this.$container.current;
    $container.classList.remove('fullScreen');
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  toggleFullscreen = () => {
    if (document.fullscreenElement) this.exitFullscreen();
    else this.requestFullscreen();
  };

  toggleCrop = () => {
    Logger.log('User', 'VideoCropVideo');
    if (!picsioConfig.isMainApp() || !this.props.subscriptionFeatures.trimVideo) {
      Logger.log('UI', 'VideoCropVideoAvailableForPlansDialog');
      new Dialog({
        parentEl: this.$dialogWrapper.current,
        data: {
          title: 'Video Trim',
          text:
            'Video Trim is only available for “Micro”, “Small”, or “Medium” plans. Please select the plan that works best for you to use this feature.',
          textBtnCancel: null,
        },
      });
      return;
    }

    this.setState({ showCrop: !this.state.showCrop });
  };

  handleClickMarker = (comment) => {
    const {
      _id: id, markers, videoCurrentTime, userDisplayName: userName, mentions,
    } = comment;
    const text = comment.html || comment.text;
    this.props.toggleMarkers(
      [
        {
          id,
          markers: markers.map((marker) => ({
            ...marker,
            userName,
            text,
            mentions,
          })),
        },
      ],
      {
        video: { videoCurrentTime },
      },
    );
  };

  /** Change quality
   * @param {number} quality
   */
  changeQuality = (quality, dontLog) => {
    if (!dontLog) {
      Logger.log('User', 'PlayerChangeQuality', { quality });
    }
    this.setState({ currentQuality: quality });
  };

  handleRateChange = () => {
    this.setState({ playbackRate: this.$video.current.playbackRate });
  }

  changeRate = (rate) => {
    Logger.log('User', 'PlayerChangePlaybackRate', { rate });
    this.$video.current.playbackRate = rate;
  }

  /** Memoize video src */
  getCurrentSrc = () => {
    const { state, props, cachedSrcData } = this;
    const { qualities, currentQuality } = state;

    if (cachedSrcData.qualities === qualities && cachedSrcData.currentQuality === currentQuality) {
      return cachedSrcData.src;
    }

    const src = currentQuality
      ? qualities.find((item) => item.quality === currentQuality).proxyLink
      : props.data.src;
    this.cachedSrcData = {
      qualities,
      currentQuality,
      src,
    };
    return src;
  };

  showError = (error = {}) => {
    let { code } = error;
    if (!code) code = 'unknown';
    const explanation = MEDIA_ERRORS[code];

    Logger.error(
      new Error(`Can not play video: (${explanation.name})`),
      { error, explanation },
      ['CanNotPlayVideo', { ...explanation }],
    );

    if (code === 2) {
      /** nerwork error -> reload video */
      this.handlePause();
      this.props.reload();
      return;
    }
    this.setState({
      showError: true,
      videoError: error,
      showInitialThumbnail: true,
      isVideoReady: true,
    });
  };

  getPlaybackOpenerText = (playbackRate) => {
    const playbackRateOpener = 'Speed';

    if (playbackRate === 1) {
      return playbackRateOpener;
    }
    return `${playbackRateOpener} × ${playbackRate}`;
  }

  handleTimecodeChange = (val) => {
    utils.LocalStorage.set('picsio.timecodeType', val.value);
    this.setState({ currentVideoTimecode: val });
    Logger.log('User', 'VideoTimecodeSelect', { type: val.value });
  };

  handleDiffTimecodeChange = (val) => {
    utils.LocalStorage.set('picsio.diffTimecodeType', val.value);
    this.setState({ diffVideoTimecode: val });
    Logger.log('User', 'DiffVideoTimecodeSelect', { type: val.value });
  };

  handleMouseDownCommentRangeEnd = (event) => {
    event.stopPropagation();
    const { duration } = this.$video?.current;
    const mousemoveHandler = (e) => {
      let [start, end] = this.props.commentsRange;
      end += (e.movementX / this.$commentsRangeWrapper.current.offsetWidth) * this.$video?.current?.duration;
      if (end <= duration && end >= start) {
        this.setCurrentTime(end);
        this.props.setCommentTimeRange([start, end]);
      }
    };
    const mouseupHandler = () => {
      document.body.removeEventListener('mousemove', mousemoveHandler);
      document.body.removeEventListener('mouseup', mouseupHandler);
    };

    document.body.addEventListener('mousemove', mousemoveHandler);
    document.body.addEventListener('mouseup', mouseupHandler);
  };

  handleMouseDownCommentRangeStart = (event) => {
    event.stopPropagation();
    const mousemoveHandler = (e) => {
      let [start, end] = this.props.commentsRange;
      start += (e.movementX / this.$commentsRangeWrapper.current.offsetWidth) * this.$video?.current?.duration;
      if (start >= 0 && start <= end) {
        this.setCurrentTime(start);
        this.props.setCommentTimeRange([start, end]);
      }
    };
    const mouseupHandler = () => {
      document.body.removeEventListener('mousemove', mousemoveHandler);
      document.body.removeEventListener('mouseup', mouseupHandler);
    };

    document.body.addEventListener('mousemove', mousemoveHandler);
    document.body.addEventListener('mouseup', mouseupHandler);
  };

  handleCommentMarker = (comment) => {
    if (typeof comment.videoCurrentTime === 'number') {
      return (comment.videoCurrentTime * 100) / this.state.duration;
    }
    return (comment.videoCurrentTime[0] * 100) / this.state.duration;
  };

  handleLeftStickyMarker = (comment) => {
    return this.$videoControls.current && (this.$videoControls.current.offsetWidth * comment.videoCurrentTime) / this.state.duration < 100;
  }

  handleRightStickyMarker = (comment) => {
      return this.$videoControls.current
      && (this.$videoControls.current.offsetWidth * comment.videoCurrentTime)
        / this.state.duration
        > this.$videoControls.current.offsetWidth - 100;
  }

  render() {
    const { state, props } = this;
    const volume = state.isMuted ? 0 : state.volume;
    const src = this.getCurrentSrc();
    const playbackRateOpener = this.getPlaybackOpenerText(state.playbackRate);
    const qualitiesList = this.memoizedNormalizeQualitiesList(state.qualities);
    const timeCodeValue = state.currentVideoTimecode;
    const $commentsRangeWrapper = this.$commentsRangeWrapper.current;

    const marginRight = $commentsRangeWrapper
      ? ($commentsRangeWrapper?.offsetWidth * (this.$video?.current?.duration - props?.commentsRange[1])) / this.$video?.current?.duration
      : 0;
    const marginLeft = $commentsRangeWrapper
      ? ($commentsRangeWrapper?.offsetWidth * props?.commentsRange[0]) / this.$video?.current?.duration
      : 0;

    const [start, end] = this.props.commentsRange;
    const isCommentTimeEqual = Math.floor(start) === Math.floor(end);

    const diffTimeCodeValue = state.diffVideoTimecode;
    return (
      <div className="wrapperVideoTag" ref={this.$container}>
        <If condition={state.showError}>
          <VideoError error={state.videoError} isMobile={isMobile} />
        </If>
        {/** Main Video */}
        <div className="videoHolder">
          {props.diffData && (
            <div className="headVideo">
              <div className="titleComparison">{props.data.name}</div>
            </div>
          )}
          {props.data.poster && (
            <img
              alt="Poster"
              className="videoPoster"
              src={props.data.poster.default}
              style={{ opacity: state.showInitialThumbnail ? 1 : 0 }}
            />
          )}
          {!state.isVideoPlaying && !state.showError && (
            <div className="popupControl">
              <Tooltip content="Rewind (Arrow Left)" placement="top">
                <IconButton
                  componentProps={{ 'data-testid': 'actionRewindLeftButton' }}
                  className="left"
                  onClick={this.handleRewindLeft}
                  size="xxxl"
                >
                  <RewindLeft />
                </IconButton>
              </Tooltip>
              <Tooltip content="Play (Space)" placement="top">
                <div className="popupPlayVideo playVideoButton" onClick={this.togglePlayState} />
              </Tooltip>
              <Tooltip content="Rewind (Arrow Right)" placement="top">
                <IconButton
                  componentProps={{ 'data-testid': 'actionRewindRightButton' }}
                  className="right"
                  onClick={this.handleRewindRight}
                  size="xxxl"
                >
                  <RewindRight className="iconColor" />
                </IconButton>
              </Tooltip>
            </div>
          )}
          <video
            ref={this.$video}
            onDoubleClick={this.toggleFullscreen}
            volume={state.volume}
            muted={state.isMuted}
            preload="auto"
            crossOrigin="anonymous"
            onCanPlay={this.handleCanPlay}
            onLoadedMetadata={this.handleCanPlay}
            onError={this.handleError}
            onClick={this.togglePlayState}
            style={{ opacity: state.showInitialThumbnail && props.data.poster ? 0 : 1 }}
            playsInline
            src={src || null}
          >
            {src && <source type={MP4} />}
          </video>
        </div>
        {/** Diff Video */}
        {props.diffData && (
          <div className="videoHolder">
            <div className="headVideo">
              <div className="titleComparison">{props.diffData.name}</div>
            </div>
            {props.diffData.poster && (
              <img
                alt="Poster"
                className="videoPoster"
                src={props.diffData.poster.default}
                style={{ opacity: state.showInitialThumbnail ? 1 : 0 }}
              />
            )}
            <video
              ref={this.$diffVideo}
              onDoubleClick={this.toggleFullscreen}
              volume={state.volume}
              muted={state.isDiffMuted}
              preload="auto"
              crossOrigin="anonymous"
              onCanPlay={this.handleCanPlayDiff}
              onLoadedMetadata={this.handleCanPlayDiff}
              onError={this.handleError}
              onClick={this.togglePlayState}
              style={{ opacity: state.showInitialThumbnail && props.diffData.poster ? 0 : 1 }}
              playsInline
            >
              <source type={props.diffData.mimeType} src={props.diffData.src} />
            </video>
          </div>
        )}

        {/** Controls */}
        {state.isVideoReady && (
          <div
            className={cn('videoControls', {
              halfWidth: Boolean(props.diffData),
              disabled: state.showError,
              cropIsAct: state.showCrop,
            })}
            ref={this.$videoControls}
          >
            {/* tracks */}
            <div
              className="videoTracks"
              ref={this.$commentsRangeWrapper}
            >
              <If condition={!isMobile || (props.diffData && isMobile)}>
                <div
                  className="videoTracksPadding"
                  onClick={this.handleClickTimeline}
                  onMouseMove={(e) => this.handleTimeLineHover(e, 'main')}
                >
                  <div ref={this.$hoveredTracks.main} className={cn('hoveredTrack')}>
                    <span ref={this.$hoveredTrackTimes.main} className="hoveredTime" />
                  </div>
                  <If condition={this.props.isCheckedAttachTime && this.$video?.current?.paused}>
                    <div className="timeRangeIndicator left" style={{
                      left: marginLeft,
                    }}
                    >
                      |
                    </div>
                    <If condition={!isCommentTimeEqual}>
                      <div className="timeRangeIndicator right" style={{
                        right: marginRight,
                      }}
                      >
                        |
                      </div>
                    </If>

                  </If>
                </div>
                <div ref={this.$bufferedTracks.main} className="bufferedTrack" />
                <div
                  className="playbackTrack"
                  style={{
                    width: `${(100 * state.currentTime) / state.duration}%`,
                  }}
                />
              </If>
              {!props.diffData && (
                <div className="markersTrack">
                  {props.revisionCommentsWithMarkers
                    && props.revisionCommentsWithMarkers.map((comment, index) => (
                      <div
                        key={index}
                        className={cn('itemMarker', {
                          leftStickyMarker: this.handleLeftStickyMarker(comment),
                          rightStickyMarker: this.handleRightStickyMarker(comment),
                        })}
                        style={{ left: `${this.handleCommentMarker(comment)}%` }}
                        onClick={() => this.handleClickMarker(comment)}
                      >
                        <div className="itemMarkerData">
                          <div className="itemMarkerDataTitle">{comment.userDisplayName}</div>
                          <div className="itemMarkerDataText">
                            <span className="itemMarkerDataTextTime">
                              {utils.parseTime(comment.videoCurrentTime)}
                              <If condition={comment.videoCurrentTimeEnd}>
                                - {utils.parseTime(comment.videoCurrentTimeEnd)}
                              </If>
                            </span>{' '}
                            {comment.text.replace(utils.mentionPattern, (mentionString) => {
                              const mentionID = mentionString.substring(1);
                              const mention = comment.mentions
                                ? comment.mentions.find((mention) => mention._id === mentionID)
                                : null;
                              return mention ? `@${mention.displayName}` : mentionString;
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <VideoSlider
              marginLeft={marginLeft}
              marginRight={marginRight}
              handleMouseDownCommentRangeEnd={this.handleMouseDownCommentRangeEnd}
              handleMouseDownCommentRangeStart={this.handleMouseDownCommentRangeStart}
              paused={this.$video?.current?.paused}
              isCheckedAttachTime={props.isCheckedAttachTime}
              noProofingAccess={!picsioConfig.isMainApp() && !picsioConfig?.access?.comment}
            />
            <If condition={!isMobile || (props.diffData && isMobile)}>
              <div className="btnsVideoControls">
                <div className="btnsLeft">
                  {/* Play/Pause */}
                  <Tooltip content="Play/Pause (K)" placement="top">
                    <div
                      className={cn('btnPlayVideo', {
                        playing: state.isVideoPlaying,
                      })}
                      onClick={this.togglePlayState}
                    />
                  </Tooltip>
                  {/* Mute/Unmute */}
                  <Tooltip content="Mute/Unmute (M)" placement="top">
                    <div className="btnVolumeVideo" onClick={this.toggleMuteState}>
                      <Icon name={cn({ sound: !state.isMuted, soundMuted: state.isMuted })} />
                    </div>
                  </Tooltip>

                  {/* Volume */}
                  {!props.diffData && (
                    <div className="rangeVolumeVideo">
                      <input
                        type="range"
                        value={volume}
                        min="0"
                        max="1"
                        step="0.01"
                        onChange={this.handleInputVolumeChange}
                      />
                    </div>
                  )}
                  {/* Time */}
                  <div className="timeVideo">
                    <span className="timeCurrentVideo">{parseTime(this.$video.current.currentTime || state.currentTime, { type: timeCodeValue.value })}</span>
                    <span className="timeSeparatorVideo">/</span>
                    <span className="timeFullVideo">{parseTime(this.$video.current.duration || state.duration, { type: timeCodeValue.value })}</span>
                  </div>
                  <div className="timeCodeSelector">
                    <ReactSelect
                      isSearchable={false}
                      options={OPTIONS}
                      value={timeCodeValue}
                      menuPlacement="top"
                      onChange={this.handleTimecodeChange}
                    />
                  </div>
                </div>
                <div className="btnsRight">
                  {/* Qualities */}
                  <If condition={!props.diffData}>
                    <MenuOnHover
                      opener={playbackRateOpener}
                      activeItem={state.playbackRate}
                      list={playbackRates}
                      handleItemClick={this.changeRate}
                      additionalClass="playbackRate"
                      alignListRight
                      hideOnClick
                    />
                    <MenuOnHover
                      tooltip={state.qualitiesStatus}
                      opener={`${state.currentQuality}p`}
                      activeItem={state.currentQuality}
                      list={qualitiesList}
                      handleItemClick={this.changeQuality}
                      additionalClass="qualityVideo"
                      hideOnClick
                    />
                  </If>
                  <div className="btnsThumbnailControls">
                    {/* Snapshot */}
                    {!props.diffData && (
                      <Tooltip
                        content={
                          state.isScreenshotInProgress ? 'Creating snapshot...' : 'Take a snapshot'
                        }
                        placement="top"
                      >
                        <div
                          className={cn('btnCaptureVideoScreen', {
                            inProgress: state.isScreenshotInProgress,
                          })}
                          onClick={this.handleClickScreenshot}
                        >
                          <Icon name="captureVideoScreen" />
                        </div>
                      </Tooltip>
                    )}
                    {/* Custom thumbnail */}
                    {this.isMainApp && !props.diffData && (
                      <Tooltip
                        content={
                          state.isCustomThumbnailInProgress
                            ? 'Creating custom thumbnail...'
                            : 'Create custom thumbnail (T)'
                        }
                        placement="top"
                      >
                        <div
                          className={cn('btnCreateVideoThumbnail', {
                            inProgress: state.isCustomThumbnailInProgress,
                          })}
                          onClick={this.handleClickCustomThumbnail}
                        >
                          <Icon name="createVideoThumb" />
                        </div>
                      </Tooltip>
                    )}
                    {/* Upload custom thumbnail */}
                    {this.isMainApp && !props.diffData && (
                      <Tooltip content="Upload custom thumbnail (U)" placement="top">
                        <div
                          className={cn('btnUploadVideoThumbnail')}
                          onClick={this.handleClickUploadCustomThumbnail}
                        >
                          <Icon name="btnCollectionUpload" />
                        </div>
                      </Tooltip>
                    )}
                    {/* Crop */}
                    {this.isMainApp && !props.diffData && !ua.browser.isNotDesktop() && (
                      <Tooltip content="Crop video (C)" placement="top">
                        <div className="btnCrop" onClick={this.toggleCrop}>
                          <Icon name="scissors" />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  {/* Fullscreen */}
                  {!props.diffData && !isMobile && (
                    <Tooltip
                      content={`${
                        document.fullscreenElement ? 'Exit' : 'Enter'
                      } fullscreen mode (F)`}
                      placement="top"
                    >
                      <div className="btnFullscreenVideo" onClick={this.toggleFullscreen}>
                        <Icon name="fullscreen" />
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>
            </If>

            <If condition={isMobile}>
              <div className="btnsVideoControls">
                <div className="btnsRight">
                  <If condition={!props.diffData}>
                    <MenuOnHover
                      opener={`${state.currentQuality}p`}
                      activeItem={state.currentQuality}
                      list={qualitiesList}
                      handleItemClick={this.changeQuality}
                      additionalClass="qualityVideo"
                      hideOnClick
                    />
                  </If>
                </div>
              </div>
            </If>

            <input
              ref={this.$fileInput}
              style={{
                display: 'none',
              }}
              type="file"
              accept="image/jpeg"
              onChange={this.handleUploadCustomThumbnail}
            />

            {this.isMainApp && state.duration && !props.diffData && state.showCrop && (
              <Crop
                $video={this.$video.current}
                assetId={props.data._id}
                fileExtension={props.data.fileExtension}
                setCurrentTime={this.setCurrentTime}
                currentVideoTimecode={timeCodeValue.value}
                src={
                  state.qualities.length > 0
                    ? state.qualities[state.qualities.length - 1].proxyLink
                    : src
                }
              />
            )}
          </div>
        )}

        {/** Diff controls */}
        {props.diffData && state.isDiffVideoReady && (
          <div className="videoControls halfWidth" ref={this.$diffVideoControls}>
            {/* tracks */}
            <div className="videoTracks">
              <div
                className="videoTracksPadding"
                onClick={this.handleClickTimeline}
                onMouseMove={(e) => this.handleTimeLineHover(e, 'diff')}
              >
                <div ref={this.$hoveredTracks.diff} className={cn('hoveredTrack')}>
                  <span ref={this.$hoveredTrackTimes.diff} className="hoveredTime" />
                </div>
              </div>
              <div ref={this.$bufferedTracks.diff} className="bufferedTrack" />
              <div
                className="playbackTrack"
                style={{
                  width: `${(100 * state.diffCurrentTime) / state.diffDuration}%`,
                }}
              />
            </div>

            <div className="btnsVideoControls">
              <div className="btnsLeft">
                {/* Play/Pause */}
                <Tooltip content="Play/Pause (K)" placement="top">
                  <div
                    className={cn('btnPlayVideo', {
                      playing: state.isVideoPlaying,
                    })}
                    onClick={this.togglePlayState}
                  />
                </Tooltip>

                {/* Mute/Unmute */}
                <Tooltip content="Mute/Unmute" placement="top">
                  <div className="btnVolumeVideo" onClick={this.toggleDiffMuteState}>
                    <Icon name={cn({ sound: !state.isDiffMuted, soundMuted: state.isDiffMuted })} />
                  </div>
                </Tooltip>
                {/* Time */}
                <div className="timeVideo">
                  <span className="timeCurrentVideo">{parseTime(this.$diffVideo.current.currentTime || state.diffCurrentTime, { type: diffTimeCodeValue.value })}</span>
                  <span className="timeSeparatorVideo">/</span>
                  <span className="timeFullVideo">{parseTime(this.$diffVideo.current.duration || state.diffDuration, { type: diffTimeCodeValue.value })}</span>
                </div>
                <div className="timeCodeSelector">
                  <ReactSelect
                    isSearchable={false}
                    options={OPTIONS}
                    value={diffTimeCodeValue}
                    menuPlacement="top"
                    onChange={this.handleDiffTimecodeChange}
                  />
                </div>
              </div>
              <div className="btnsRight">
                {/* Fullscreen */}
                <Tooltip
                  content={`${document.fullscreenElement ? 'Exit' : 'Enter'} fullscreen mode (F)`}
                  placement="top"
                >
                  <div className="btnFullscreenVideo" onClick={this.toggleFullscreen}>
                    <Icon name="fullscreen" />
                  </div>
                </Tooltip>
              </div>
            </div>

            {this.isMainApp && !props.diffData && state.showCrop && (
              <Crop
                $video={this.$video.current}
                assetId={props.data._id}
                fileExtension={props.data.fileExtension}
                setCurrentTime={this.setCurrentTime}
                currentVideoTimecode={diffTimeCodeValue.value}
                src={
                  state.qualities.length > 0
                    ? state.qualities[state.qualities.length - 1].proxyLink
                    : src
                }
              />
            )}
          </div>
        )}

        {(state.isVideoWaiting || state.isDiffVideoWaiting || this.isPlayPromiseWaiting) && (
          <div className="videoIndicator buffering">Buffering...</div>
        )}
        {state.indicator && <div className="videoIndicator">{state.indicator}</div>}
        <div className="wrapperVideoDialog" ref={this.$dialogWrapper} />
        {!state.isVideoReady && <Spinner title="Loading video..." />}
      </div>
    );
  }
}

Player.propTypes = {
  data: object.isRequired,
  container: object.isRequired, // HTMLElement
  toggleMarkers: func,
  revisionId: string,
  revisionsUploadedCount: number.isRequired,
  reload: func.isRequired,
};

Player.defaultProps = {
  toggleMarkers: Function.prototype,
  revisionId: null,
};

export default Player;
