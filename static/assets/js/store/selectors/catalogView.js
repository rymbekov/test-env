import { createSelector } from 'reselect';
import _get from 'lodash/get';
import picsioConfig from '../../../../../config';
import { findCollection } from '../helpers/collections';
import { activeCollectionSelector as archiveActiveCollectionSelector } from './archive';

const userSelector = (state) => state.user;
const activeCollectionHasChildSelector = (state) => state.collections.activeCollection?.hasChild;
const activeCollectionSelector = (state) => state.collections.activeCollection;
const activeInboxIDSelector = (state) => state.inboxes.activeInboxID;
const assetsSelector = (state) => state.assets.items;
const catalogViewModeSelector = (state) => state.main.catalogViewMode;
const catalogViewItemSizeSelector = (state) => state.main.catalogViewItemSize;
const changedTagsSelector = (state) => _get(state, 'notifications.changedTags', []);
const newComments = (state) => _get(state, 'notifications.newComments', {});
const newRevisions = (state) => _get(state, 'notifications.newRevisions', {});
const downloadListItemsSelector = (state) => _get(state, 'downloadList.items', []);
const fullSelector = (state) => state.assets.full;
const isLoadedSelector = (state) => state.assets.isLoaded;
const notRecursiveSearchSelector = (state) => state.collections.notRecursiveSearch;
const rootCollectionNameSelector = (state) => _get(state, 'collections.collections.my.name', null);
const rootCollectionIdSelector = (state) => _get(state, 'collections.collections.my._id', null);
const selectedAssetsSelector = (state) => state.assets.selectedItems;
const storeCollectionsSelector = (state) => _get(state, 'collections.collections', null);
const tmpItemIDsLengthSelector = (state) => state.assets.tmpItemIDs.length;
const uiBlockedSelector = (state) => state.assets.uiBlocked;
const viewportSelector = (state) => state.main.mapViewport;
const searchQuerySelector = (state) => state.router.location.query;

export const checkIsAssetSelected = (assetId) =>
  createSelector(selectedAssetsSelector, (selectedItems) =>
    selectedItems.some((item) => item === assetId)
  );

export const checkIsAssetHasNewComments = (assetId) =>
  createSelector(newComments, (comments) => {
    if (comments[assetId]) {
      return comments[assetId].length;
    }
    return 0;
  });

export const checkIsAssetHasNewRevisions = (assetId) =>
  createSelector(newRevisions, (revisions) => {
    if (revisions[assetId]) {
      return revisions[assetId].length;
    }
    return null;
  });

export const getUser = createSelector(userSelector, (user) => {
  const { enableEditor, role } = user;
  const { permissions, allowedCollections = [] } = role || {};
  const isAllowedCollections = Boolean(allowedCollections.length);

  return {
    enableEditor,
    permissions,
    isAllowedCollections,
  };
});

const getActiveCollectionHasChild = createSelector(
  activeCollectionHasChildSelector,
  (value) => value
);

const getIsAllowUpload = createSelector(
  storeCollectionsSelector,
  activeCollectionSelector,
  searchQuerySelector,
  (storeCollections, activeCollection, searchQuery) => {
    const currentCollection = findCollection(storeCollections, 'my', {
      _id: activeCollection?._id,
    });

    const isRouteTag = Object.keys(searchQuery).length === 1 && 'tagId' in searchQuery;

    const isAllowed =
      picsioConfig.isMainApp() &&
      isRouteTag &&
      currentCollection &&
      currentCollection.permissions.upload;

    return isAllowed;
  }
);

const getInboxID = createSelector(activeInboxIDSelector, (inboxId) => inboxId);

const getChangedTags = createSelector(changedTagsSelector, (tags) => tags);

const getrootCollectionName = createSelector(rootCollectionNameSelector, (name) => name);

const getrootCollectionId = createSelector(rootCollectionIdSelector, (_id) => _id);

const getCatalogViewMode = createSelector(catalogViewModeSelector, (mode) => mode);

const getCatalogViewItemSize = createSelector(catalogViewItemSizeSelector, (mode) => mode);

const getDownloadListItems = createSelector(downloadListItemsSelector, (list) => list);

const getFull = createSelector(fullSelector, (isFull) => isFull);

const getIsLoaded = createSelector(isLoadedSelector, (isLoaded) => isLoaded);

const getRecursiveSearch = createSelector(notRecursiveSearchSelector, (isRecursive) => isRecursive);

const getTmpItemIDsLength = createSelector(tmpItemIDsLengthSelector, (length) => length);

const getUiBlocked = createSelector(uiBlockedSelector, (uiBlocked) => uiBlocked);

const getViewport = createSelector(viewportSelector, (uiBlocked) => uiBlocked);

export const getCatalogViewProps = createSelector(
  getActiveCollectionHasChild,
  archiveActiveCollectionSelector,
  activeCollectionSelector,
  getInboxID,
  assetsSelector,
  getCatalogViewMode,
  getCatalogViewItemSize,
  getChangedTags,
  getDownloadListItems,
  getFull,
  getIsLoaded,
  getRecursiveSearch,
  getrootCollectionName,
  getrootCollectionId,
  getTmpItemIDsLength,
  getUiBlocked,
  getUser,
  getViewport,
  getIsAllowUpload,
  searchQuerySelector,
  (
    activeCollectionHasChild,
    activeArchiveCollection,
    activeCollection,
    activeInboxID,
    assets,
    catalogViewMode,
    catalogViewItemSize,
    changedTags,
    downloadListItems,
    full,
    isLoaded,
    notRecursiveSearch,
    rootCollectionName,
    rootCollectionId,
    tmpItemIDsLength,
    uiBlocked,
    user,
    viewport,
    isAllowedUpload,
    searchQuery,
  ) => {
    const { archived } = searchQuery;
    const activeArchiveCollectionId = activeArchiveCollection && activeArchiveCollection._id;
    const activeArchiveCollectionHasChild =
      activeArchiveCollection && activeArchiveCollection.hasChild;
    const activeCollectionID = !archived ? activeCollection?._id : activeArchiveCollectionId;
    activeCollectionHasChild = !archived
      ? activeCollectionHasChild
      : activeArchiveCollectionHasChild;

    return {
      activeCollectionHasChild,
      activeCollectionID,
      activeArchivedCollectionId: activeArchiveCollectionId,
      activeInboxID,
      assets,
      catalogViewMode,
      catalogViewItemSize,
      changedTags,
      downloadListItems,
      full,
      isLoaded,
      notRecursiveSearch,
      rootCollectionName,
      rootCollectionId,
      tmpItemIDsLength,
      uiBlocked,
      user,
      viewport,
      isAllowedUpload,
      searchQuery,
    };
  },
);

export default {
  getCatalogViewProps,
  getUser,
  checkIsAssetSelected,
  checkIsAssetHasNewComments,
  checkIsAssetHasNewRevisions,
};
