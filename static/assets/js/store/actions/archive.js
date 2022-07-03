import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { getTargetCollection, getRootCollectionId, findCollectionById } from './helpers/archive';
// eslint-disable-next-line import/no-cycle
import * as collectionsActions from './collections';
import * as helpers from '../helpers/collections';
import { getCollectionName } from '../../helpers/paths';
import { back, isRoutePreview, setSearchRoute } from '../../helpers/history';
import { showDialog } from '../../components/dialog';

export const setActiveCollectionId = createAction('archive/setActiveCollectionId');
export const resetSearch = createAction('archive/resetSearch');
export const addCollections = createAction('archive/addCollections');
export const addToDeleted = createAction('archive/addToDeleted');
export const addToAdded = createAction('archive/addToAdded');
export const deleteCollections = createAction('archive/deleteCollections');
export const deleteCollectionsById = createAction('archive/deleteCollectionsById');
export const toggleRecursiveSearch = createAction('archive/toggleRecursiveSearch');

const navigateToRoot = (getState, dispatch, archived = false) => {
  const rootCollectionId = getRootCollectionId(getState(), dispatch);
  const query = { tagId: rootCollectionId };
  if (archived) {
    query.archived = true;
  }

  setSearchRoute(query, { replace: true });

  if (archived) {
    dispatch(setActiveCollectionId(rootCollectionId));
  }
  return rootCollectionId;
};

const showError = (e, Toast, utils, localization) => {
  const errorStatus = utils.getStatusFromResponceError(e);

  if (errorStatus === 403) {
    Toast(localization.NO_PERMISSION_TO_ACCESS);
  } else {
    showDialog({
      title: localization.SOMETHING_WENT_WRONG.TITLE,
      text: localization.SOMETHING_WENT_WRONG.TEXT,
    });
  }
};

export const fetchArchivedCollections = createAsyncThunk(
  'archive/fetchArchivedCollections',
  async (payload, { extra: { api, Toast, utils, localization }, rejectWithValue }) => {
    const { collectionId, currentCollectionId } = payload;

    try {
      const children = await api.collections.getChildren(collectionId, {
        currentCollectionId,
        archived: true
      });

      return { ...payload, children };
    } catch (e) {
      showError(e, Toast, utils, localization);
      return rejectWithValue(e);
    }
  }
);

export const archiveCollection = createAsyncThunk(
  'archive/archiveCollection',
  async (payload, { extra: { api, utils, localization, UiBlocker, Toast }, rejectWithValue, dispatch, getState }) => {
    const { collectionId, reason } = payload;

    try {
      UiBlocker.block('Processing...');

      const res = await api.collections.archiveCollection(collectionId, reason);
      const { collections } = res;
      const targetCollection = getTargetCollection(collections, collectionId);
      const { name } = targetCollection;

      dispatch(addCollections({ ...res, user: getState().user }));
      dispatch(collectionsActions.decrementCount(res.assetsCount));

      navigateToRoot(getState);
      Toast(localization.TOAST.COLLECTION_ARCHIVED(name), { audit: true });

      return res;
    } catch (e) {
      showError(e, Toast, utils, localization);
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  }
);

export const unarchiveCollection = createAsyncThunk(
  'archive/unarchiveCollection',
  async ({ collectionId }, { extra: { api, utils, localization, UiBlocker, Toast }, rejectWithValue, dispatch, getState }) => {

    try {
      UiBlocker.block('Processing...');
      const res = await api.collections.unarchiveCollection(collectionId);
      const { collections } = res;
      const targetCollection = getTargetCollection(collections, collectionId);
      const { name } = targetCollection;

      dispatch(deleteCollections({ ...res, user: getState().user }));
      dispatch(collectionsActions.incrementCount(res.assetsCount));

      navigateToRoot(getState, dispatch, true);
      Toast(localization.TOAST.COLLECTION_UNARCHIVED(name), { audit: true });

      return res;
    } catch (e) {
      showError(e, Toast, utils, localization);
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  }
);

export const deleteArchiveCollection = createAsyncThunk(
  'archive/deleteArchiveCollection',
  async (collectionId, { extra: { api, utils, UiBlocker, Toast, localization }, rejectWithValue, dispatch, getState }) => {
    try {
      UiBlocker.block('Processing...');
      const res = await api.collections.remove(collectionId);
      const { collection, collections } = res;
      const collectionName = getCollectionName(collection.path);

      const unarchivedIds = collections.map(({ _id }) => _id);
      dispatch(deleteCollectionsById({ ids: [collection._id, ...unarchivedIds] }));

      navigateToRoot(getState, dispatch, true);
      Toast(localization.TOAST.ARCHIVED_COLLECTION_DELETED(collectionName), { audit: true });

      return res;
    } catch (e) {
      showError(e, Toast, utils, localization);
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  }
);

export const searchArchivedCollections = createAsyncThunk(
  'archive/searchArchivedCollections',
  async (query, { extra: { api }, rejectWithValue }) => {
    try {
      const res = await api.collections.search(query, { archived: true });

      return res;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const archiveAssets = createAsyncThunk(
  'archive/archiveAssets',
  async (payload, { extra: { UiBlocker, utils, api, localization, Toast }, rejectWithValue, dispatch, getState }) => {
    const { ids, reason } = payload;

    try {
      UiBlocker.block('Processing...');
      const res = await api.assets.archiveAssets(payload);

      // if user archive asset from preview page, we move user back to search
      if (isRoutePreview()) {
        back();
      }
      const { showArchived } = getState().router.location.query;
      // if user activated "showArchived" option on search panel, we don't hide archived assets
      const hide = !!showArchived;

      dispatch(addCollections({ ...res, user: getState().user }));
      dispatch(collectionsActions.incrementCount(ids.length));

      Toast(localization.TOAST.ASSETS_ARCHIVED(ids.length), { audit: true });

      return {
        ids,
        reason,
        hide,
      };
    } catch (e) {
      showError(e, Toast, utils, localization);
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  }
);

export const unarchiveAssets = createAsyncThunk(
  'archive/unarchiveAssets',
  async ({ ids, collectionId }, { extra: { api, utils, Toast, UiBlocker, localization }, rejectWithValue, dispatch, getState }) => {
    try {
      UiBlocker.block('Processing...');
      const res = await api.assets.unarchiveAssets({ ids, collectionId });
      const { ids: assetsIds } = res;

      // if user unarchive asset from preview page - we move user back to search
      if (isRoutePreview()) {
        back();
      }
      const { archived } = getState().router.location.query;
      // if user on archive view - we remove unarchived assets
      const hide = !!archived;

      dispatch(deleteCollections({ ...res, user: getState().user }));
      dispatch(collectionsActions.decrementCount(assetsIds.length));

      Toast(localization.TOAST.ASSETS_UNARCHIVED(assetsIds.length), { audit: true });

      // if unarchive all assets from collection, we need to change active collection
      const { items } = getState().assets;
      if (items.length === assetsIds.length) {
        const rootArchiveCollection = getState().archive.collections[0];
        dispatch({
          type: 'archive/setActiveCollection/fulfilled',
          payload: { collection: rootArchiveCollection },
        });
      }

      return { ids: assetsIds, hide };
    } catch (e) {
      showError(e, Toast, utils, localization);
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  },
);

export const setActiveCollection = createAsyncThunk(
  'archive/setActiveCollection',
  async (collectionId, { rejectWithValue, dispatch, getState }) => {
    const currectActiveCollection = getState().archive.activeCollection;
    if (currectActiveCollection?._id === collectionId) return;

    try {
      if (collectionId === null) {
        if (currectActiveCollection === null) return;
        dispatch({ type: 'archive/setActiveCollection', payload: { collection: null } });
        return;
      }

      let collection = findCollectionById(getState().archive.collections, collectionId);
      if (!collection) {
        collection = await helpers.forceFindTagWithTagId(
          getState().collections.collections,
          getState().collections.search,
          collectionId,
        );
      }

      dispatch({ type: 'archive/setActiveCollection', payload: { collection } });

      return { collection };
    } catch (e) {
      return rejectWithValue(e);
    } finally {};
  },
);

export default {
  setActiveCollectionId,
  setActiveCollection,
  resetSearch,
  addCollections,
  addToDeleted,
  addToAdded,
  deleteCollections,
  deleteCollectionsById,
  toggleRecursiveSearch,
  fetchArchivedCollections,
  archiveCollection,
  unarchiveCollection,
  deleteArchiveCollection,
  searchArchivedCollections,
  archiveAssets,
  unarchiveAssets,
};
