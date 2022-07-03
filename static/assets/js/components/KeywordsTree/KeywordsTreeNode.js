import React, {
  memo, useState, useEffect, useMemo, useCallback,
} from 'react';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import { TreeItem } from '@picsio/ui';
import { Checkbox, Label as Keyword, CheckboxOutline } from '@picsio/icons';
import propTypes from './propTypes';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import KeywordsTreeNodeActions from './KeywordsTreeNodeActions';

const getNodeIcon = (isRoot, editMode, isSelected) => {
  if (isRoot) {
    // null means that the icon should be not rendered
    return null;
  }
  if (editMode) {
    if (isSelected) return <Checkbox />;
    return <CheckboxOutline />;
  }
  return <Keyword />;
};

const getChildren = (children, hasChild) => {
  if (hasChild) {
    return !children ? [] : children;
  }
  if (children) {
    return null;
  }
};

const KeywordsTreeNode = (props) => {
  const {
    children,
    deleteItem,
    deleteItems,
    editMode,
    editValidation,
    isDenyDND,
    isDraggable,
    isOpen,
    isSelected,
    level,
    node,
    nodeId,
    onAdd,
    onDragStart,
    onDrop,
    onEdit,
    onEditTreeMode,
    onMerge,
    onSelect,
    onToggle,
    toggleFavoriteItem,
    rolePermissions,
    isKeywordsActionsAllowed,
    isAddKeywordsOutsideVocabulary,
    isSomeItemSelected,
    isSeveralItemSelected,
  } = props;
  const {
    nodes, path, root: isRoot, isFavorite, isBusy, isRenaming, title, deletedByTeammate,
  } = node;

  const { name, isFirstLvlKeyword } = useMemo(() => {
    const nameArray = path.split('→');
    return {
      isFirstLvlKeyword: nameArray.length < 3,
      name: utils.trimWithAsciiDots(nameArray.pop()),
    };
  }, [path]);

  const isRootFavorite = isRoot && title === 'Favorites';
  const currentLevel = isRoot ? level : level - 1;
  const isEditable = !isRoot && isKeywordsActionsAllowed;
  const [edit, setEdit] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState(null);
  const prevNodes = usePrevious(nodes);

  // close when childs was removed
  useEffect(() => {
    if (!nodes && isOpen && !isRoot) {
      onToggle({}, nodeId);
    }

    // remove temporary name wnen keyword added to store
    if (nodes !== prevNodes && newName) {
      setNewName(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, prevNodes]);

  const handleToggle = useCallback((event, id) => {
    onToggle(event, id);
  }, [onToggle]);

  const handleSelect = useCallback((event, id) => {
    onSelect(event, id);
  }, [onSelect]);

  const handleDelete = useCallback((event) => {
    Logger.log('User', 'KeywordDeleteClicked', { keywordId: nodeId });
    event.stopPropagation();
    deleteItem(nodeId, name);
  }, [deleteItem, name, nodeId]);

  const handleDeleteSelected = useCallback((event) => {
    Logger.log('User', 'KeywordDeleteSelectedClicked', { keywordId: nodeId });
    event.stopPropagation();
    deleteItems(nodeId);
  }, [deleteItems, nodeId]);

  const handleRenameStart = useCallback(() => {
    Logger.log('User', 'KeywordRenameClicked', { keywordId: nodeId });
    setEdit(true);
  }, [nodeId]);

  const handleEditCancel = useCallback(() => {
    setEdit(false);
  }, []);

  const handleEditName = useCallback((nameValue) => {
    setEdit(false);
    if (nameValue) {
      onEdit(node._id, nameValue);
    }
  }, [node._id, onEdit]);

  const handleFavorite = useCallback((event) => {
    Logger.log('User', 'KeywordFavoriteClicked', { keywordId: nodeId });
    event.stopPropagation();
    toggleFavoriteItem(nodeId, path, !isFavorite);
  }, [isFavorite, nodeId, path, toggleFavoriteItem]);

  const handleAdd = useCallback((event) => {
    Logger.log('User', 'KeywordAddClicked', { keywordId: nodeId });
    event.stopPropagation();
    setAdding(true);
  }, [nodeId]);

  const handleCancelAdding = useCallback(() => {
    setAdding(false);
  }, []);

  const handleAddItem = useCallback((value) => {
    onAdd(nodeId, value);
    setNewName(value);
  }, [nodeId, onAdd]);

  const handleMerge = useCallback((event) => {
    Logger.log('User', 'KeywordMergeClicked', { keywordId: nodeId });
    event.stopPropagation();
    onMerge(nodeId);
  }, [nodeId, onMerge]);

  const handleDragOver = useCallback((event) => {
    if (nodes?.length && !isOpen) {
      handleToggle(event, nodeId);
    }
  }, [nodes, isOpen, handleToggle, nodeId]);

  const currentIcon = useMemo(() => getNodeIcon(isRoot, editMode, isSelected),
    [isRoot, editMode, isSelected]);

  const actions = useMemo(() => (
    <Choose>
      <When condition={isRoot}>
        <KeywordsTreeNodeActions
          isKeywordsActionsAllowed={isKeywordsActionsAllowed}
          isAddKeywordsOutsideVocabulary={isAddKeywordsOutsideVocabulary}
          isFavorite={isFavorite}
          isRoot={isRoot}
          isRootFavorite={isRootFavorite}
          permissions={rolePermissions}
          editMode={editMode}
          onEditTreeMode={onEditTreeMode}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onDeleteSelected={handleDeleteSelected}
          onFavorite={handleFavorite}
          onRename={handleRenameStart}
          onMerge={handleMerge}
        />
      </When>
      <Otherwise>
        <KeywordsTreeNodeActions
          isKeywordsActionsAllowed={isKeywordsActionsAllowed}
          isAddKeywordsOutsideVocabulary={isAddKeywordsOutsideVocabulary}
          isFavorite={isFavorite}
          isRoot={isRoot}
          permissions={rolePermissions}
          editMode={editMode}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onDeleteSelected={handleDeleteSelected}
          onFavorite={handleFavorite}
          onRename={handleRenameStart}
          onMerge={isFirstLvlKeyword ? handleMerge : null}
          isSomeItemSelected={isSomeItemSelected}
          isCurrentSelected={isSelected}
          isSeveralItemSelected={isSeveralItemSelected}
        />
      </Otherwise>
    </Choose>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [
    isFavorite,
    editMode,
    isSomeItemSelected,
    isSeveralItemSelected,
    isSelected,
    handleMerge,
    handleDelete,
    handleDeleteSelected,
  ]);

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
      onClick={handleSelect}
      actions={actions}
      selected={isSelected}
      deleted={deletedByTeammate}
      disabled={isBusy || isRenaming}
      editable={isEditable}
      onEdit={handleEditName}
      onEditCancel={handleEditCancel}
      editValidation={editValidation}
      edit={edit}
      adding={adding}
      newName={newName}
      onAdd={handleAddItem}
      onAddCancel={handleCancelAdding}
      isTreeInEditMode={editMode}
      isDraggable={isDraggable}
      isDenyDND={isDenyDND}
      handleDragStart={onDragStart}
      handleDragOver={handleDragOver}
      handleDrop={onDrop}
      showActionsAlways={isRoot}
    >
      {getChildren(children, nodes?.length)}
    </TreeItem>
  );
};

KeywordsTreeNode.defaultProps = {
  children: [],
  deleteItems: null,
};
KeywordsTreeNode.propTypes = {
  children: PropTypes.arrayOf(PropTypes.object),
  deleteItem: PropTypes.func.isRequired,
  deleteItems: PropTypes.func,
  editMode: PropTypes.bool.isRequired,
  editValidation: PropTypes.func.isRequired,
  isDenyDND: PropTypes.bool.isRequired,
  isDraggable: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  level: PropTypes.number.isRequired,
  node: PropTypes.shape(propTypes.collections).isRequired,
  nodeId: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onEditTreeMode: PropTypes.func.isRequired,
  onMerge: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  toggleFavoriteItem: PropTypes.func.isRequired,
  rolePermissions: PropTypes.shape(propTypes.bool).isRequired,
  isKeywordsActionsAllowed: PropTypes.bool.isRequired,
  isAddKeywordsOutsideVocabulary: PropTypes.bool.isRequired,
  isSomeItemSelected: PropTypes.bool.isRequired,
  isSeveralItemSelected: PropTypes.bool.isRequired,
};

export default memo(KeywordsTreeNode);
