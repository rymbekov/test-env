import { createSelector } from 'reselect';
import _get from 'lodash/get';

const getSubscriptionsFeatures = (state) => _get(state, 'user.subscriptionFeatures', {});
const getPermissions = (state) => _get(state, 'user.role.permissions', {});
const getIsKeywordsActionsAllowed = (state) => _get(state, 'user.isKeywordsActionsAllowed', false);
const getPanelWidth = (state, path) => _get(state.main.panelsWidth, path);
const getSelectedKeywordsIds = (state) => _get(state, 'keywords.selectedKeywords', []);
const getSortType = (state) => _get(state, 'user.keywordsSortType', {
  type: 'name',
  order: 'asc',
});

export const userSelector = createSelector(
  getIsKeywordsActionsAllowed,
  getSubscriptionsFeatures,
  getPermissions,
  (isKeywordsActionsAllowed, subscriptionsFeatures, permissions) => ({
    isKeywordsActionsAllowed,
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

export const selectedKeywordsIdsSelector = createSelector(
  getSelectedKeywordsIds,
  (ids) => ids,
);

export default {
  userSelector,
  panelWidthSelector,
  sortTypeSelector,
  selectedKeywordsIdsSelector,
};
