import union from 'lodash.union';
import TYPES from '../action-types';
import * as helpers from '../helpers/notifications';

const defaultState = {
  items: [],
  changedTags: [],
  jobsStatus: {},
  newComments: {},
  newRevisions: {},
  notificationsUnreadCount: 0,
};

export default function (state = defaultState, action) {
  const { type, payload, error } = action;

  switch (type) {
  /* Receive all unread notifications */
  case TYPES.NOTIFICATIONS.FETCH.START: {
    return {
      ...state,
      isLoaded: false,
      error: null,
      notificationsUnreadCount: state.notificationsUnreadCount,
    };
  }
  case TYPES.NOTIFICATIONS.FETCH.COMPLETE: {
    return {
      ...state,
      isLoaded: true,
      error: null,
      items: payload.items || [],
      newComments: payload.newComments,
      newRevisions: payload.newRevisions,
      notificationsUnreadCount: payload.notificationsUnreadCount || 0,
    };
  }
  case TYPES.NOTIFICATIONS.FETCH.FAILED: {
    return {
      ...state,
      isLoaded: true,
      error,
      items: [],
      notificationsUnreadCount: state.notificationsUnreadCount,
    };
  }

  /* Receive notification */
  case TYPES.NOTIFICATIONS.ADD: {
    return {
      ...state,
      items: helpers.addNotification(state.items, payload.item),
      notificationsUnreadCount: state.notificationsUnreadCount + 1,
    };
  }

  case TYPES.NOTIFICATIONS.MERGE: {
    return {
      ...state,
      items: helpers.mergeNotification(state.items, payload.mergedItem),
    };
  }

  /* Receive ID of changed collections */
  case TYPES.NOTIFICATIONS.ADD_CHANGED_TAGS_IDS: {
    return {
      ...state,
      changedTags: union(payload.ids, [...state.changedTags]).sort(),
    };
  }

  /* Clear all notifications */
  case TYPES.NOTIFICATIONS.CLEAR.START: {
    return {
      ...state,
      error: null,
      items: [],
    };
  }
  case TYPES.NOTIFICATIONS.CLEAR.COMPLETE: {
    return {
      ...state,
      error: null,
      items: [],
      newComments: {},
      newRevisions: {},
      notificationsUnreadCount: 0,
    };
  }
  case TYPES.NOTIFICATIONS.CLEAR.FAILED: {
    return {
      ...state,
      error,
      items: [],
    };
  }

  /* Read notification */
  case TYPES.NOTIFICATIONS.MARK_AS_READ.START: {
    const { updatedItems, updatedNewComments, updatedNewRevisions } = helpers.setNotificationRead(
      state.items,
      state.newComments,
      state.newRevisions,
      payload.notificationIDS,
    );
    return {
      ...state,
      error: null,
      items: updatedItems,
      newComments: updatedNewComments,
      newRevisions: updatedNewRevisions,
    };
  }
  case TYPES.NOTIFICATIONS.MARK_AS_READ.COMPLETE: {
    return {
      ...state,
      error: null,
      notificationsUnreadCount: payload.withoutChangeCount
        ? state.notificationsUnreadCount
        : state.notificationsUnreadCount - payload.notificationIDS.length,
    };
  }
  case TYPES.NOTIFICATIONS.MARK_AS_READ.FAILED: {
    return {
      ...state,
      error,
    };
  }

  /* Get asset thumnails url */
  case TYPES.NOTIFICATIONS.GET_THUMBNAILS.START: {
    return {
      ...state,
      isInprogress: true,
      error: null,
      items: helpers.setThumbnailsField(state.items, payload.ids, 'isLoading', true),
    };
  }

  case TYPES.NOTIFICATIONS.GET_THUMBNAILS.COMPLETE: {
    return {
      ...state,
      isInprogress: false,
      error: null,
      items: helpers.setThumbnails(state.items, payload.thumbnails),
    };
  }

  case TYPES.NOTIFICATIONS.GET_THUMBNAILS.FAILED: {
    return {
      ...state,
      isInprogress: false,
      error,
    };
  }

  /* Receive ID of changed collections */
  case TYPES.NOTIFICATIONS.CLEAR_CHANGED_TAGS_IDS: {
    return {
      ...state,
      changedTags: [],
    };
  }

  /* Fetch async jobs status */
  case TYPES.NOTIFICATIONS.FETCH_JOBS.START: {
    return {
      ...state,
      isLoaded: false,
      error: null,
    };
  }
  case TYPES.NOTIFICATIONS.FETCH_JOBS.COMPLETE: {
    const statuses = payload.jobsStatus || {};
    return {
      ...state,
      isLoaded: true,
      error: null,
      jobsStatus: { ...state.jobsStatus, ...statuses },
    };
  }
  case TYPES.NOTIFICATIONS.FETCH_JOBS.FAILED: {
    return {
      ...state,
      isLoaded: true,
      error,
      jobsStatus: {},
    };
  }

  case TYPES.NOTIFICATIONS.INCREASE_UNREAD_PARAM: {
    const { paramName, eventId, assetId } = payload;
    const param = { ...state[paramName] };
    if (param[assetId]) {
      param[assetId].push(eventId);
    } else {
      param[assetId] = [eventId];
    }
    return {
      ...state,
      [paramName]: param,
    };
  }

  default: {
    return state;
  }
  }
}
