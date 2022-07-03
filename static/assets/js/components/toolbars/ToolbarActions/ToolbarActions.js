import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useToggle } from 'react-use';
import { IconButton } from '@picsio/ui';
import cn from 'classnames';
import {
  ArrowUp,
  ArrowDown,
} from '@picsio/ui/dist/icons';
import Logger from '../../../services/Logger';
import { isRouteFiltering } from '../../../helpers/history';
import ToolbarActionsCollections from './ToolbarActionsCollections';
import ToolbarActionsAssets from './ToolbarActionsAssets';
import ToolbarActionsKeywords from './ToolbarActionsKeywords';
import './toolbarActions.scss';

const ToolbarActions = (props) => {
  const {
    activeCollection,
    allowedActions,
    diffTool,
    isArchiveView,
    isInboxView,
    rolePermissions,
    selectedAssetsIds,
    selectedKeywordsIds,
    trashed,
    websitesAllowed,
    assetsActions,
    collectionsActions,
    archiveActions,
    keywordsActions,
    openedTree,
    total,
    isDetailsOpen,
    left,
    right,
  } = props;
  const [viewType, setViewType] = useState(null);
  const [opened, toggleopened] = useToggle(true);
  const { permissions: collectionPermissions } = activeCollection || {};

  // useEffect(() => {
  //   if (openedTree === 'keywords' && selectedKeywordsIds.length) {
  //     setViewType('keywords');
  //   } else if (selectedAssetsIds.length) {
  //     setViewType('assets');
  //   } else {
  //     setViewType(null);
  //   }
  // }, [selectedAssetsIds, selectedKeywordsIds, openedTree]);
  useEffect(() => {
    if (selectedAssetsIds.length) {
      setViewType('assets');
    } else {
      setViewType(null);
    }
  }, [selectedAssetsIds, openedTree]);

  const handleOpener = (e) => {
    e.stopPropagation();
    Logger.log('User', 'ToggleActionsToolbar', !opened);
    toggleopened();
  };

  const hasPermissions = () => {
    if (collectionPermissions?.deleteCollections) {
      return true;
    }
    if (rolePermissions?.manageArchive) {
      return true;
    }
    if (collectionPermissions?.downloadFiles) {
      return true;
    }
    if (collectionPermissions?.moveCollections) {
      return true;
    }
    if (collectionPermissions?.websites) {
      return true;
    }
    if (collectionPermissions?.upload) {
      return true;
    }
    if (viewType === 'assets' && diffTool) {
      return true;
    }
    if (viewType === 'assets' && rolePermissions?.manageArchive) {
      return true;
    }
    if (viewType === 'assets' && allowedActions?.deleteAssets && allowedActions?.isRemovable) {
      return true;
    }
    if (viewType === 'assets' && allowedActions?.editAssetCollections) {
      return true;
    }
    if (viewType === 'assets' && allowedActions?.upload) {
      return true;
    }
    if (viewType === 'assets' && allowedActions?.downloadFiles && allowedActions?.isDownloadable) {
      return true;
    }
    if (viewType === 'assets' && allowedActions?.websites) {
      return true;
    }
    return false;
  };

  const isActionPanelVisible = (viewType
    || ((!isRouteFiltering() && activeCollection) || (isArchiveView && activeCollection))
    && hasPermissions());

  const getMarginSize = () => {
    let treeWidth = 0;
    let detailsPanelWidth = 0;
    if (openedTree) {
      treeWidth = left;
    }
    if (isDetailsOpen) {
      detailsPanelWidth = right;
    }
    return (treeWidth - detailsPanelWidth) / 2;
  };

  return (
    <If condition={isActionPanelVisible}>
      <div className="toolbarActionsWrapper" style={{ marginLeft: `${getMarginSize()}px` }} data-testid="toolbarActions">
        <Choose>
          <When condition={opened}>
            <div
              className="toolbarActions"
              data-testid={cn({
                toolbarActionsKeywords: viewType === 'keywords',
                toolbarActionsAssets: viewType === 'assets',
                toolbarActionsCollections: !viewType,
              })}
            >
              <Choose>
                {/* <When condition={viewType === 'keywords'}>
                      <ToolbarActionsKeywords
                        rolePermissions={rolePermissions}
                        selectedKeywordsIds={selectedKeywordsIds}
                        keywordsActions={keywordsActions}
                      />
                    </When> */}
                <When condition={viewType === 'assets'}>
                  <ToolbarActionsAssets
                    total={total}
                    isArchiveView={isArchiveView}
                    isInboxView={isInboxView}
                    isTrash={trashed}
                    selectedAssetsIds={selectedAssetsIds}
                    rolePermissions={rolePermissions}
                    diffTool={diffTool}
                    allowedActions={allowedActions}
                    assetsActions={assetsActions}
                  />
                </When>
                <Otherwise>
                  <ToolbarActionsCollections
                    isArchiveView={isArchiveView}
                    isTrash={trashed}
                    collection={activeCollection}
                    collectionPermissions={collectionPermissions}
                    rolePermissions={rolePermissions}
                    websitesAllowed={websitesAllowed}
                    collectionsActions={collectionsActions}
                    archiveActions={archiveActions}
                  />
                </Otherwise>
              </Choose>
              <span className="toolbarActionsSeparator" />
              <IconButton
                componentProps={{ 'data-testid': 'actionPanelClose' }}
                className="toolbarButton"
                color="inherit"
                onClick={handleOpener}
                size="xl"
              >
                <ArrowDown />
              </IconButton>
            </div>
          </When>
          <Otherwise>
            <IconButton
              componentProps={{ 'data-testid': 'actionPanelOpen' }}
              className="toolbarActionsOpener"
              onClick={handleOpener}
              size="xl"
            >
              <ArrowUp />
            </IconButton>
          </Otherwise>
        </Choose>
      </div>
    </If>
  );
};

ToolbarActions.defaultProps = {
  activeCollection: {},
  openedTree: null,
};

ToolbarActions.propTypes = {
  assetsActions: PropTypes.shape({
    deleteAssets: PropTypes.func,
    restoreAssets: PropTypes.func,
    trashAssets: PropTypes.func,
  }).isRequired,
  archiveActions: PropTypes.shape({
    unarchiveCollection: PropTypes.func,
  }).isRequired,
  activeCollection: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    children: PropTypes.arrayOf(PropTypes.object),
    path: PropTypes.string,
    hasChild: PropTypes.bool,
    archived: PropTypes.bool,
  }),
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
  keywordsActions: PropTypes.shape({
    deleteSelected: PropTypes.func,
  }).isRequired,
  collectionsActions: PropTypes.shape({
    removeCollection: PropTypes.func,
  }).isRequired,
  diffTool: PropTypes.bool.isRequired,
  isArchiveView: PropTypes.bool.isRequired,
  isInboxView: PropTypes.bool.isRequired,
  rolePermissions: PropTypes.shape({
    manageArchive: PropTypes.bool,
  }).isRequired,
  selectedAssetsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedKeywordsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  trashed: PropTypes.bool.isRequired,
  websitesAllowed: PropTypes.bool.isRequired,
  openedTree: PropTypes.string,
  total: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  right: PropTypes.number.isRequired,
  isDetailsOpen: PropTypes.bool.isRequired,
};

export default memo(ToolbarActions);
