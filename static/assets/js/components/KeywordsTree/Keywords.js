import React, { useCallback, useMemo } from 'react';
import { useMount } from 'react-use';
import { useDispatch } from 'react-redux';

import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';

import KeywordsView from './KeywordsView';
import store from '../../store';
import * as mainActions from '../../store/actions/main';
import * as userActions from '../../store/actions/user';
import * as assetsActions from '../../store/actions/assets';
import * as keywordsActions from '../../store/actions/keywords';
import { findKeywords } from '../../store/helpers/keywords';
import { showDialog } from '../dialog';
import './styles.scss';

const Keywords = (props) => {
  const {
    activeKeywords,
    all,
    isKeywordsActionsAllowed,
    isAddKeywordsOutsideVocabulary,
    isLoaded,
    isLoading,
    panelWidth,
    rolePermissions,
    searchQuery,
    selectedKeywords,
    sortType,
    tree,
    isBusy,
    error,
  } = props;
  const dispatch = useDispatch();

  useMount(() => {
    Logger.log('UI', 'KeywordsOpened');
  });

  const searchItems = useCallback(
    (query) => {
      if (query) {
        Logger.log('User', 'KeywordsTreeSearchUsed', { query });
        return dispatch(keywordsActions.applySearch(query));
      }
      return dispatch(keywordsActions.applySearch(''));
    },
    [dispatch],
  );

  const setSort = useCallback(
    (sort) => dispatch(
      userActions.updateUserSortType({ collectionType: 'keywords', sortType: sort }),
    ),
    [dispatch],
  );

  const resizePanelWidth = useCallback(
    (event) => dispatch(mainActions.resizePanel(event, 'left')),
    [dispatch],
  );

  const getKeywords = useCallback(
    () => {
      dispatch(keywordsActions.getKeywords());
    },
    [dispatch],
  );

  const addItem = useCallback(
    (parentId, name) => {
      dispatch(keywordsActions.add(name, parentId));
    },
    [dispatch],
  );

  const renameItem = useCallback(
    (nodeId, name) => {
      dispatch(keywordsActions.rename(nodeId, name));
    },
    [dispatch],
  );

  const deleteItem = useCallback(
    (nodeId, name) => {
      dispatch(keywordsActions.deleteSelected([nodeId], name));
    },
    [dispatch],
  );

  const deleteItems = useCallback(
    (ids) => {
      if (Array.isArray(ids)) {
        dispatch(keywordsActions.deleteSelected(ids));
      } else {
        dispatch(keywordsActions.deleteSelected([ids]));
      }
    },
    [dispatch],
  );

  const mergeItems = useCallback(
    (targetKeywordId) => {
      dispatch(keywordsActions.merge(targetKeywordId));
    },
    [dispatch],
  );

  const toggleFavoriteItem = useCallback(
    (nodeId, path, value) => {
      dispatch(keywordsActions.favorite(nodeId, path, value));
    },
    [dispatch],
  );

  const setSelectedItems = useCallback(
    (ids) => {
      if (!selectedKeywords.length && !ids.length) return;
      dispatch(keywordsActions.setSelected(ids));
    },
    [dispatch, selectedKeywords],
  );

  const selectItem = useCallback(
    (_id) => dispatch(keywordsActions.addToSelection(_id)),
    [dispatch],
  );

  const deselectItem = useCallback(
    (_id) => dispatch(keywordsActions.removeFromSelection(_id)),
    [dispatch],
  );

  const handleDrop = useCallback(
    (draggableNodeId, nodeId) => {
      if (draggableNodeId === nodeId) return;
      let parentId = nodeId;
      const [draggableNode] = findKeywords(tree, null, { _id: draggableNodeId });
      const [node] = findKeywords(tree, null, { _id: nodeId });

      if (draggableNode) {
        if (node.nodes && node.nodes.includes(draggableNode)) return;
        if (draggableNode.root) return;
        if (node.path && node.path.startsWith(draggableNode.path)) return;

        /** if drop on Favorites root */
        if (node.root && node.title === localization.COLLECTIONS.titleFavorites) {
          dispatch(keywordsActions.favorite(
            draggableNode._id,
            draggableNode.path,
            !draggableNode.isFavorite,
          ));
          return;
        }

        if (['favorites', 'keywords'].includes(parentId)) {
          parentId = null;
        }
        dispatch(keywordsActions.move(draggableNodeId, parentId));
      } else {
        if (node.root) return;
        // checking for restricted assets
        const { items: assets, selectedItems } = store.getState().assets;
        const selectedAssets = assets.filter((asset) => selectedItems.includes(asset._id));
        if (
          utils.isSelectedAssetsRestricted(selectedAssets)
          && rolePermissions.restrictedChangeMetadata === false
        ) {
          showDialog({
            title: 'Warning',
            text:
              selectedItems.length > 1
                ? localization.RESTRICT.attachAssetsToCollection
                : localization.RESTRICT.attachAssetToCollection,
            textBtnOk: 'Ok',
            textBtnCancel: null,
          });
          return;
        }
        dispatch(assetsActions.attachKeyword(node.path.split('→').pop()));
      }
    },
    [dispatch, rolePermissions.restrictedChangeMetadata, tree],
  );

  const memoizedKeywordsTree = useMemo(() => {
    if (tree?.keywords) return [tree.keywords];
    return [];
  }, [tree]);

  const memoizedKeywordsFavoritesTree = useMemo(() => {
    if (tree?.favorites) return [tree.favorites];
    return [];
  }, [tree]);

  return (
    <KeywordsView
      activeKeywords={activeKeywords}
      selectedKeywords={selectedKeywords}
      isLoaded={isLoaded}
      isLoading={isLoading}
      isBusy={isBusy}
      error={error}
      allNodes={all}
      keywordsFavoritesTree={memoizedKeywordsFavoritesTree}
      keywordsTree={memoizedKeywordsTree}
      searchQuery={searchQuery}
      sortType={sortType}
      searchItems={searchItems}
      setSort={setSort}
      panelWidth={panelWidth}
      resizePanelWidth={resizePanelWidth}
      addItem={addItem}
      renameItem={renameItem}
      deleteItem={deleteItem}
      deleteItems={deleteItems}
      mergeItems={mergeItems}
      toggleFavoriteItem={toggleFavoriteItem}
      handleDrop={handleDrop}
      setSelectedItems={setSelectedItems}
      selectItem={selectItem}
      deselectItem={deselectItem}
      rolePermissions={rolePermissions}
      isKeywordsActionsAllowed={isKeywordsActionsAllowed}
      isAddKeywordsOutsideVocabulary={isAddKeywordsOutsideVocabulary}
      getKeywords={getKeywords}
    />
  );
};

export default Keywords;
