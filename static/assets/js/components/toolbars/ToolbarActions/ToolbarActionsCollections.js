import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@picsio/ui';
import {
  Archive,
  Delete,
  Download,
  Move,
  Unarchive,
  Upload,
  Web,
} from '@picsio/ui/dist/icons';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import { navigate } from '../../../helpers/history';
import moveCollection from '../../../helpers/moveCollection';
import archiveCollection from '../../../helpers/archiveCollection';
import { downloadCollection } from '../../../helpers/fileDownloader';
import Tooltip from '../../Tooltip';

const eventPrefix = 'ToolbarActionsCollections';

const ToolbarActionsCollections = (props) => {
  const {
    collection,
    collectionPermissions,
    isArchiveView,
    isTrash,
    rolePermissions,
    tooltipPlacement,
    websitesAllowed,
    collectionsActions,
    archiveActions,
  } = props;
  const {
    _id: collectionId, path, website, archived,
  } = collection;
  const isRootCollection = path === 'root';

  const handleDownload = () => {
    Logger.log('User', `${eventPrefix}Download`, { collectionId });
    downloadCollection(collectionId, rolePermissions);
  };

  const handleDelete = () => {
    Logger.log('User', `${eventPrefix}Delete`, { collectionId });
    collectionsActions.removeCollection(collection);
  };

  const handleWebsite = () => {
    Logger.log('User', `${eventPrefix}WebsiteSettings`, { collectionId });
    navigate(`/websites/${collectionId}?tab=main`);
  };

  const handleMove = () => {
    Logger.log('User', `${eventPrefix}Move`, { collectionId });
    moveCollection(collection);
  };

  const handleArchive = () => {
    Logger.log('User', `${eventPrefix}Archive`, { collectionId });
    archiveCollection(collection);
  };

  const handleUnArchive = () => {
    Logger.log('User', `${eventPrefix}UnArchive`, { collectionId });
    archiveActions.unarchiveCollection({ collectionId });
  };

  const handleUpload = (files) => {
    Logger.log('User', `${eventPrefix}PanelUpload`, { collectionId });
    window.dispatchEvent(new CustomEvent('importPanel:add', { detail: files }));
  };

  const handleInputFile = (event) => {
    Logger.log('User', `${eventPrefix}Upload`, { collectionId });
    const { files } = event.target;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  };

  return (
    <>
      <If condition={!isArchiveView && collectionPermissions.upload}>
        {/* <InviteButton withHover={false} placement="top" isToolbarActionButton /> */}
        <Tooltip
          placement={tooltipPlacement}
          content={localization.ACTIONS_TOOLBAR.COLLECTIONS.upload}
        >
          <IconButton
            componentProps={{ 'data-testid': 'collectionUpload' }}
            className="toolbarButton"
            size="lg"
            color="inherit"
            disabled={isTrash}
          >
            <Upload />
            <input
              type="file"
              multiple
              className="btnCollectionUpload"
              onChange={handleInputFile}
            />
          </IconButton>
        </Tooltip>
      </If>
      <If condition={!isArchiveView && collectionPermissions.websites && websitesAllowed}>
        <Tooltip
          placement={tooltipPlacement}
          content={website
            ? localization.ACTIONS_TOOLBAR.COLLECTIONS.websiteSettings
            : localization.ACTIONS_TOOLBAR.COLLECTIONS.createWebsite}
        >
          <IconButton
            componentProps={{ 'data-testid': 'collectionShare' }}
            className="toolbarButton"
            size="lg"
            color="inherit"
            onClick={handleWebsite}
            disabled={isRootCollection}
          >
            <Web />
          </IconButton>
        </Tooltip>
      </If>
      <If condition={!isArchiveView && collectionPermissions.moveCollections}>
        <Tooltip
          placement={tooltipPlacement}
          content={localization.ACTIONS_TOOLBAR.COLLECTIONS.move}
        >
          <IconButton
            componentProps={{ 'data-testid': 'collectionMove' }}
            className="toolbarButton"
            size="lg"
            color="inherit"
            onClick={handleMove}
            disabled={isRootCollection}
          >
            <Move />
          </IconButton>
        </Tooltip>
      </If>
      <If condition={collectionPermissions.downloadFiles}>
        <Tooltip
          placement={tooltipPlacement}
          content={localization.ACTIONS_TOOLBAR.COLLECTIONS.download}
        >
          <IconButton
            componentProps={{ 'data-testid': 'collectionDownload' }}
            className="toolbarButton"
            size="lg"
            color="inherit"
            onClick={handleDownload}
            disabled={isRootCollection}
          >
            <Download />
          </IconButton>
        </Tooltip>
      </If>
      <If condition={rolePermissions.manageArchive}>
        <Choose>
          <When condition={isArchiveView}>
            <Tooltip
              placement={tooltipPlacement}
              content={localization.ACTIONS_TOOLBAR.COLLECTIONS.unarchive}
            >
              <IconButton
                componentProps={{ 'data-testid': 'collectionUnarchive' }}
                className="toolbarButton"
                size="lg"
                color="inherit"
                onClick={handleUnArchive}
                disabled={isRootCollection || (isArchiveView && !archived)}
              >
                <Unarchive />
              </IconButton>
            </Tooltip>
          </When>
          <Otherwise>
            <Tooltip
              placement={tooltipPlacement}
              content={localization.ACTIONS_TOOLBAR.COLLECTIONS.archive}
            >
              <IconButton
                componentProps={{ 'data-testid': 'collectionArchive' }}
                className="toolbarButton"
                size="lg"
                color="inherit"
                onClick={handleArchive}
                disabled={isRootCollection}
              >
                <Archive />
              </IconButton>
            </Tooltip>
          </Otherwise>
        </Choose>
      </If>
      <If condition={collectionPermissions.deleteCollections}>
        <Tooltip
          placement={tooltipPlacement}
          content={localization.ACTIONS_TOOLBAR.COLLECTIONS.delete}
        >
          <IconButton
            componentProps={{ 'data-testid': 'collectionDelete' }}
            className="toolbarButton"
            size="lg"
            color="inherit"
            onClick={handleDelete}
            disabled={isRootCollection || (isArchiveView && !archived)}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </If>
    </>
  );
};

ToolbarActionsCollections.defaultProps = {
  tooltipPlacement: 'top',
  collection: {
    archived: false,
  },
  collectionPermissions: {},
  rolePermissions: {},
};

ToolbarActionsCollections.propTypes = {
  archiveActions: PropTypes.shape({
    unarchiveCollection: PropTypes.func,
  }).isRequired,
  collection: PropTypes.shape({
    _id: PropTypes.string,
    path: PropTypes.string,
    archived: PropTypes.bool,
    website: PropTypes.objectOf(PropTypes.any),
  }),
  collectionsActions: PropTypes.shape({
    removeCollection: PropTypes.func,
  }).isRequired,
  collectionPermissions: PropTypes.shape({
    upload: PropTypes.bool,
    websites: PropTypes.bool,
    moveCollections: PropTypes.bool,
    downloadFiles: PropTypes.bool,
    deleteCollections: PropTypes.bool,
  }),
  isArchiveView: PropTypes.bool.isRequired,
  isTrash: PropTypes.bool.isRequired,
  rolePermissions: PropTypes.shape({
    manageArchive: PropTypes.bool,
  }),
  tooltipPlacement: PropTypes.string,
  websitesAllowed: PropTypes.bool.isRequired,
};

export default memo(ToolbarActionsCollections);
