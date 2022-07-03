import React from 'react';
import {
  object, bool, string, func, number, array, oneOfType,
} from 'prop-types';
import dayjs from 'dayjs';
import cn from 'classnames';
import { ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING } from '@picsio/db/src/constants';
import ua from '../../../../ua';

import picsioConfig from '../../../../../../../config';
import * as utils from '../../../../shared/utils';
import Logger from '../../../../services/Logger';
import { getCustomVideoUrl } from '../../../../api/assets';
import ToolbarPreviewLeft from '../../../toolbars/ToolbarPreviewLeft';

import getDownloadUrl from '../../../../helpers/getDownloadUrl';
import Marker from '../Marker';
import Player from './Player';
import Placeholder from '../Placeholder';

const MP4 = 'video/mp4';

class Video extends React.Component {
  /** prop types */
  static propTypes = {
    model: object.isRequired,
    diffVideo: object,
    diffID: string, // diff storageId
    handleLoadedVideo: func,
    removeMarker: func,
    addRevision: oneOfType([func, bool]),
    addMarker: func,
    handleDownload: oneOfType([func, bool]),
    moveToTrash: oneOfType([func, bool]),
    markers: array,
    modifyTmpMarkers: func,
    commentsWithMarkers: array,
    tmpMarkers: array,
    listenToClick: bool,
    revisionID: string,
    activeRevisionNumber: number,
    diffRevisionNumber: number,
  };

  /** default props */
  static defaultProps = {
    handleLoadedVideo: Function.prototype,
    markers: [],
    tmpMarkers: [],
  };

  static isMainApp = picsioConfig.isMainApp();

  $theMediaFile = React.createRef();

  $videoWrapper = React.createRef();

  $markersWrapper = React.createRef();

  $player = React.createRef();

  state = {
    canPlayVideo: false,
    markersContainerStyles: { width: '100%', height: '100%' },
    videoData: null,
    diffVideoData: null,
    hiddenButtons: this.isMainApp
      ? []
      : ['quality', 'takeSnapshot', 'createCustomThumbnail', 'crop'],
    revisionCommentsWithMarkers: [],
    revisionsUploadedCount: 0,
  };

  componentDidMount() {
    this.renderVideo();
    window.addEventListener('resize', this.updateMarkersWrapper);
    window.addEventListener('preview:ui:resize', this.updateMarkersWrapper, false);
    window.addEventListener('revision:added', this.onAddRevision, false);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.listenToClick) {
      document.addEventListener('mousedown', this.setMarker);
    } else {
      document.removeEventListener('mousedown', this.setMarker);
    }

    if (
      this.props.commentsWithMarkers !== nextProps.commentsWithMarkers
      || this.props.revisionID !== nextProps.revisionID
    ) {
      this.renderMarkers(
        nextProps.commentsWithMarkers,
        nextProps.headRevisionId,
        nextProps.revisionID,
      );
    }
  }

  componentDidUpdate(prevProps) {
    const { props } = this;
    /** Asset changed, revision or diff */
    if (
      props.model._id !== prevProps.model._id
      || props.revisionID !== prevProps.revisionID
      || props.diffID !== prevProps.diffID
    ) {
      this.renderVideo();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('revision:added', this.onAddRevision, false);
    window.removeEventListener('resize', this.updateMarkersWrapper);
    window.removeEventListener('preview:ui:resize', this.updateMarkersWrapper, false);

    document.removeEventListener('mousedown', this.setMarker);
  }

  getUserId() {
    return picsioConfig.isMainApp() ? this.props.teamId : window.websiteConfig.userId;
  }

  getOriginalSrc = async ({ _id, mimeType, customVideo }) => {
    if (!picsioConfig.isMainApp()) return null;
    try {
      if (customVideo && mimeType !== MP4) return await getCustomVideoUrl(_id);
      if (mimeType !== 'video/mp4') return null;
      return await getDownloadUrl({ assetId: _id, allowDownloadByGS: false });
    } catch (err) {
      return null;
    }
  };

  buildRevisionStreamProxyUrl = async (
    {
      _id, customVideo, storageId, mimeType, storageType,
    },
    userId,
    revisionId,
  ) => {
    if (customVideo) return await getCustomVideoUrl(_id, revisionId);
    if (mimeType !== 'video/mp4') return;
    if (storageType !== 'gd') {
      /** no need head revision id for s3 */
      if (revisionId === 'head') revisionId = undefined;
      return getDownloadUrl({ assetId: _id, revisionId, allowDownloadByGS: false });
    }
    return `${picsioConfig.proxy.BASE_URL}/revisionstream/${storageId}/${revisionId}?userId=${userId}`;
  };

  makeVideoData = async (asset, { src, name } = {}) => {
    const {
      _id, storageId, fileExtension, mimeType, thumbnail, customVideo,
    } = asset;
    src = src
      || (await this.getOriginalSrc(asset))
      || (await this.buildRevisionStreamProxyUrl(asset, this.getUserId(), 'head'));
    return {
      _id,
      storageId,
      fileExtension,
      mimeType: customVideo ? MP4 : mimeType,
      src,
      name: name || asset.name,
      poster: thumbnail,
    };
  };

  renderVideo = async () => {
    const {
      model,
      diffVideo,
      diffID,
      revisionID,
      activeRevisionNumber,
      diffRevisionNumber,
    } = this.props;
    let currentVideoSrc;
    /** Data for render */
    let data;

    // if revision is visible now, change src
    const userId = this.getUserId();
    if (revisionID) {
      currentVideoSrc = await this.buildRevisionStreamProxyUrl(model, userId, revisionID);
    }

    if (diffVideo) {
      const currentVideoData = await this.makeVideoData(model);
      const diffVideoData = await this.makeVideoData(diffVideo);

      data = [currentVideoData, diffVideoData];
    } else if (diffID) {
      const currentVideoData = await this.makeVideoData(model, {
        src: currentVideoSrc,
        name: `Revision ${activeRevisionNumber}`,
      });
      const diffIDSrc = await this.buildRevisionStreamProxyUrl(model, userId, diffID);
      const diffVideoData = await this.makeVideoData(model, {
        src: diffIDSrc,
        name: `Revision ${diffRevisionNumber}`,
      });

      data = [currentVideoData, diffVideoData];
    } else {
      data = await this.makeVideoData(model, { src: currentVideoSrc });
    }

    if (Array.isArray(data)) {
      this.setState(
        { videoData: data[0], diffVideoData: data[1], error: null },
        this.updateMarkersWrapper,
      );
    } else {
      this.setState(
        { videoData: data, diffVideoData: null, error: null },
        this.updateMarkersWrapper,
      );
    }
  };

  updateMarkersWrapper = () => {
    // wait until right toolbar is closed/opened
    setTimeout(() => {
      this.setState({
        markersContainerStyles: this.getMarkerContainerStyles(),
      });
    }, 0);
  };

  onAddRevision = () => {
    this.setState({ revisionsUploadedCount: this.state.revisionsUploadedCount + 1 });
    this.renderVideo();
  };

  /**
   * Set marker from event click
   * @param {MouseEvent} event
   * @param {Number} event.clientX
   * @param {Number} event.clientY
   */
  setMarker = ({ clientX, clientY }) => {
    const videoRect = this.$markersWrapper.current.getBoundingClientRect();

    /* if pointer outside the video - do nothing */
    if (
      !(
        clientX > videoRect.left
        && clientX < videoRect.left + videoRect.width
        && clientY > videoRect.top
        && clientY < videoRect.top + videoRect.height
      )
    ) {
      return this.props.addMarker(null);
    }

    const left = (clientX - videoRect.left) / videoRect.width;
    const top = (clientY - videoRect.top) / videoRect.height;

    const markerData = {
      x: left,
      y: top,
      // createdAt: Date.now(),
      createdAt: dayjs(),
    };

    /* save marker */
    this.props.addMarker(markerData);
    document.removeEventListener('click', this.setMarker);
  };

  /**
   * Mouse down on tmp marker resize
   * @param {MouseEvent} e
   * @param {Number} index
   */
  onMarkerMouseDownResize = (e, index) => {
    e.preventDefault();
    e.stopPropagation();

    const { tmpMarkers } = this.props;
    const marker = tmpMarkers[index];

    if (marker) {
      const mousemoveHandler = (e) => {
        e.stopPropagation();
        const clientX = e.pageX;
        const clientY = e.pageY;
        const videoRect = this.$markersWrapper.current.getBoundingClientRect();

        /* if pointer outside the image - do nothing */
        if (
          !(
            clientX > videoRect.left
            && clientX < videoRect.left + videoRect.width
            && clientY > videoRect.top
            && clientY < videoRect.top + videoRect.height
          )
        ) {
          return;
        }

        const left = (clientX - videoRect.left) / videoRect.width;
        const top = (clientY - videoRect.top) / videoRect.height;

        marker.x2 = marker.x > left ? marker.x : left;
        marker.y2 = marker.y > top ? marker.y : top;

        this.props.modifyTmpMarkers(tmpMarkers);
      };
      const mouseupHandler = () => {
        document.removeEventListener('mousemove', mousemoveHandler);
        document.removeEventListener('mouseup', mouseupHandler);
      };

      document.addEventListener('mousemove', mousemoveHandler);
      document.addEventListener('mouseup', mouseupHandler);
    }
  };

  /**
   * Mouse down on tmp marker
   * @param {MouseEvent} event
   * @param {Number} index
   */
  onMarkerMouseDown(e, index) {
    e.stopPropagation();

    const { tmpMarkers } = this.props;
    const marker = tmpMarkers[index];

    if (marker) {
      const mousemoveHandler = (e) => {
        e.stopPropagation();
        const clientX = e.pageX;
        const clientY = e.pageY;
        const videoRect = this.$markersWrapper.current.getBoundingClientRect();

        /* if pointer outside the image - do nothing */
        if (
          !(
            clientX > videoRect.left
            && clientX < videoRect.left + videoRect.width
            && clientY > videoRect.top
            && clientY < videoRect.top + videoRect.height
          )
        ) {
          return;
        }

        const left = (clientX - videoRect.left) / videoRect.width;
        const top = (clientY - videoRect.top) / videoRect.height;

        // if rectangle selection - move 2 points
        if (marker.x2 !== undefined && marker.y2 !== undefined) {
          // handle x and x2
          const newX2 = marker.x2 + left - marker.x;
          if (newX2 <= 1) {
            marker.x = left;
            marker.x2 = newX2;
          } else {
            marker.x = left + 1 - newX2;
            marker.x2 = 1;
          }

          // handle y and y2
          const newY2 = marker.y2 + top - marker.y;
          if (newY2 <= 1) {
            marker.y2 = newY2;
            marker.y = top;
          } else {
            marker.y = top + 1 - newY2;
            marker.y2 = 1;
          }
        } else {
          // if single marker
          marker.x = left;
          marker.y = top;
        }

        this.props.modifyTmpMarkers(tmpMarkers);
      };
      const mouseupHandler = () => {
        document.removeEventListener('mousemove', mousemoveHandler);
        document.removeEventListener('mouseup', mouseupHandler);
      };

      document.addEventListener('mousemove', mousemoveHandler);
      document.addEventListener('mouseup', mouseupHandler);
    }
  }

  getMarkerContainerStyles() {
    const markersContainerStyles = { width: '100%', height: '100%' };
    const $videoWrapper = this.$videoWrapper.current;

    if (!$videoWrapper) return markersContainerStyles;
    const $video = $videoWrapper.querySelector('video');
    if (!$video || !$video.videoHeight || !$video.videoWidth) return markersContainerStyles;

    const probablyWidth = ($video.videoWidth * $videoWrapper.offsetHeight) / $video.videoHeight;

    if (probablyWidth < $videoWrapper.offsetWidth) {
      markersContainerStyles.width = probablyWidth;
      markersContainerStyles.height = $videoWrapper.offsetHeight;
      markersContainerStyles.left = ($videoWrapper.offsetWidth - probablyWidth) / 2;
    } else {
      const height = ($video.videoHeight * $videoWrapper.offsetWidth) / $video.videoWidth;
      markersContainerStyles.width = $videoWrapper.offsetWidth;
      markersContainerStyles.height = height;
      markersContainerStyles.top = ($videoWrapper.offsetHeight - height) / 2;
    }
    return markersContainerStyles;
  }

  renderMarkers(commentsWithMarkers, headRevisionId, activeRevisionId) {
    const revisionId = activeRevisionId || headRevisionId;
    const revisionCommentsWithMarkers = commentsWithMarkers.filter(
      ({ revisionID }) => revisionID === revisionId,
    );
    this.setState({ revisionCommentsWithMarkers });
  }

  handleCanPlay = (error) => {
    if (error) {
      const { model } = this.props;
      // const isThumbnailing = model.updatedAt && Date.create(model.updatedAt).hoursAgo() === 0;
      const isThumbnailing = model.updatedAt && dayjs(model.updatedAt).diff(dayjs(), 'hour') === 0;

      const state = { isThumbnailing };
      if (!isThumbnailing && !ua.isMobileApp()) {
        const message = error.message || 'Can not play video';
        Logger.warn(new Error('Player: can not load video data'), { error, showDialog: true }, [
          'LoadVideoFailed',
          { assetId: model._id, message },
        ]);

        state.error = message;
      } else if (ua.isMobileApp()) {
        const message = error.message || 'Can not play video';
        Logger.warn(
          new Error(
            `Player: can not load video data in mobile ${utils.capitalizeFirstLetter(
              ua.getPlatform(),
            )}App`,
          ),
          { error, showDialog: true },
          ['LoadVideoInMobileAppFailed', { assetId: model._id, message }],
        );
      }
      this.setState(state);
    } else {
      this.setState({
        markersContainerStyles: this.getMarkerContainerStyles(),
      });
    }
    this.props.handleLoadedVideo();
  };

  getSnapshot = () => {
    this.$player.current.handleClickScreenshot();
  };

  createCustomThumbnail = () => {
    this.$player.current.handleClickCustomThumbnail();
  };

  uploadCustomThumbnail = (e) => {
    this.$player.current.handleClickUploadCustomThumbnail(e);
  };

  cropVideo = () => {
    this.$player.current.toggleCrop();
  };

  render() {
    const { state, props } = this;
    const {
      markers,
      tmpMarkers,
      removeMarker,
      addRevision,
      handleDownload,
      moveToTrash,
      model,
    } = props;

    const isTranscoding = [ASYNC_JOB_STATUS_RUNNING, ASYNC_JOB_STATUS_WAITING].includes(
      model.transcoding,
    );

    if (state.error || (isTranscoding && model.mimeType !== MP4)) {
      return (
        <Placeholder
          model={model}
          isTranscoding={isTranscoding}
          handleDownload={handleDownload}
          moveToTrash={moveToTrash}
          addRevision={addRevision}
        />
      );
    }

    const isRestricted = utils.isAssetRestricted(props.model.restrictSettings);

    return (
      <div className="innerContainerMediaFile">
        {picsioConfig.isMainApp() && !this.props.diffVideo && (
          <ToolbarPreviewLeft
            assetId={model._id}
            addRevision={addRevision}
            download={handleDownload}
            moveToTrash={moveToTrash}
            permissions={model.permissions}
            isRestricted={isRestricted}
            isRemoveForever={props.isRemoveForever}
            getSnapshot={this.getSnapshot}
            createCustomThumbnail={this.createCustomThumbnail}
            uploadCustomThumbnail={this.uploadCustomThumbnail}
            cropVideo={this.cropVideo}
            isVideoPlayer
            isArchived={model.archived}
          />
        )}
        <div className="theMediaFile" ref={this.$theMediaFile}>
          <div
            className="markersContainer"
            style={this.state.markersContainerStyles}
            ref={this.$markersWrapper}
          >
            {/* Comment markers */}
            {markers.length > 0
              && markers.map((markersItem) => markersItem.markers.map((marker, index) => <Marker key={marker.number || index} marker={marker} />))}
            {/* Tmp Markers */}
            {tmpMarkers.length > 0
              && tmpMarkers.map((marker, index) => (
                <Marker
                  key={marker.number}
                  marker={marker}
                  onRemove={() => removeMarker(index)}
                  onMouseDown={(event) => this.onMarkerMouseDown(event, index)}
                  onMouseDownResize={(event) => this.onMarkerMouseDownResize(event, index)}
                />
              ))}
          </div>
          <div
            className={cn('wrapperBeautyVideo', { compareVideos: state.diffVideoData })}
            ref={this.$videoWrapper}
          >
            {state.videoData && (
              <Player
                ref={this.$player}
                data={state.videoData}
                diffData={state.diffVideoData}
                revisionId={props.revisionID}
                setCustomThumbnail={props.setCustomThumbnail}
                revisionsUploadedCount={state.revisionsUploadedCount}
                revisionCommentsWithMarkers={state.revisionCommentsWithMarkers}
                markers={markers}
                container={this.$theMediaFile.current}
                onCanPlay={this.handleCanPlay}
                toggleMarkers={props.toggleMarkers}
                subscriptionFeatures={props.subscriptionFeatures}
                reload={this.renderVideo}
                setCommentTimeRange={this.props.setCommentTimeRange}
                isCheckedAttachTime={this.props.isCheckedAttachTime}
                commentsRange={this.props.commentsRange}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Video;
