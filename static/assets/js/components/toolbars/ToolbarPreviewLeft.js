import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import {
  DownloadList,
  Message,
  Delete,
  Download,
  Web,
  Edit,
  AddRevision,
} from '@picsio/ui/dist/icons';
// import { IconButton } from '@picsio/ui';
import { toggleDownloadList } from '../../store/actions/main';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import { checkUserAccess } from '../../store/helpers/user';
import Group from './Group';
import UploadButton from './UploadButton';
import HelpButton from './HelpButton';
import Button from './Button';
import ToolbarVideoControls from './ToolbarVideControls';
import { assetSelector } from '../../store/selectors/assets';
// import Tooltip from '../Tooltip';
import { navigate } from '../../helpers/history';
import sendEventToIntercom from '../../services/IntercomEventService';

const ToolbarPreviewLeft = (props) => {
  const {
    assetId,
    asset,
    getSnapshot,
    createCustomThumbnail,
    uploadCustomThumbnail,
    cropVideo,
    isVideoPlayer,
    isArchived,
    rolePermissions,
    hasWatermark,
  } = props;
  const isArchiveAllowed = checkUserAccess('subscriptions', 'archive');
  const isDeleteArchiveAllowed = (isArchived ? isArchiveAllowed && checkUserAccess('permissions', 'deleteArchive') : true);
  const isDownloadArchiveAllowed = (isArchived ? isArchiveAllowed && checkUserAccess('permissions', 'downloadArchive') : true);

  const { allowAssetSharing } = asset;

  const handleShare = () => {
    Logger.log('User', 'PreviewShare');
    sendEventToIntercom('share from preview');
    if (allowAssetSharing) {
      navigate(`/singlesharing/${assetId}`);
    } else {
      navigate('/billing?tab=overview');
    }
  };

  return (
    <div className="toolbar toolbarVertical toolbarPreviewLeft">
      <Group>
        <If condition={props.isMultipage}>
          <Button
            id="button-multipage"
            icon="pages"
            isActive={props.isActive}
            onClick={() => {
              Logger.log('User', 'PreviewMultipagePanel');
              props.handleOnClick();
            }}
            tooltip={
              props.isActive
                ? localization.TOOLBARS.titleHideMultipagePanel
                : localization.TOOLBARS.titleShowMultipagePanel
            }
          />
        </If>
        <If condition={allowAssetSharing}>
          {/* <Tooltip
            content={localization.TOOLBARS.titleShare}
            placement="right"
          >
            <IconButton
              onClick={handleShare}
              className="toolbarButton"
            >
              <FolderPublic />
            </IconButton>
          </Tooltip> */}
          <Button
            id="button-share"
            icon={() => <Web />}
            onClick={handleShare}
            tooltip={localization.TOOLBARS.titleShare}
          />
        </If>
        <If condition={props.addRevision && !isArchived}>
          <UploadButton
            addRevision={props.addRevision}
            isDisabled={!props.subscriptionFeatures.revisions}
            icon={AddRevision}
            iconSize="xl"
          />
        </If>
        <If condition={props.permissions.allowEditor}>
          <>
            {props.openEditor && !isArchived && !hasWatermark && (
              <Button
                id="button-editor"
                icon={() => <Edit />}
                additionalClass="tabletHidden"
                onClick={() => {
                  props.openEditor();
                }}
                tooltip={props.subscriptionFeatures.revisions
                  ? localization.TOOLBARS.titleEdit : localization.UPGRADE_PLAN.tooltipForButtons}
                isDisabled={!props.subscriptionFeatures.revisions}
              />
            )}
            {/* {props.rotateckw && (
              <Button
              id="button-rotateckw"
              icon="rotateckw"
              onClick={() => {
              Logger.log('User', 'PreviewRotate', 'ckw');
              props.rotateckw();
              }}
              tooltip={localization.TOOLBARS.titleRotateCW}
              />
            )} */}
            {props.rotateantickw && (
              <Button
                id="button-rotateantickw"
                icon="rotateantickw"
                onClick={() => {
                  Logger.log('User', 'PreviewRotate', 'antickw');
                  props.rotateantickw();
                }}
                tooltip={localization.TOOLBARS.titleRotateCCW}
              />
            )}
            {props.flipy && (
              <Button
                id="button-flipy"
                icon="flipy"
                onClick={() => {
                  Logger.log('User', 'PreviewFlip', 'FlipY');
                  props.flipy();
                }}
                tooltip={localization.TOOLBARS.titleVerticalFlip}
              />
            )}
            {props.flipx && (
              <Button
                id="button-flipx"
                icon="flipx"
                onClick={() => {
                  Logger.log('User', 'PreviewFlip', 'FlipX');
                  props.flipx();
                }}
                tooltip={localization.TOOLBARS.titleHorizontalFlip}
              />
            )}
          </>
        </If>
        <If condition={props.download && (!props.isRestricted
          || (props.isRestricted && props.rolePermissions.restrictedDownload))
          && isDownloadArchiveAllowed}
        >
          <Button
            id="button-previewDownload"
            icon={() => <Download />}
            onClick={() => {
              Logger.log('User', 'PreviewDownload', { assetId });
              props.download();
            }}
            tooltip={localization.TOOLBARS.titleDownload}
          />
        </If>
        <If condition={props.permissions.downloadFiles && (isArchived ? rolePermissions.downloadArchive : true)
          && (props.downloadListItems.length > 0 || props.mainStore.downloadListOpened)}
        >
          <Button
            id="button-previewDownloadList"
            icon={() => <DownloadList />}
            tooltip={localization.TOOLBARS.titleDownloadDialog}
            onClick={() => {
              Logger.log('User', 'DonwloadPanelShowClicked');
              props.actions.toggleDownloadList();
            }}
            additionalClass={
              props.mainStore.importOpened ? 'disabled' : props.mainStore.downloadListOpened ? 'active' : null
            }
            counter={props.downloadListItems.length}
          />
        </If>
        <If condition={props.moveToTrash && isDeleteArchiveAllowed
          && (!props.isRestricted || (props.isRestricted && props.rolePermissions.restrictedMoveOrDelete))}
        >
          <Button
            id="button-previewTrash"
            icon={() => <Delete />}
            onClick={() => {
              Logger.log('User', 'PreviewTrash', { assetId });
              props.moveToTrash();
            }}
            tooltip={
              props.isRemoveForever ? localization.TOOLBARS.titleRemoveForever : localization.TOOLBARS.titleRemove
            }
          />
        </If>
        <If condition={isVideoPlayer}>
          <ToolbarVideoControls
            getSnapshot={getSnapshot}
            createCustomThumbnail={createCustomThumbnail}
            uploadCustomThumbnail={uploadCustomThumbnail}
            cropVideo={cropVideo}
          />
        </If>
        <If condition={props.originalSizeImg}>
          <Button
            id="button-fitsize"
            icon={props.originalSizeImg.fit ? 'originalSizeImg' : 'fitSizeImg'}
            onClick={() => {
              Logger.log('User', 'PreviewChangeZoom');
              props.originalSizeImg.handler();
            }}
            tooltip={props.originalSizeImg.fit ? localization.TOOLBARS.titleZoom : localization.TOOLBARS.titleFit}
          />
        </If>
      </Group>
      <Group>
        <HelpButton tooltipPosition="left" component="previewView" />
        <Button
          icon={() => <Message />}
          id="itemliveSupport"
          tooltip={
            props.subscriptionFeatures.chatSupport
              ? localization.TOOLBARS.titleLiveSupport
              : `${localization.TOOLBARS.titleLiveSupport}.<br>${localization.UPGRADE_PLAN.tooltipBasic}`
          }
          onClick={function () {
            props.subscriptionFeatures.chatSupport && window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
          }}
          isDisabled={!props.subscriptionFeatures.chatSupport}
        >
          <span className="toolbarCounter liveSupportCounter" />
        </Button>
      </Group>
    </div>
  );
};

ToolbarPreviewLeft.defaultProps = {
  hasWatermark: null,
  isVideoPlayer: null,
  isArchived: null,
  cropVideo: null,
  uploadCustomThumbnail: null,
  createCustomThumbnail: null,
  getSnapshot: null,
};

ToolbarPreviewLeft.propTypes = {
  assetId: PropTypes.string.isRequired,
  getSnapshot: PropTypes.func,
  createCustomThumbnail: PropTypes.func,
  uploadCustomThumbnail: PropTypes.func,
  cropVideo: PropTypes.func,
  hasWatermark: PropTypes.bool,
  isVideoPlayer: PropTypes.bool,
  isArchived: PropTypes.bool,
};

const ConnectedToolbarPreviewLeft = connect(
  (store, props) => ({
    mainStore: store.main,
    downloadListItems: store.downloadList.items,
    rolePermissions: store.user.role.permissions || {},
    subscriptionFeatures: store.user.subscriptionFeatures || {},
    asset: assetSelector(store, props),
  }),
  (dispatch) => ({
    actions: bindActionCreators({ toggleDownloadList }, dispatch),
  }),
)(ToolbarPreviewLeft);

export default (props) => (<ConnectedToolbarPreviewLeft {...props} />);
