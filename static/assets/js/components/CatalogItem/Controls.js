import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@picsio/ui';
import {
  Dublicate,
  AddRevision,
  CommentAdd,
  Edit,
  Download,
  Delete,
  DeleteFrom,
  RestoreFrom,
  Web,
} from '@picsio/ui/dist/icons';
import { useDispatch } from 'react-redux';
import showSelectFromTreeDialog from '../../helpers/showSelectFromTreeDialog';
import picsioConfig from '../../../../../config';
import Store from '../../store';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import * as collectionsActions from '../../store/actions/collections';
import Tooltip from '../Tooltip';
import Name from './Name';
import Colors from './Colors';
import Button from './ControlButton';
import { navigate } from '../../helpers/history';
import { showErrorDialog } from '../dialog';
import sendEventToIntercom from '../../services/IntercomEventService';

export default function Controls(props) {
  const {
    allowAssetSharing,
    assetId,
    assetSharing,
    color,
    colorChangeable,
    colorShow,
    commentsEdit,
    commentsEnable,
    deleteForever,
    downloadFiles,
    enableEditor,
    fileExtension,
    fileNameShow,
    handleDownload,
    handleRemoveLightboard,
    handleUploadClick,
    isAssetFromInbox,
    isEditableInPicsioEditor,
    isGoogleDriveDocument,
    isLightboardsView,
    isListViewMode,
    isMobileView,
    isShared,
    isTrashed,
    itemWidth,
    mimeType,
    removeFiles,
    restoreAssets,
    revisionsLength,
    shortName,
    storageId,
    storageType,
    title,
    trashAssets,
    uploadFiles,
    duplicateAsset,
    allowDuplicateAsset,
  } = props;

  const dispatch = useDispatch();

  const handleShare = () => {
    sendEventToIntercom('share from thumbnail');
    if (allowAssetSharing) {
      Logger.log('User', 'ThumbnailShareAsset');
      navigate(`/singlesharing/${assetId}`);
    } else {
      navigate('/billing?tab=overview');
    }
  };
  const handleDuplicate = () => {
    if (!picsioConfig.isMainApp()) {
      console.info('Duplicate is only allowed in the main application');
      return;
    }

    Logger.log('User', 'ThumbnailCopyAsset');
    const rootCollection = Store.getState().collections.collections.my;
    const { _id } = rootCollection;
    const onLoadChildren = async (item) => dispatch(collectionsActions.getChildren(item._id));

    showSelectFromTreeDialog({
      title: localization.DIALOGS.DUPLICATE_ASSET_TO.TITLE,
      treeListItems: [rootCollection],
      onLoadChildren,
      onOk: async (selectedCollections) => {
        duplicateAsset(assetId, selectedCollections[0], true, true);
      },
      textBtnOk: localization.DIALOGS.DUPLICATE_ASSET_TO.OK,
      textBtnCancel: localization.DIALOGS.DUPLICATE_ASSET_TO.CANCEL,
      type: 'duplicate',
      openedItems: [_id],
    });
  };

  const handleClickEdit = () => {
    if (isGoogleDriveDocument) {
      utils.openDocument(storageId, mimeType);
    } else if (isEditableInPicsioEditor) {
      navigate(`/develop/${assetId}`);
    } else {
      showErrorDialog('Document editing is not supported yet');
    }
  };

  const handleAddCommentClick = () => {
    Logger.log('User', 'ThumbnailCommentAddClick');
    navigate(`preview/${assetId}#comments?focus=true`);
  };

  const handleRemove = () => {
    Logger.log('User', 'ThumbnailTrash');
    trashAssets([assetId]);
  };

  const handleRestore = () => {
    Logger.log('User', 'ThumbnailRestoreFromTrash');
    restoreAssets([assetId]);
  };

  const tooltipPlacement = isListViewMode ? 'top' : 'left';

  return (
    <div className="catalogItem__controls">
      <div className="catalogItem__controls-top">
        <Name
          storageType={storageType}
          fileNameShow={fileNameShow}
          isListViewMode={isListViewMode}
          storageId={storageId}
          shortName={shortName}
          fileExtension={fileExtension}
          title={title}
          itemWidth={itemWidth}
        />
        <If condition={colorShow}>
          <Colors assetId={assetId} color={color} disabled={!colorChangeable} />
        </If>
      </div>
      <If condition={!isMobileView}>
        <div className="catalogItem__controls-bottom">
          <If condition={picsioConfig.isMainApp() && allowAssetSharing}>
            <Tooltip
              content={
                !assetSharing
                  ? `${localization.CATALOG_ITEM.tooltipShareAsset}.<br>
                    ${localization.UPGRADE_PLAN.tooltip}`
                  : isShared
                    ? localization.CATALOG_ITEM.tooltipShareAssetSettings
                    : localization.CATALOG_ITEM.tooltipShareAsset
              }
              placement={tooltipPlacement}
            >
              <IconButton
                size="md"
                className="catalogItem__button"
                color="inherit"
                isActive={isShared}
                onClick={handleShare}
                componentProps={{
                  'data-testid': 'catalogItemShare',
                }}
              >
                <Web />
              </IconButton>
            </Tooltip>
          </If>
          {/* <If condition={allowDuplicateAsset && !isLightboardsView}>
            <Tooltip content={localization.CATALOG_ITEM.tooltipDuplicate} transition={false}>
              <IconButton size="md" className="catalogItem__button" color="inherit" onClick={handleDuplicate}>
                <Dublicate />
              </IconButton>
            </Tooltip>
          </If> */}
          <If condition={picsioConfig.isMainApp() && allowDuplicateAsset && !isLightboardsView}>
            <Tooltip
              content={localization.CATALOG_ITEM.tooltipDuplicate}
              placement={tooltipPlacement}
            >
              <IconButton
                size="md"
                className="catalogItem__button"
                color="inherit"
                onClick={handleDuplicate}
                componentProps={{
                  'data-testid': 'catalogItemDuplicate',
                }}
              >
                <Dublicate />
                {/* <Copy /> */}
              </IconButton>
            </Tooltip>
          </If>
          <If condition={picsioConfig.isMainApp()}>
            <Choose>
              <When condition={uploadFiles}>
                <Tooltip
                  content={localization.CATALOG_ITEM.tooltipAddRevision}
                  placement={tooltipPlacement}
                >
                  <IconButton
                    size="md"
                    className="catalogItem__button"
                    color="inherit"
                    onClick={handleUploadClick}
                    componentProps={{
                      'data-testid': 'catalogItemUpload',
                    }}
                  >
                    <AddRevision />
                  </IconButton>
                </Tooltip>
              </When>
              <When condition={!isTrashed && uploadFiles}>
                <Tooltip
                  content={localization.UPGRADE_PLAN.tooltipForButtons}
                  placement={tooltipPlacement}
                >
                  <IconButton
                    size="md"
                    className="catalogItem__button disabled"
                    color="inherit"
                    onClick={() => {}}
                    componentProps={{
                      'data-testid': 'catalogItemAddRevision',
                    }}
                  >
                    <AddRevision />
                  </IconButton>
                </Tooltip>
              </When>
              <Otherwise>
                {null}
              </Otherwise>
            </Choose>
          </If>
          <If condition={commentsEnable && commentsEdit && isListViewMode}>
            <Tooltip
              content={localization.CATALOG_ITEM.tooltipAddComment}
              placement={tooltipPlacement}
            >
              <IconButton
                size="md"
                className="catalogItem__button"
                color="inherit"
                onClick={handleAddCommentClick}
                componentProps={{
                  'data-testid': 'catalogItemComment',
                }}
              >
                <CommentAdd />
              </IconButton>
            </Tooltip>
          </If>
          <If condition={downloadFiles}>
            <Tooltip
              content={localization.CATALOG_ITEM.tooltipDownload}
              placement={tooltipPlacement}
            >
              <IconButton
                size="md"
                className="catalogItem__button"
                color="inherit"
                onClick={handleDownload}
                componentProps={{
                  'data-testid': 'catalogItemDownload',
                }}
              >
                <Download />
              </IconButton>
            </Tooltip>
          </If>
          <If condition={picsioConfig.isMainApp() && enableEditor}>
            <Tooltip
              content={localization.CATALOG_ITEM.tooltipEdit}
              placement={tooltipPlacement}
            >
              <IconButton
                size="md"
                className="catalogItem__button"
                color="inherit"
                onClick={handleClickEdit}
                componentProps={{
                  'data-testid': 'catalogItemEdit',
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
          </If>
          <If condition={picsioConfig.isMainApp() && isLightboardsView}>
            <Button
              icon="catalogItemUnlight"
              onClick={handleRemoveLightboard}
              placement={tooltipPlacement}
              tooltip={localization.CATALOG_ITEM.tooltipRemoveFromLightboard}
              testid="catalogItemRemoveFromLB"
            />
          </If>
          <If condition={picsioConfig.isMainApp() && removeFiles}>
            <Tooltip
              content={
                isAssetFromInbox
                  ? localization.CATALOG_ITEM.tooltipDeleteForever
                  : localization.CATALOG_ITEM.tooltipDelete
              }
              placement={tooltipPlacement}
            >
              <IconButton
                size="md"
                className="catalogItem__button"
                color="inherit"
                onClick={isAssetFromInbox ? deleteForever : handleRemove}
                componentProps={{
                  'data-testid': 'catalogItemDelete',
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </If>
          <If condition={picsioConfig.isMainApp() && isTrashed}>
            <Tooltip
              content={localization.CATALOG_ITEM.tooltipRestore}
              placement={tooltipPlacement}
            >
              <IconButton
                size="md"
                className="catalogItem__button"
                color="inherit"
                onClick={handleRestore}
                componentProps={{
                  'data-testid': 'catalogItemRestore',
                }}
              >
                <RestoreFrom />
              </IconButton>
            </Tooltip>
            <Tooltip
              content={localization.CATALOG_ITEM.tooltipDeleteForever}
              placement={tooltipPlacement}
            >
              <IconButton
                size="md"
                className="catalogItem__button"
                color="inherit"
                onClick={deleteForever}
                componentProps={{
                  'data-testid': 'catalogItemDelete',
                }}
              >
                <DeleteFrom />
              </IconButton>
            </Tooltip>
          </If>
        </div>
      </If>
    </div>
  );
}

Controls.defaultProps = {
  title: '',
  fileExtension: '',
};

Controls.propTypes = {
  allowAssetSharing: PropTypes.bool.isRequired,
  assetId: PropTypes.string.isRequired,
  assetSharing: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  colorChangeable: PropTypes.bool.isRequired,
  colorShow: PropTypes.bool.isRequired,
  commentsEdit: PropTypes.bool.isRequired,
  commentsEnable: PropTypes.bool.isRequired,
  deleteForever: PropTypes.func.isRequired,
  downloadFiles: PropTypes.bool.isRequired,
  enableEditor: PropTypes.bool.isRequired,
  fileExtension: PropTypes.string,
  fileNameShow: PropTypes.bool.isRequired,
  handleDownload: PropTypes.func.isRequired,
  handleRemoveLightboard: PropTypes.func.isRequired,
  handleUploadClick: PropTypes.func.isRequired,
  isAssetFromInbox: PropTypes.bool.isRequired,
  isEditableInPicsioEditor: PropTypes.bool.isRequired,
  isGoogleDriveDocument: PropTypes.bool.isRequired,
  isLightboardsView: PropTypes.bool.isRequired,
  isListViewMode: PropTypes.bool.isRequired,
  isMobileView: PropTypes.bool.isRequired,
  isShared: PropTypes.bool.isRequired,
  isTrashed: PropTypes.bool.isRequired,
  itemWidth: PropTypes.number.isRequired,
  mimeType: PropTypes.string.isRequired,
  removeFiles: PropTypes.bool.isRequired,
  restoreAssets: PropTypes.func.isRequired,
  revisionsLength: PropTypes.number.isRequired,
  shortName: PropTypes.string.isRequired,
  storageId: PropTypes.string.isRequired,
  storageType: PropTypes.string.isRequired,
  title: PropTypes.string,
  trashAssets: PropTypes.func.isRequired,
  uploadFiles: PropTypes.bool.isRequired,
  duplicateAsset: PropTypes.func.isRequired,
  allowDuplicateAsset: PropTypes.bool.isRequired,
};
