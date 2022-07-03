import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TreeItem } from '@picsio/ui';
import { Archive } from '@picsio/ui/dist/icons';

import Logger from '../../services/Logger';

import ArchiveTreeNodeActions from './ArchiveTreeNodeActions';
import propTypes from './propTypes';

const getNodeIcon = (isRoot, isArchived) => {
  if (isRoot) {
    // null means that the icon should be not rendered
    return null;
  }
  if (isArchived) {
    return <Archive />;
  }
  return undefined;
};

const getChildren = (children, hasChild) => {
  if (hasChild) {
    return !children ? [] : children;
  }
  if (children) {
    return null;
  }
  return children;
};

const ArchiveTreeNode = props => {
  const {
    user,
    children,
    nodeId,
    node,
    level,
    isOpen,
    isSelected,
    isAdded,
    isDeleted,
    onToggle,
    onSelect,
    fetchMore,
    unarchiveCollection,
    downloadCollection,
    deleteCollection,
  } = props;
  const { permissions } = user;
  const { name, children: nodes, path, hasChild, archived, permissions: collectionPermissions } = node;
  const isRoot = path === 'root';
  const currentLevel = isRoot ? level : level - 1;
  const currentIcon = getNodeIcon(isRoot, archived);
  const isFetchMoreAllowed = hasChild && !nodes && !isOpen;

  const [fetching, setFetching] = useState(false);
  // close when childs was removed
  useEffect(() => {
    if (!nodes && isOpen && !isRoot) {
      onToggle({}, nodeId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  const handleToggle = async (event, id) => {
    onToggle(event, id);

    if (isFetchMoreAllowed) {
      setFetching(true);

      fetchMore(id).then(() => {
        setFetching(false);
      });
    }
  };

  const handleRestore = (event) => {
    Logger.log('User', 'ArchivedCollectionUnarchiveClicked', { collectionId: nodeId });
    event.stopPropagation();
    unarchiveCollection(node);
  };

  const handleDownload = (event) => {
    Logger.log('User', 'ArchivedCollectionDownloadClicked', { collectionId: nodeId });
    event.stopPropagation();
    downloadCollection(nodeId);
  };

  const handleDelete = (event) => {
    Logger.log('User', 'ArchivedCollectionDeleteClicked', { collectionId: nodeId });
    event.stopPropagation();
    deleteCollection(nodeId, name);
  };

  const actions = (
    <If condition={!isRoot}>
      <ArchiveTreeNodeActions
        permissions={permissions}
        collectionPermissions={collectionPermissions}
        archived={archived}
        onRestore={handleRestore}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </If>
  );

  return (
    <TreeItem
      nodeId={nodeId}
      root={isRoot}
      name={name}
      level={currentLevel}
      icon={currentIcon}
      iconSize="tree"
      open={isOpen}
      onToggle={handleToggle}
      onClick={onSelect}
      actions={actions}
      loading={fetching}
      selected={isSelected}
      added={isAdded}
      deleted={isDeleted}
      editable={false}
    >
      {getChildren(children, hasChild)}
    </TreeItem>
  );
}

ArchiveTreeNode.defaultProps = {
  children: [],
};
ArchiveTreeNode.propTypes = {
  user: PropTypes.shape(propTypes.user).isRequired,
  node: PropTypes.shape(propTypes.collections).isRequired,
  children: PropTypes.arrayOf(PropTypes.object),
  nodeId: PropTypes.string.isRequired,
  level: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isAdded: PropTypes.bool.isRequired,
  isDeleted: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  fetchMore: PropTypes.func.isRequired,
  unarchiveCollection: PropTypes.func.isRequired,
  downloadCollection: PropTypes.func.isRequired,
  deleteCollection: PropTypes.func.isRequired,
};

export default memo(ArchiveTreeNode);
