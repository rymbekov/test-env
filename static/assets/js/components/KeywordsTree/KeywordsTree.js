/* eslint-disable no-case-declarations */
import React, {
  useState, useEffect, useCallback,
} from 'react';
import { useMount } from 'react-use';
import PropTypes from 'prop-types';
import { Tree } from '@picsio/ui';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import cn from 'classnames';

import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';

import KeywordsTreeNode from './KeywordsTreeNode';
import propTypes from './propTypes';
import * as UtilsCollections from '../../store/utils/collections';
import { findCollectionsPathToId } from '../../store/actions/helpers/archive';
import { setSearchRoute } from '../../helpers/history';

const handleArrayInclude = (arr, id, forceAdd = false) => {
  const includedArrayIndex = arr.findIndex((_id) => _id === id);
  if (includedArrayIndex > -1) {
    if (forceAdd) return arr;
    arr.splice(includedArrayIndex, 1);
    return [...arr];
  }
  arr.push(id);
  return [...arr];
};

function clearDocumentSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

const KeywordsTree = (props) => {
  const {
    activeIds,
    selectedKeywords,
    allNodes,
    treeNodes,
    addItem,
    deleteItem,
    deleteItems,
    renameItem,
    toggleFavoriteItem,
    onDragStart,
    onDrop,
    mergeItems,
    selectItems,
    selectItem,
    deselectItem,
    rolePermissions,
    isKeywordsActionsAllowed,
    isAddKeywordsOutsideVocabulary,
    isFiltered,
  } = props;

  const searchQuery = useSelector((state) => state.router.location.query);
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState([]);
  const rootCollectionId = UtilsCollections.getRootId();

  const isKeywordsOpened = utils.LocalStorage.get('picsio.keywordsTree.keywords.open');
  const isFavoritesOpened = utils.LocalStorage.get('picsio.keywordsTree.favorites.open');

  useMount(() => {
    const { keywords } = searchQuery;

    const expandedFromSession = sessionStorage.getItem('picsio.treeKeywordsExpanded');
    let expandedFromSessionArr = null;
    if (expandedFromSession) {
      expandedFromSessionArr = expandedFromSession.split(',');
    }

    if (keywords?.length) {
      const { path } = findCollectionsPathToId(treeNodes, keywords[0], 'nodes');
      let opened = [...path];
      if (expandedFromSessionArr?.length) opened = _.union(opened, expandedFromSessionArr);
      if (isKeywordsOpened && !opened.includes('keywords')) opened.push('keywords');
      if (isFavoritesOpened && !opened.includes('favorites')) opened.push('favorites');
      setExpanded(opened);
    } else {
      let opened = [];
      if (expandedFromSessionArr?.length) opened = _.union(opened, expandedFromSessionArr);
      if (isKeywordsOpened) opened.push('keywords');
      if (isFavoritesOpened) opened.push('favorites');
      setExpanded(opened);
    }
  });

  const keyDownListeners = useCallback((event) => {
    if (document.querySelector('.wrapperDialog')?.childNodes.length > 0) {
      return;
    }

    const { keyCode, metaKey, ctrlKey } = event;
    event.stopPropagation();

    switch (keyCode) {
    // Esc
    case 27:
      setEditMode(false);
      Logger.log('User', 'KeywordsEditModeEsc');
      return;

      // metaKey + A
    case 65:
      // select all
      if (metaKey || ctrlKey) {
        Logger.log('User', 'KeywordsEditModeSelectAll');
        const displayed = isFiltered ? treeNodes[0].nodes : allNodes;

        if (displayed.length <= selectedKeywords.length) {
          selectItems([]);
        } else {
          selectItems(displayed.map(({ _id }) => _id));
        }
      }
      // no default
    }
  }, [setEditMode, allNodes, selectedKeywords, selectItems, isFiltered, treeNodes]);

  useEffect(() => {
    if (editMode) {
      window.dispatchEvent(new Event('tree:edit:on'));
      document.body.addEventListener('keydown', keyDownListeners);
      document.body.classList.add('noselect-editMode');
    } else {
      window.dispatchEvent(new Event('tree:edit:off'));
      document.body.removeEventListener('keydown', keyDownListeners);
      clearDocumentSelection();
      selectItems([]);
      document.body.classList.remove('noselect-editMode');
    }

    return () => document.body.removeEventListener('keydown', keyDownListeners);
  }, [editMode, keyDownListeners, selectItems]);

  useEffect(() => {
    const saveExpandedToSession = () => {
      sessionStorage.setItem('picsio.treeKeywordsExpanded', expanded.toString());
    };

    saveExpandedToSession();

    return () => saveExpandedToSession();
  }, [expanded]);

  const onNodeToggle = useCallback((event, { nodeId }) => {
    setExpanded((prevExpanded) => {
      const isExist = prevExpanded.includes(nodeId);
      if (nodeId === 'favorites') {
        utils.LocalStorage.set('picsio.keywordsTree.favorites.open', !isExist);
      }
      if (nodeId === 'keywords') {
        utils.LocalStorage.set('picsio.keywordsTree.keywords.open', !isExist);
      }
      const nextExpanded = handleArrayInclude(prevExpanded, nodeId);
      return nextExpanded;
    });
  }, []);

  const onNodeSelect = useCallback((event, { nodeId }) => {
    if (nodeId === 'favorites' || nodeId === 'keywords') {
      return;
    }

    if (editMode) {
      /** check/uncheck checkbox */
      event.stopPropagation();

      const { altKey } = event;

      if (altKey) {
        /** With `alt` key select only clicked keyword (deselect all other keywords) */
        Logger.log('User', 'KeywordsEditModeSelect');
        selectItems([nodeId]);
        return;
      }

      if (selectedKeywords.indexOf(nodeId) > -1) {
        /** Deselect keyword */
        deselectItem(nodeId);
      } else {
        /** Select keyword (and all his children) */
        selectItem(nodeId);
      }
      Logger.log('User', 'KeywordsEditModeSelect');

      return;
    }

    /** Activate keyword */
    Logger.log('User', 'KeywordsItemSelected', { collectionId: nodeId });

    if (activeIds.indexOf(nodeId) === -1) {
      /** if not already activated */
      setSearchRoute({ tagId: rootCollectionId, keywords: nodeId });
    }
  }, [
    editMode, rootCollectionId, selectedKeywords, activeIds, selectItems, selectItem, deselectItem,
  ]);

  const handleAddItem = useCallback((parentId, name) => {
    setExpanded((prevExpanded) => {
      const nextExpanded = handleArrayInclude(prevExpanded, parentId, true);
      return nextExpanded;
    });
    addItem(parentId, name);
  }, [addItem]);

  const handleEditItem = useCallback((nodeId, name) => {
    renameItem(nodeId, name);
  }, [renameItem]);

  const editValidation = useCallback((_value) => {
    const value = _value.trim().toLowerCase();
    let isValid = true;
    const checkName = (item) => item.path.split('→').pop().toLowerCase() === value;

    if (value === '' || allNodes.some(checkName)) {
      isValid = false;
    }

    return isValid;
  }, [allNodes]);

  const onEditTreeMode = useCallback(() => {
    Logger.log('User', 'KeywordsEditMode', { editMode: !editMode });
    setEditMode(!editMode);
  }, [editMode]);

  const handleDelete = useCallback((nodeId) => {
    if (selectedKeywords.indexOf(nodeId) > -1) {
      /** delete on selected keyword */
      deleteItems(selectedKeywords);
    } else {
      /** delete on deselected keyword */
      deleteItems([nodeId]);
    }
  }, [deleteItems, selectedKeywords]);

  const isDenyDND = !isKeywordsActionsAllowed;

  const renderNode = useCallback(
    (args) => {
      const {
        children,
        nodeId,
        node,
        path,
        isOpen,
        isSelected,
        onToggle,
        onSelect,
      } = args;
      const level = path.length;
      const { isFavorite } = node;
      const isSomeItemSelected = selectedKeywords.length > 0;
      const isSeveralItemSelected = selectedKeywords.length > 1;

      return (
        <KeywordsTreeNode
          key={nodeId || node.title} // "node.title" for first tree level keys
          nodeId={nodeId}
          node={node}
          level={level}
          isOpen={isOpen}
          isSelected={isSelected}
          isFavorite={isFavorite}
          onToggle={onToggle}
          onSelect={onSelect}
          rolePermissions={rolePermissions}
          isKeywordsActionsAllowed={isKeywordsActionsAllowed}
          isAddKeywordsOutsideVocabulary={isAddKeywordsOutsideVocabulary}
          onAdd={handleAddItem}
          deleteItem={deleteItem}
          deleteItems={handleDelete}
          toggleFavoriteItem={toggleFavoriteItem}
          onEdit={handleEditItem}
          editValidation={editValidation}
          onEditTreeMode={onEditTreeMode}
          editMode={editMode}
          isDraggable={!node.root && !editMode} // root sections are not draggable
          isDenyDND={isDenyDND}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onMerge={mergeItems}
          isSomeItemSelected={isSomeItemSelected}
          isSeveralItemSelected={isSeveralItemSelected}
        >
          {children}
        </KeywordsTreeNode>
      );
    },
    [
      rolePermissions,
      isKeywordsActionsAllowed,
      isAddKeywordsOutsideVocabulary,
      handleAddItem,
      deleteItem,
      toggleFavoriteItem,
      handleEditItem,
      editValidation,
      onEditTreeMode,
      editMode,
      isDenyDND,
      onDragStart,
      onDrop,
      handleDelete,
      mergeItems,
      selectedKeywords,
    ],
  );

  return (
    <Tree
      className={cn({ noselect: editMode })}
      nodes={treeNodes}
      renderNode={renderNode}
      onNodeToggle={onNodeToggle}
      onNodeSelect={onNodeSelect}
      expanded={expanded}
      selected={editMode ? selectedKeywords : activeIds}
      childKey="nodes"
      controlled
      treeItemsPerPage={75}
      debugMode={false}
    />
  );
};

KeywordsTree.defaultProps = {
  allNodes: [],
  treeNodes: [],
  activeIds: [],
  selectedKeywords: [],
  deleteItems: null,
  mergeItems: null,
  selectItems: () => {}, // eslint-disable-line
  selectItem: null,
  deselectItem: null,
  isFiltered: false,
};
KeywordsTree.propTypes = {
  isFiltered: PropTypes.bool,
  allNodes: PropTypes.arrayOf(PropTypes.shape(propTypes.keyword)),
  treeNodes: PropTypes.arrayOf(PropTypes.shape(propTypes.keyword)),
  activeIds: PropTypes.arrayOf(PropTypes.string),
  selectedKeywords: PropTypes.arrayOf(PropTypes.string),
  addItem: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  renameItem: PropTypes.func.isRequired,
  toggleFavoriteItem: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  deleteItems: PropTypes.func,
  mergeItems: PropTypes.func,
  selectItems: PropTypes.func,
  selectItem: PropTypes.func,
  deselectItem: PropTypes.func,
  rolePermissions: PropTypes.shape(propTypes.bool).isRequired,
  isKeywordsActionsAllowed: PropTypes.bool.isRequired,
  isAddKeywordsOutsideVocabulary: PropTypes.bool.isRequired,
};

// we can't use memo here, because item not updated
// export default memo(KeywordsTree);
export default KeywordsTree;
