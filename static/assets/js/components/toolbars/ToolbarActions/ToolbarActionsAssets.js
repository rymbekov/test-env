import React, { memo } from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import { IconButton } from '@picsio/ui';
import cn from 'classnames';
import {
  AddRevision,
  Archive,
  Clip,
  Compare,
  Delete,
  DeleteFrom,
  Download,
  RestoreFrom,
  Stamper,
  Unarchive,
  Web,
  CloseIcon,
} from '@picsio/ui/dist/icons';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import store from '../../../store/index';
import revisionUploader from '../../../helpers/revisionUploader';
import { showDownloadDialog } from '../../../helpers/fileDownloader';
import { navigate } from '../../../helpers/history';
import archiveAssets from '../../../helpers/archiveAssets';
import showAttachCollectionDialog from '../../../helpers/showAttachCollectionDialog';
import Tooltip from '../../Tooltip';

const eventPrefix = 'ToolbarActionsAssets';

const ToolbarActionsAssets = (props) => {
  const {
    allowedActions,
    diffTool,
    isArchiveView,
    isInboxView,
    isTrash,
    rolePermissions,
    selectedAssetsIds,
    tooltipPlacement,
    assetsActions,
    total,
  } = props;

  const handleShare = () => {
    const assetId = selectedAssetsIds[0];
    Logger.log('User', `${eventPrefix}Share`, { assetId });
    navigate(`/singlesharing/${assetId}`);
  };

  const handleDownload = () => {
    Logger.log('User', `${eventPrefix}Download`);
    showDownloadDialog(selectedAssetsIds);
  };

  const handleRemove = () => {
    const isRemoveForever = isInboxView || isTrash;
    const action = isRemoveForever ? 'Delete' : 'Trash';
    Logger.log('User', `${eventPrefix}${action}`, { isInboxView, isArchiveView, isTrash });
    if (isRemoveForever) {
      assetsActions.deleteAssets(selectedAssetsIds, isRemoveForever);
    } else {
      assetsActions.trashAssets(selectedAssetsIds);
    }
  };

  const handleRestore = () => {
    Logger.log('User', `${eventPrefix}RestoreFromTrash`);
    assetsActions.restoreAssets(selectedAssetsIds);
  };

  const handleArchive = (value) => {
    const action = value ? 'Archive' : 'Unarchive';
    Logger.log('User', `${eventPrefix}${action}`);
    archiveAssets(selectedAssetsIds, isArchiveView);
  };

  const handleAttachCollection = () => {
    Logger.log('User', `${eventPrefix}AttachCollection`, { isInboxView });
    if (isInboxView) {
      showAttachCollectionDialog({
        selectedAssetsIds,
        title: localization.ACTIONS_TOOLBAR.ASSETS.attachToCollection,
        closeOnToggle: true,
      });
    } else {
      showAttachCollectionDialog({
        selectedAssetsIds,
        title: localization.ACTIONS_TOOLBAR.ASSETS.attachCollection,
      });
    }
  };

  const handleCompare = () => {
    Logger.log('User', `${eventPrefix}Compare`, diffTool);
    if (diffTool) {
      navigate(`/compare/${selectedAssetsIds.join('=')}`);
    }
  };

  /**
   * Add new revision
   * @param {File} file
   */
  const addRevision = async (file) => {
    const assetId = selectedAssetsIds[0];
    const { items } = store.getState().assets;
    const currentAsset = items.find((item) => item._id === assetId);
    await revisionUploader(file, currentAsset);
  };

  /**
   * On change input file
   * @param {Event} event
   */
  const handleAddRevision = (event) => {
    Logger.log('User', `${eventPrefix}AddRevision`);
    if (event && event.target) {
      addRevision(event.target.files[0]);
    }
  };

  const handleSelectAll = () => {
    Logger.log('User', 'ToolbarActionsSelectAll');
    assetsActions.selectAll();
  };

  const handleDeselectAll = () => {
    Logger.log('User', 'ToolbarActionsDeselect');
    assetsActions.deselectAll();
  };

  return (
    <>
      <If condition={!isTrash && !isArchiveView && allowedActions.websites}>
        <Tooltip placement={tooltipPlacement} content={localization.ACTIONS_TOOLBAR.ASSETS.deselectAll}>
          <IconButton
            componentProps={{ 'data-testid': 'actionDeselectAll' }}
            color="inherit"
            size="md"
            className="toolbarButton"
            onClick={handleDeselectAll}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
        <div className="selectAssetsText" data-testid="actionsToolbarAssetsCount">
          {selectedAssetsIds.length !== total ? `${pluralize('asset', selectedAssetsIds.length, true)} selected` : 'All assets selected'}
        </div>
        <div
          data-testid="actionSelectAll"
          className={cn('selectAssetsText selectAll link', { allAssetSelected: selectedAssetsIds.length === total })}
          onClick={handleSelectAll}
        >
          {localization.ACTIONS_TOOLBAR.ASSETS.selectAll}
        </div>
        <Tooltip placement={tooltipPlacement} content={localization.ACTIONS_TOOLBAR.ASSETS.share}>
          <IconButton
            componentProps={{ 'data-testid': 'assetShare' }}
            className="toolbarButton"
            color="inherit"
            size="lg"
            onClick={handleShare}
            disabled={selectedAssetsIds.length > 1}
          >
            <Web />
          </IconButton>
        </Tooltip>
      </If>
      <If condition={!isTrash && allowedActions.downloadFiles && allowedActions.isDownloadable}>
        <Tooltip
          placement={tooltipPlacement}
          content={localization.ACTIONS_TOOLBAR.ASSETS.download}
        >
          <IconButton
            componentProps={{ 'data-testid': 'assetsDownload' }}
            className="toolbarButton"
            color="inherit"
            size="lg"
            onClick={handleDownload}
          >
            <Download />
          </IconButton>
        </Tooltip>
      </If>
      <If condition={!isTrash && !isArchiveView && allowedActions.upload}>
        <Tooltip
          placement={tooltipPlacement}
          content={localization.ACTIONS_TOOLBAR.ASSETS.addRevision}
        >
          <IconButton
            componentProps={{ 'data-testid': 'assetAddRevision' }}
            className="toolbarButton"
            color="inherit"
            size="lg"
            disabled={selectedAssetsIds.length > 1}
          >
            <input type="file" className="btnCollectionUpload" onChange={handleAddRevision} />
            <AddRevision />
          </IconButton>
        </Tooltip>
      </If>
      <If condition={!isTrash && !isArchiveView && allowedActions.editAssetCollections}>
        <Tooltip
          placement={tooltipPlacement}
          content={
            isInboxView
              ? localization.ACTIONS_TOOLBAR.ASSETS.attachToCollection
              : localization.ACTIONS_TOOLBAR.ASSETS.attachCollection
          }
        >
          <IconButton
            componentProps={{ 'data-testid': 'assetsAttachCollection' }}
            className="toolbarButton"
            color="inherit"
            size="lg"
            onClick={handleAttachCollection}
          >
            <Clip />
          </IconButton>
        </Tooltip>
      </If>
      {/* <If condition={!isTrash && !isArchiveView && allowedActions.editAssetCollections}>
        <IconButton
          componentProps={{ 'data-testid': 'assetsAddWatermark' }}
          className="toolbarButton"
          color="inherit"
          size="lg"
        >
          <Stamper />
        </IconButton>
      </If> */}
      <If condition={allowedActions.deleteAssets && allowedActions.isRemovable}>
        <Choose>
          <When condition={isTrash}>
            <>
              <Tooltip
                placement={tooltipPlacement}
                content={localization.ACTIONS_TOOLBAR.ASSETS.restore}
              >
                <IconButton
                  componentProps={{ 'data-testid': 'assetsRetoreFrom' }}
                  className="toolbarButton"
                  color="inherit"
                  size="lg"
                  onClick={handleRestore}
                >
                  <RestoreFrom />
                </IconButton>
              </Tooltip>
              <Tooltip
                placement={tooltipPlacement}
                content={localization.ACTIONS_TOOLBAR.ASSETS.deleteForever}
              >
                <IconButton
                  componentProps={{ 'data-testid': 'assetsDeleteFrom' }}
                  className="toolbarButton"
                  color="inherit"
                  size="lg"
                  onClick={handleRemove}
                >
                  <DeleteFrom />
                </IconButton>
              </Tooltip>
            </>
          </When>
          <When condition={isInboxView}>
            <Tooltip
              placement={tooltipPlacement}
              content={localization.ACTIONS_TOOLBAR.ASSETS.deleteForever}
            >
              <IconButton
                componentProps={{ 'data-testid': 'assetsDelete' }}
                className="toolbarButton"
                color="inherit"
                size="lg"
                onClick={handleRemove}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </When>
          <Otherwise>
            <Tooltip
              placement={tooltipPlacement}
              content={localization.ACTIONS_TOOLBAR.ASSETS.delete}
            >
              <IconButton
                componentProps={{ 'data-testid': 'assetsDelete' }}
                className="toolbarButton"
                color="inherit"
                size="lg"
                onClick={handleRemove}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Otherwise>
        </Choose>
      </If>
      <If condition={!isTrash && rolePermissions.manageArchive}>
        <Choose>
          <When condition={isArchiveView}>
            <Tooltip
              placement={tooltipPlacement}
              content={localization.ACTIONS_TOOLBAR.ASSETS.unarchive}
            >
              <IconButton
                componentProps={{ 'data-testid': 'assetsUnarchive' }}
                className="toolbarButton"
                color="inherit"
                size="lg"
                onClick={() => handleArchive(false)}
                disabled={isTrash}
              >
                <Unarchive />
              </IconButton>
            </Tooltip>
          </When>
          <Otherwise>
            <Tooltip
              placement={tooltipPlacement}
              content={localization.ACTIONS_TOOLBAR.ASSETS.archive}
            >
              <IconButton
                componentProps={{ 'data-testid': 'assetsArchive' }}
                className="toolbarButton"
                color="inherit"
                size="lg"
                onClick={() => handleArchive(true)}
                disabled={isTrash}
              >
                <Archive />
              </IconButton>
            </Tooltip>
          </Otherwise>
        </Choose>
      </If>
      <If condition={diffTool}>
        <Tooltip
          placement={tooltipPlacement}
          content={
            selectedAssetsIds.length < 2
              ? localization.ACTIONS_TOOLBAR.ASSETS.compare1asset
              : selectedAssetsIds.length > 2
                ? localization.ACTIONS_TOOLBAR.ASSETS.compare3asset
                : localization.ACTIONS_TOOLBAR.ASSETS.compare
          }
        >
          <IconButton
            componentProps={{ 'data-testid': 'assetsCompare' }}
            className="toolbarButton"
            color="inherit"
            onClick={handleCompare}
            size="lg"
            disabled={!allowedActions.canBeCompared}
          >
            <Compare />
          </IconButton>
        </Tooltip>
      </If>
    </>
  );
};

ToolbarActionsAssets.defaultProps = {
  tooltipPlacement: 'top',
};

ToolbarActionsAssets.propTypes = {
  assetsActions: PropTypes.shape({
    deleteAssets: PropTypes.func,
    restoreAssets: PropTypes.func,
    trashAssets: PropTypes.func,
    selectAll: PropTypes.func,
    deselectAll: PropTypes.func,
  }).isRequired,
  allowedActions: PropTypes.shape({
    canBeCompared: PropTypes.bool,
    deleteAssets: PropTypes.bool,
    downloadFiles: PropTypes.bool,
    editAssetCollections: PropTypes.bool,
    isDownloadable: PropTypes.bool,
    isRemovable: PropTypes.bool,
    upload: PropTypes.bool,
    websites: PropTypes.bool,
  }).isRequired,
  diffTool: PropTypes.bool.isRequired,
  isArchiveView: PropTypes.bool.isRequired,
  isInboxView: PropTypes.bool.isRequired,
  isTrash: PropTypes.bool.isRequired,
  rolePermissions: PropTypes.shape({
    manageArchive: PropTypes.bool,
  }).isRequired,
  selectedAssetsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  tooltipPlacement: PropTypes.string,
  total: PropTypes.number.isRequired,
};

export default memo(ToolbarActionsAssets);
