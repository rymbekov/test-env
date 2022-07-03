import { createSlice } from '@reduxjs/toolkit';
import { original } from 'immer';
import _isArray from 'lodash/isArray';
// import _filter from 'lodash/filter';
// import _map from 'lodash/map';

import TYPES from '../action-types';
import {
  setActiveCollectionId,
  setActiveCollection,
  resetSearch,
  addToDeleted,
  addToAdded,
  addCollections,
  deleteCollections,
  deleteCollectionsById,
  toggleRecursiveSearch,
  fetchArchivedCollections,
  searchArchivedCollections,
} from '../actions/archive';
import { getTreeWithCollections, getTreeWithoutCollections, filterTree } from './helpers/archive';

const initialState = {
  loading: false,
  collections: [],
  activeCollectionId: null,
  activeCollection: null,
  search: {
    loading: false,
    query: '',
    collections: [],
  },
  added: [],
  deleted: [],
  recursiveSearch: false,
};

const setCollectionChildren = (collections, collectionId, childNodes) => collections.map((c) => {
  const { _id, path, children } = c;

  if (_id === collectionId) {
    if (!childNodes.length && path !== 'root') {
      return { ...c, hasChild: false };
    }
    return { ...c, children: childNodes, hasChild: true };
  }
  if (children && children.length) {
    return {
      ...c,
      children: setCollectionChildren(children, collectionId, childNodes),
    };
  }
  return c;
});

const unsetActive = (action) => (
  action.type === TYPES.SAVEDSEARCHES.SET_ACTIVE
    || action.type === 'collections/setActiveCollection'
    || action.type === 'lightboards/setActiveLightboard'
    || action.type === 'inboxes/setActiveInbox'
);

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'archive',
  initialState,
  extraReducers: (builder) => builder
    .addCase(TYPES.COLLECTIONS.FETCH.START, (state) => {
      state.loading = true;
    })
    .addCase(TYPES.COLLECTIONS.FETCH.COMPLETE, (state, { payload }) => {
      const { tree: { my } } = payload;

      state.loading = false;
      state.collections = [{ ...my, name: 'Archive' }];
      state.added = [];
      state.deleted = [];
    })
    .addCase(TYPES.COLLECTIONS.FETCH.FAILED, (state) => {
      state.loading = false;
    })
    .addCase(setActiveCollectionId, (state, { payload }) => {
      if (state.activeCollectionId !== payload) {
        state.activeCollectionId = payload;
        state.recursiveSearch = false;
      }
    })
    .addCase(setActiveCollection.fulfilled, (state, { payload }) => {
      if (state.activeCollection?._id !== payload.collection?._id) {
        state.activeCollection = payload.collection;
        state.recursiveSearch = false;
      }
    })
    .addCase(fetchArchivedCollections.pending, (state, { meta }) => {
      const { arg: { fetchMore } } = meta;

      if (!fetchMore) {
        state.loading = true;
      }
    })
    .addCase(fetchArchivedCollections.fulfilled, (state, { payload }) => {
      const { collectionId, currentCollectionId = null, children } = payload;

      state.added = [];
      state.loading = false;
      if (currentCollectionId) {
        state.activeCollectionId = currentCollectionId;
      }
      state.collections = setCollectionChildren(state.collections, collectionId, children);
    })
    .addCase(fetchArchivedCollections.rejected, (state, { meta }) => {
      const { arg } = meta;
      state.loading = false;

      if (state.collections.length) {
        state.collections = setCollectionChildren(state.collections, arg.collectionId, []);
      }
    })
    .addCase(searchArchivedCollections.pending, (state, { meta }) => {
      const { arg: payload } = meta;

      state.search.loading = true;
      state.search.query = payload;
    })
    .addCase(searchArchivedCollections.fulfilled, (state, { payload }) => {
      const rootCollection = state.collections[0];
      const { _id } = rootCollection;

      state.search.loading = false;
      state.search.collections = setCollectionChildren(state.collections, _id, payload);
      state.added = [];
      state.deleted = [];
    })
    .addCase(searchArchivedCollections.rejected, (state) => {
      state.search.loading = false;
    })
    .addCase(resetSearch, (state) => {
      if (state.search.query) {
        state.search = initialState.search;
      }
    })
    .addCase(addCollections, (state, { payload }) => {
      const { collections, user } = payload;

      // if (isTeammate) {
      //   const archived = _map(_filter(collections, { archived: true }), '_id');
      //   state.added = archived;
      // }
      state.collections = getTreeWithCollections(original(state.collections), collections, { user });
    })
    .addCase(deleteCollections, (state, { payload }) => {
      const { collections, parents = [], user } = payload;

      state.deleted = [];
      state.collections = getTreeWithoutCollections(original(state.collections), collections, parents, { user });
      if (state.search.collections.length) {
        state.search.collections = getTreeWithoutCollections(original(state.collections), collections, parents, { user });
      }
    })
    .addCase(deleteCollectionsById, (state, { payload }) => {
      const { ids } = payload;

      state.deleted = [];
      state.collections = state.collections.filter(filterTree(ids));

      if (state.search.collections.length) {
        state.search.collections = state.search.collections.filter(filterTree(ids));
      }
    })
    .addCase(addToAdded, (state, { payload }) => {
      if (typeof payload === 'string') {
        state.added.push(payload);
      } else {
        payload.forEach((id) => {
          state.added.push(id);
        });
      }
    })
    .addCase(addToDeleted, (state, { payload }) => {
      if (typeof payload === 'string') {
        state.deleted.push(payload);
      } else {
        payload.forEach((id) => {
          state.deleted.push(id);
        });
      }
    })
    .addCase(toggleRecursiveSearch, (state) => {
      state.recursiveSearch = !state.recursiveSearch;
    })
    .addMatcher(unsetActive, (state, { payload }) => {
      const key = Object.keys(payload)[0];
      const value = payload[key];
      const isUnsetAllowed = _isArray(value) ? !!value.length : !!value;

      if (isUnsetAllowed) {
        state.activeCollectionId = null;
        state.activeCollection = null;
      }
    }),
});
/* eslint-enable no-param-reassign */

const { reducer } = slice;

export default reducer;
