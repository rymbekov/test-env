import React from 'react';
import {
  object, bool, string, func, oneOfType,
} from 'prop-types';
import cn from 'classnames';
import ToolbarPreviewLeft from '../../toolbars/ToolbarPreviewLeft';
import * as utils from '../../../shared/utils';
import getDownloadUrl from '../../../helpers/getDownloadUrl';
import Logger from '../../../services/Logger';

import Spinner from './Spinner'; // eslint-disable-line

class Audio extends React.Component {
  /** Prop types */
  static propTypes = {
    asset: object,
    isMainApp: bool,
    revisionID: string,
    addRevision: oneOfType([bool, func]),
    handleDownload: func,
    moveToTrash: oneOfType([bool, func]),
  };

  $iframe = React.createRef();

  $audio = React.createRef();

  state = {
    assetId: null,
    src: null,
    isLoaded: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.asset._id !== state.assetId) {
      return {
        assetId: props.asset._id,
        isLoaded: false,
      };
    }
    return null;
  }

  componentDidMount() {
    window.addEventListener('revision:added', this.reloadView, false);
    this.updateSrc(this.props.asset._id);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.assetId !== this.state.assetId) this.updateSrc(this.state.assetId);
  }

  componentWillUnmount() {
    window.removeEventListener('revision:added', this.reloadView, false);
  }

  updateSrc = async (assetId) => {
    if (this.$iframe.current) return this.reloadView();

    let src;
    try {
      src = await getDownloadUrl({ assetId, allowDownloadByGS: false });
    } catch (err) {
      Logger.error(new Error('Can not get download url [Audio]'), {
        error: err,
        assetId,
      });
    }
    this.setState({ src }, this.reloadView);
  };

  reloadView = () => {
    /* reload iframe */
    if (this.$iframe.current) this.$iframe.current.src = this.$iframe.current.src;
    /* reload audio */
    if (this.$audio.current) this.$audio.current.load();
  };

  onLoad = () => this.setState({ isLoaded: true });

  render() {
    const {
      props, state, $audio, $iframe, onLoad,
    } = this;
    const { src, isLoaded } = state;
    const {
      asset, isMainApp, addRevision, handleDownload, moveToTrash, isRemoveForever,
    } = props;
    const isGDstorageFileOnWebsite = !isMainApp && asset.storageType === 'gd';
    const isRestricted = utils.isAssetRestricted(asset.restrictSettings);

    return (
      <div className="innerContainerMediaFile">
        {isMainApp && (
          <ToolbarPreviewLeft
            assetId={asset._id}
            addRevision={addRevision}
            download={handleDownload}
            moveToTrash={moveToTrash}
            permissions={asset.permissions}
            isRestricted={isRestricted}
            isRemoveForever={isRemoveForever}
            isArchived={asset.archived}
          />
        )}
        <div className={cn('theMediaFile', { theMediaFileAudio: !isGDstorageFileOnWebsite })}>
          {isGDstorageFileOnWebsite ? (
            <iframe
              style={{ opacity: isLoaded ? 1 : 0 }}
              ref={$iframe}
              onLoad={onLoad}
              src={`https://docs.google.com/file/d/${asset.storageId}/preview`}
              frameBorder="0"
            />
          ) : (
            <audio controls preload="auto" onCanPlay={onLoad} onLoadedMetadata={onLoad} ref={$audio}>
              <source src={src} type={asset.mimeType} />
            </audio>
          )}

          {/* spinner */}
          {!isLoaded && <Spinner title="Loading audio..." />}
        </div>
      </div>
    );
  }
}

export default Audio;
