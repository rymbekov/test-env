/* eslint-disable max-classes-per-file */
import Logger from '../services/Logger';
import * as api from './index';
import * as utils from '../shared/utils';

/**
 * Sync Api exceptions
 */
class SyncApiError extends api.errors.ApiError {}
class SlowSync extends SyncApiError {}
class SyncAlreadyRunning extends SyncApiError {
  constructor(progress) {
    super();
    this.progress = progress;
  }
}

class DestructiveSync extends SyncApiError {
  constructor() {
    super();
  }
}

class DestructiveWebsitesSync extends SyncApiError {
  constructor(websites) {
    super();
    this.websites = websites;
  }
}

class SyncLimitExceeded extends SyncApiError {
  constructor(minutesBeforeNextSync) {
    super();
    this.minutesBeforeNextSync = minutesBeforeNextSync;
  }
}

export const errors = {
  SyncAlreadyRunning,
  SyncLimitExceeded,
  DestructiveSync,
  DestructiveWebsitesSync,
  SlowSync,
  SyncApiError,
  ...api.errors,
};

const HTTP_TIMEOUT = 504;
const SYNC_LIMIT_EXCEEDED = 429;
const SYNC_ALREADY_RUNNING = 409;
const SYNC_IS_DESTRUCTIVE = 410;
const SYNC_IS_DESTRUCTIVE_WEBSITES = 411;

export const runSync = async (allowDestructive = false) => {
  Logger.log('User', allowDestructive ? 'SettingsSyncConfirmDestructive' : 'SettingsSyncConfirm');
  try {
    if (allowDestructive) {
      return await api.post('/sync/start?allowDestructive=true');
    }
    return await api.post('/sync/start');
  } catch (error) {
    const res = error.response && error.response.data;
    const errorStatus = utils.getStatusFromResponceError(error);
    if (errorStatus === SYNC_IS_DESTRUCTIVE) {
      throw new DestructiveSync();
    } else if (errorStatus === SYNC_IS_DESTRUCTIVE_WEBSITES) {
      throw new DestructiveWebsitesSync(res.websites);
    } else if (errorStatus == SYNC_ALREADY_RUNNING && res.running === true) {
      throw new SyncAlreadyRunning(res.progress);
    } else if (errorStatus == SYNC_LIMIT_EXCEEDED) {
      throw new SyncLimitExceeded(res.minutesBeforeNextSync);
    } else if (errorStatus === HTTP_TIMEOUT) {
      throw new SlowSync();
    } else {
      throw error;
    }
  }
};

/**
 * Fetch current sync setting
 * @returns {Promise}
 */
export const fetchSyncSettings = () => api.get('/sync/settings');

/**
 * Get Google tokes scopes
 * @returns {Promise}
 */
export const getTokenScopes = () => api.get('/auth/google/getTokenScopes');

/**
 * Append new Google scopes
 * @returns {Promise}
 */
export const appendNewScopes = (code) =>
  api.post('/auth/google/appendNewScopes', {
    data: { code },
  });

/**
 * Check if folder is empty
 * @param {string} folderId
 * @returns {Promise}
 */
export const isFolderEmpty = (folderId) => api.get('/sync/isFolderEmpty', { params: { folderId } });
