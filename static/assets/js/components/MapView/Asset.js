import React from 'react';
import dayjs from 'dayjs';
import {
  ASYNC_JOB_STATUS_WAITING,
  ASYNC_JOB_STATUS_RUNNING,
  ASYNC_JOB_STATUS_COMPLETE,
} from '@picsio/db/src/constants';
import { object, func, objectOf } from 'prop-types';
import { pollImage } from '../../helpers/images';
import pollGDThumbnail from '../../helpers/thumbnailPoller';
import Logger from '../../services/Logger';

import MediaPlaceholder from '../CatalogItem/MediaPlaceholder';
import { configErrors, configFormats, getConfigDefaultPlaceholder } from '../CatalogItem/config';
import Spinner from './Spinner';
import { navigate } from '../../helpers/history';

class Asset extends React.Component {
  static propTypes = {
    data: object,
    assetsActions: objectOf(func),
  };

  state = {
    isThumbnailLoaded: false,
    id: null,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.data && props.data._id !== state.id) {
      return {
        isThumbnailLoaded: false,
        id: props.data._id,
        placeholder: null,
      };
    }
    return null;
  }

  componentDidMount() {
    const { props } = this;

    if ([ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING].includes(props.data.thumbnailing)) {
      this.initThumbnailing();
    } else if (props.data.thumbnail === null) {
      if (dayjs(props.data.updatedAt).diff(dayjs(), 'hour') === 0 && props.data.storageType === 'gd') {
        this.initThumbnailing();
        this.poller = pollGDThumbnail(props.data._id);
      } else {
        this.initError();
      }
    } else if (!props.data.customThumbnail) {
      this.props.assetsActions.getThumbnails([props.data._id]);
    }
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;

    const hasBeenInProgress = [ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING].includes(
      prevProps.data.thumbnailing,
    );
    if (hasBeenInProgress && data.thumbnailing === ASYNC_JOB_STATUS_COMPLETE && data.thumbnail) {
      this.removePlaceholder();
      return;
    }

    const hasBeenCompleted = prevProps.data.thumbnailing === ASYNC_JOB_STATUS_COMPLETE;
    if (hasBeenCompleted && [ASYNC_JOB_STATUS_RUNNING, ASYNC_JOB_STATUS_WAITING].includes(data.thumbnailing)) {
      this.initThumbnailing();
      return;
    }

    if (data.thumbnail === null && prevProps.data.thumbnail !== null) {
      // if (Date.create(data.updatedAt).hoursAgo() === 0) {
      if (dayjs(data.updatedAt).diff(dayjs(), 'hour') === 0 && data.storageType === 'gd') {
        this.initThumbnailing();
        if (!this.poller) this.poller = pollGDThumbnail(data._id);
      } else {
        this.initError();
      }
    } else if (!prevProps.data.thumbnail && data.thumbnail && data.thumbnail.error) {
      this.initError(data.thumbnail.error);
    }
  }

  componentWillUnmount() {
    if (this.poller) {
      this.poller.stop();
      this.poller = undefined;
    }
  }

  /**
   * Init thumbnail error
   * @param {Object} params
   */
  initError = (params) => {
    const { props } = this;
    const extension = props.data.fileExtension && props.data.fileExtension.toLowerCase();
    const code = params && params.code;
    const config = configErrors[code] || getConfigDefaultPlaceholder();
    /** config.text may be a function */
    if (typeof config.text === 'function') config.text = config.text();
    const formatConfig = configFormats[extension];

    if (formatConfig) {
      config.icon = formatConfig.icon || config.icon;
      config.iconColor = formatConfig.iconColor || config.iconColor;
      config.text = formatConfig.text || config.text;
    } else {
      config.disableDownload = true;
    }

    this.renderPlaceholder(config);
  };

  initThumbnailing = () => {
    const { props } = this;
    const extension = props.data.fileExtension && props.data.fileExtension.toLowerCase();
    const config = { ...configErrors.thumbnailing };
    const formatConfig = configFormats[extension];

    if (formatConfig) {
      config.icon = formatConfig.icon || config.icon;
      config.iconColor = formatConfig.iconColor || config.iconColor;
      config.text = formatConfig.text || config.text;
    }
    this.renderPlaceholder(config);
  };

  /**
   * Set thumbnail placeholder
   * @param {Object} params
   */
  renderPlaceholder = ({
    icon, iconColor, text, btn, onClick, disableDownload, fullWidth,
  }) => {
    this.setState({
      placeholder: {
        iconClass: icon,
        iconColor,
        text,
        btn,
        onClick: onClick ? this[onClick].bind(this) : null,
        fileName: this.props.data.name,
        disableDownload,
        fullWidth,
      },
      isThumbnailLoaded: true,
    });
  };

  removePlaceholder = () => {
    this.setState({
      placeholder: null,
      isThumbnailLoaded: false,
    });
  };

  handleClick = () => {
    Logger.log('User', 'MapViewAssetClick');
    navigate(`/preview/${this.props.data._id}`);
  };

  handleThumbnailLoad = () => {
    this.setState({ isThumbnailLoaded: true });
  };

  handleThumbnailError = async () => {
    if (this.props.data.customThumbnail) {
      this.initThumbnailing();
      this.poller = pollImage(this.props.data.thumbnail.small);
      try {
        await this.poller.promise;
        this.handleThumbnailLoad();
      } catch (err) {
        Logger.error(new Error('Error custom thumbnail polling'), { error: err });
      }
    }
  };

  render() {
    const { state, props } = this;

    if (!props.data) return null;

    return (
      <div className="markerAsset" onClick={this.handleClick}>
        {!state.placeholder && (
          <div className="markerAssetName">
            <b>{props.data.name}</b>
          </div>
        )}
        <div className="markerAssetImage">
          {!state.isThumbnailLoaded && <Spinner />}
          {state.placeholder && <MediaPlaceholder thumbnailPlaceholder={state.placeholder} />}
          {props.data.thumbnail && !state.placeholder && (
            <img
              src={props.data.thumbnail.small}
              className={state.isThumbnailLoaded ? 'loaded' : 'loading'}
              onLoad={this.handleThumbnailLoad}
              onError={this.handleThumbnailError}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Asset;
