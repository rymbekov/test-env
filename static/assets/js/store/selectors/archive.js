import { createSelector } from 'reselect';
import _get from 'lodash/get';

import { findCollectionById } from '../actions/helpers/archive';

const getCollections = state => state.archive.collections;
const getActiveCollectionId = state => state.archive.activeCollectionId;
const getSubscriptionsFeatures = (state) => _get(state, 'user.subscriptionFeatures', {});
const getPermissions = (state) => _get(state, 'user.role.permissions', {});
const getPanelWidth = (state, path) => _get(state.main.panelsWidth, path);
const getSortType = (state) => _get(state, 'user.collectionsSortType', {
  type: 'name',
  order: 'asc',
});

export const userSelector = createSelector(
  getSubscriptionsFeatures,
  getPermissions,
  (subscriptionsFeatures, permissions) => ({
    subscriptionsFeatures,
    permissions,
  }),
);

export const panelWidthSelector = createSelector(
  getPanelWidth,
  (width) => width,
);

export const sortTypeSelector = createSelector(
  getSortType,
  (sortType) => sortType,
);

// @TODO: use activeCollection, not activeCollectionId
export const activeCollectionSelector = createSelector(
  getCollections,
  getActiveCollectionId,
  (collections, activeCollectionId) => findCollectionById(collections, activeCollectionId),
);

export default {
  userSelector,
  panelWidthSelector,
  sortTypeSelector,
  activeCollectionSelector,
};
