import uniq from 'lodash.uniq';
import getThumbnailUrls from '../../helpers/getThumbnailUrls';
import store from '../index';
import Logger from '../../services/Logger';

import { getRoleById } from '../reducers/roles';
import ua from '../../ua';
import sdk from '../../sdk';
import * as helpers from '../helpers/notifications';
import TYPES from '../action-types';
import { addHighlight } from './assets';

function setBadge(value) {
  if (window.cordova) {
    if (ua.isMobileApp() && ua.getPlatform() === 'ios' && value > 99) {
      window.cordova.plugins.notification.badge.set('99+');
    } else {
      window.cordova.plugins.notification.badge.set(value);
    }
  } else if (navigator.setAppBadge) {
    navigator.setAppBadge(value);
  } else if (navigator.setExperimentalAppBadge) {
    navigator.setExperimentalAppBadge(value);
  } else if (window.ExperimentalBadge) {
    window.ExperimentalBadge.set(value);
  }
}

function clearBadge() {
  if (window.cordova) {
    window.cordova.plugins.notification.badge.clear();
  } else if (navigator.clearAppBadge) {
    navigator.clearAppBadge();
  } else if (navigator.clearExperimentalAppBadge) {
    navigator.clearExperimentalAppBadge();
  } else if (window.ExperimentalBadge) {
    window.ExperimentalBadge.clear();
  }
}

function setDocumentTitle(notificationsNumber) {
  const currentTitle = document.title;
  const index = currentTitle.indexOf('Pics.io');
  let title = currentTitle.substring(index);

  // if navigator support badges we need to receive count of unread messages
  if (
    navigator.clearAppBadge ||
    navigator.setExperimentalAppBadge ||
    window.ExperimentalBadge ||
    window.cordova
  ) {
    if (notificationsNumber === 0) {
      clearBadge();
    }
    if (notificationsNumber > 0) {
      setBadge(notificationsNumber);
    }
  }

  const normalizedNotificationsNumber = notificationsNumber < 100 ? notificationsNumber : '99+';
  if (normalizedNotificationsNumber) title = `(${normalizedNotificationsNumber}) ${title}`;
  document.title = title;
}

/** Get notifications asset thumbnail */
export function setThumbnails(ids) {
  return async (dispatch) => {
    dispatch({
      type: TYPES.NOTIFICATIONS.GET_THUMBNAILS.START,
      payload: {
        ids,
      },
    });

    try {
      let thumbnails = await getThumbnailUrls(ids);
      if (thumbnails.some((item) => !item.thumbnailLink)) {
        thumbnails = await getThumbnailUrls(ids);
      }

      dispatch({
        type: TYPES.NOTIFICATIONS.GET_THUMBNAILS.COMPLETE,
        payload: {
          thumbnails,
        },
      });
    } catch (error) {
      Logger.error(new Error('Can not get notifications thumbnails'), { error }, [
        'NotificationsSetThumbnailsFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({
        type: TYPES.NOTIFICATIONS.GET_THUMBNAILS.FAILED,
        error,
      });
    }
  };
}

/** Receive all unread notifications */
export function getNotifications() {
  return async (dispatch) => {
    dispatch({ type: TYPES.NOTIFICATIONS.FETCH.START });
    let result = {};

    try {
      const { data } = await sdk.users.fetchNotifications(100);
      result = data;
      const { _id: currentUserId } = await store.getState().user;
      const team = await store.getState().teammates.items;

      const items = [];
      const newComments = {};
      const newRevisions = {};

      result.events.forEach((item) => {
        if (item.initiator) {
          const user = team.find((user) => user._id === item.initiator._id);
          if (user) {
            item.initiator.avatar = user.avatar;
            item.initiator.displayName = user.displayName;
          }
        }

        if (item.type === 'asset.comment.added') {
          if (!newComments[item.data.asset._id]) {
            newComments[item.data.asset._id] = [];
            newComments[item.data.asset._id].push(item._id);
          } else {
            newComments[item.data.asset._id].push(item._id);
          }
        }
        if (item.type === 'asset.revision.created') {
          if (!newRevisions[item.data.asset._id]) {
            newRevisions[item.data.asset._id] = [];
            newRevisions[item.data.asset._id].push(item._id);
          } else {
            newRevisions[item.data.asset._id].push(item._id);
          }
        }

        items.push(item);
      });

      const fullSyncFailedEvent = items.find((item) => item.type === 'sync.failed.FullSync');
      if (fullSyncFailedEvent && currentUserId === fullSyncFailedEvent.initiator._id) {
        const { code, websites } = fullSyncFailedEvent.data;
        helpers.showDestructiveSyncErrorDialog(code, websites);
        notificationMarkAsRead(fullSyncFailedEvent._id)(dispatch);
      }

      dispatch({
        type: TYPES.NOTIFICATIONS.FETCH.COMPLETE,
        payload: {
          items,
          newComments,
          newRevisions,
          notificationsUnreadCount: result.count,
        },
      });

      setDocumentTitle(items.length);

      const itemsToThumbnailing = items.filter((item) =>
        helpers.eventsWithThumbnails.includes(item.type)
      );

      if (itemsToThumbnailing.length) {
        const ids = itemsToThumbnailing.map(
          (item) => (item.data?.asset?._id)
            || (item.data?.assets?.length && item.data.assets[0]._id),
        ).filter(Boolean);
        if (ids.length) {
          setThumbnails(ids)(dispatch);
        }
      }
    } catch (error) {
      Logger.error(new Error('Can not get notifications'), { error }, [
        'NotificationsFetchFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({
        type: TYPES.NOTIFICATIONS.FETCH.FAILED,
        error,
      });
    }
  };
}

/** Receive notification */
export function add(item) {
  return async (dispatch) => {
    const notifications = store.getState().notifications.items;
    if (notifications.find((notification) => notification._id === item._id)) return;

    dispatch({
      type: TYPES.NOTIFICATIONS.ADD,
      payload: { item },
    });

    const unreadedItems = store.getState().notifications.items.filter((item) => !item.read);
    setDocumentTitle(unreadedItems.length);

    if (helpers.eventsWithThumbnails.includes(item.type)) {
      const id = (item.data.asset?._id) || (item.data.assets?.length && item.data.assets[0]._id);
      setThumbnails([id])(dispatch);
    }
  };
}

/** Receive IDS of changed collections */
export const addChangedTagsIds = (ids) => {
  const { teammateRoleId } = store.getState().user.team;
  const role = teammateRoleId && getRoleById(teammateRoleId);
  const allowedCollections = role && role.allowedCollections;
  if (allowedCollections) {
    const isIdsContainAllowedCollections = allowedCollections.some((collection) =>
      ids.includes(collection._id)
    );
    if (!isIdsContainAllowedCollections) {
      ids = [];
    }
  }

  return (dispatch) => {
    dispatch({
      type: TYPES.NOTIFICATIONS.ADD_CHANGED_TAGS_IDS,
      payload: { ids },
    });
  };
};

/** Clear notifications */
export function clear() {
  return async (dispatch) => {
    dispatch({ type: TYPES.NOTIFICATIONS.CLEAR.START });
    setDocumentTitle(0);

    try {
      await sdk.users.notificationsMarkAllAsRead();
      dispatch({
        type: TYPES.NOTIFICATIONS.CLEAR.COMPLETE,
      });
    } catch (error) {
      Logger.error(new Error('Can not clear notifications'), { error }, [
        'NotificationsMarkAllAsReadFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({
        type: TYPES.NOTIFICATIONS.CLEAR.FAILED,
        error,
      });
    }
  };
}

/** Read notification */
export function notificationMarkAsRead(notificationID, withoutChangeCount) {
  return async (dispatch) => {
    dispatch({
      type: TYPES.NOTIFICATIONS.MARK_AS_READ.START,
      payload: {
        notificationIDS: [notificationID],
      },
    });

    if (!withoutChangeCount) {
      const unreadedItems = store.getState().notifications.items.filter((item) => !item.read);
      setDocumentTitle(unreadedItems.length);
    }

    const notificationIDS = [notificationID];

    try {
      await sdk.users.notificationMarkAsRead(notificationID);
      dispatch({
        type: TYPES.NOTIFICATIONS.MARK_AS_READ.COMPLETE,
        payload: {
          withoutChangeCount,
          notificationIDS,
        },
      });
    } catch (error) {
      Logger.error(new Error('Can not mark notification as read'), { error }, [
        'NotificationMarkAsReadFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({
        type: TYPES.NOTIFICATIONS.MARK_AS_READ.FAILED,
        error,
      });
    }
  };
}

/** Read notifications */
export const notificationsMarkAsRead = (assetId, withoutChangeCount) => async (dispatch) => {
  const { newComments, newRevisions } = store.getState().notifications;
  const unredNewCommentsEventIds = newComments[assetId] || [];
  const unredNewRevisionsEventIds = newRevisions[assetId] || [];
  const notificationIDS = uniq([...unredNewCommentsEventIds, ...unredNewRevisionsEventIds]);
  if (!notificationIDS.length) return true;

  dispatch({
    type: TYPES.NOTIFICATIONS.MARK_AS_READ.START,
    payload: {
      notificationIDS,
    },
  });

  if (!withoutChangeCount) {
    const unreadedItems = store.getState().notifications.items.filter((item) => !item.read);
    setDocumentTitle(unreadedItems.length);
  }

  try {
    await sdk.users.notificationsMarkAsRead(notificationIDS);
    dispatch({
      type: TYPES.NOTIFICATIONS.MARK_AS_READ.COMPLETE,
      payload: {
        withoutChangeCount,
        notificationIDS,
      },
    });
  } catch (error) {
    Logger.error(new Error('Can not mark notification as read'), { error }, [
      'NotificationMarkAsReadFailed',
      (error && error.message) || 'NoMessage',
    ]);
    dispatch({
      type: TYPES.NOTIFICATIONS.MARK_AS_READ.FAILED,
      error,
    });
  }
};

/** Clear IDs of changed collections */
export const clearChangedTagsIds = () => ({
  type: TYPES.NOTIFICATIONS.CLEAR_CHANGED_TAGS_IDS,
});

/** Fetch async jobs status */
export function fetchJobsStatus() {
  return async (dispatch) => {
    dispatch({ type: TYPES.NOTIFICATIONS.FETCH_JOBS.START });

    try {
      const { data } = await sdk.users.fetchJobsStatus();
      dispatch({
        type: TYPES.NOTIFICATIONS.FETCH_JOBS.COMPLETE,
        payload: {
          jobsStatus: data,
        },
      });
    } catch (error) {
      /* if browser tab is hidden
       * maybe the browser has terminated the request
       */
      dispatch({
        type: TYPES.NOTIFICATIONS.FETCH_JOBS.FAILED,
        error,
      });
    }
  };
}

export function updateJobsStatus(jobsStatus) {
  return async (dispatch) => {
    dispatch({
      type: TYPES.NOTIFICATIONS.FETCH_JOBS.COMPLETE,
      payload: { jobsStatus },
    });
  };
}

export function updateUnreadParam(paramName, eventId, assetId) {
  return async (dispatch) => {
    addHighlight([assetId], paramName)(dispatch);

    dispatch({
      type: TYPES.NOTIFICATIONS.INCREASE_UNREAD_PARAM,
      payload: { paramName, eventId, assetId },
    });
  };
}
