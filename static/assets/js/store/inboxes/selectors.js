/* eslint-disable import/prefer-default-export */
import { createSelector } from '@reduxjs/toolkit';

const DEFAULT_SORT_TYPE = { type: 'uploadTime', order: 'desc' };

const selectInboxes = (state) => state.inboxes.inboxes;
const selectActiveInboxId = (state) => state.inboxes.activeInboxID;
const selectUserId = (state) => state.user._id;

export const activeInboxSelector = createSelector(
  selectInboxes,
  selectActiveInboxId,
  (inboxes, activeId) => inboxes.find(({ _id }) => _id === activeId),
);

export const activeSortTypeSelector = createSelector(
  selectUserId,
  activeInboxSelector,
  (userId, activeInbox) => {
    if (!activeInbox) return null;

    const { sortType } = activeInbox;
    if (!sortType) return { ...DEFAULT_SORT_TYPE };

    const userSortType = sortType.find((sort) => sort.userId === userId);
    if (!userSortType) return { ...DEFAULT_SORT_TYPE };

    return { type: userSortType.type, order: userSortType.order };
  },
);
