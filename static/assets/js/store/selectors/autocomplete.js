import { createSelector } from 'reselect';

const getLightboards = (state) => state.lightboards.lightboards;
const getActiveLightboardId = (state) => state.lightboards.activeLightboardID;
const getInboxes = (state) => state.inboxes.inboxes;
const getActiveInboxId = (state) => state.inboxes.activeInboxID;
const getUser = (state) => state.user;

export const lightboardSelector = createSelector(
  getLightboards,
  getActiveLightboardId,
  (lightboards, lightboardId) => lightboards.find((lb) => lb._id === lightboardId),
);

export const inboxSelector = createSelector(getInboxes, getActiveInboxId, (inboxes, inboxId) => inboxes.find((lb) => lb._id === inboxId));

export const userIdSelector = createSelector(getUser, (user) => {
  const { _id: userId } = user;
  return userId;
});

export default {
  lightboardSelector,
  inboxSelector,
  userIdSelector,
};
