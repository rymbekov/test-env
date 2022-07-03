import Q from 'q';
import _get from 'lodash/get';
import dayjs from 'dayjs';
import picsioConfig from '../../../../../config';

import store from '../index';
import Logger from '../../services/Logger';
import { removeAutorization } from '../../shared/utils';
import sdk from '../../sdk';
import UiBlocker from '../../services/UiBlocker';
import ua from '../../ua';

export const isUnauthorized = (user) => {
  const { subscriptionFeatures } = user;

  if (!subscriptionFeatures.access) {
    return true;
  }

  if (subscriptionFeatures.planId || subscriptionFeatures.planName) {
    // @TODO: remove subscriptionFeatures.planId, it is an old condition
    return false;
  }

  // let trialEndsAt = new Date(user.trialEnds);
  // if (trialEndsAt > Date.now()) {
  const trialEndsAt = dayjs(new Date(user.trialEnds));
  const today = dayjs(new Date());
  if (trialEndsAt.isBefore(today)) {
    return false;
  }

  return true;
};

export const getUserStorageName = (user) => {
  const { storageType = 'gd', picsioStorage } = user;
  if (picsioStorage) return 'picsioStorage';
  return storageType;
};

export const isHaveTeammatePermission = (name, user) => {
  const currentUser = user || store.getState().user;
  return currentUser.isTeammate ? currentUser.role.permissions[name] === true : true;
};

export const isArchiveAllowed = () => {
  if (!picsioConfig.isMainApp()) return false;
  return store.getState().user ? store.getState().user.role.permissions.viewArchive : false;
};

/**
 * Returns Google Drive working folder (Picsio) id.
 * Working folder is a parents working folder (Picsio) if user is a teammate or its own working folder.
 */
export const getWorkingFolderId = () => {
  const { user } = store.getState();
  return user.isTeammate ? user.team.workingFolderId : user.workingFolderId;
};

const removeMobileAppPushSubscription = async () => {
  const { user } = store.getState();
  const { pushSubscription } = user;
  if (pushSubscription) {
    try {
      await sdk.users.removePushSubscription(pushSubscription);
    } catch (err) {
      Logger.error(new Error('Remove mobile app subscription failed'), { error: err }, [
        'removeMobileAppSubscriptionFailed',
        (err && err.message) || 'NoMessage',
      ]);
      throw err;
    }
  } else {
    Logger.info('Mobile app pushSubscription is undefined');
  }
};

const removeBrowserPushSubscription = async () => {
  Logger.info('removing WebPush Subscription');
  /** remove webPush subscription from DB */
  try {
    const reg = await navigator.serviceWorker.ready;
    Logger.info('removing WebPush Subscription reg: ', JSON.stringify(reg));
    if (reg && 'pushManager' in reg) {
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await sdk.users.removePushSubscription(subscription);
      }
    }
  } catch (err) {
    Logger.error(new Error('Remove webPush subscription failed'), { error: err }, [
      'removeWebPushSubscriptionFailed',
      (err && err.message) || 'NoMessage',
    ]);
    throw err;
  }
};

export const removeCurrentUserWebPushSubscription = async () => {
  if (ua.isMobileApp()) {
    await removeMobileAppPushSubscription();
  } else if ('serviceWorker' in navigator) {
    await removeBrowserPushSubscription();
  }
};

/**
 * Logouts current user and remove all session info from client.
 * NOTE: actually there is no need to store this info on client.
 * Backend holds all sessions for us.
 * @return {[type]} [description]
 */
export const logout = async () => {
  const dfd = Q.defer();

  UiBlocker.block('Logging out of the app...');
  await removeCurrentUserWebPushSubscription();

  try {
    Logger.info('starting signout');
    const res = await sdk.users.logout();
    if (res.data.errors) {
      UiBlocker.unblock();
      Logger.info('signout errors');
      dfd.reject(res.data.errors);
    } else if (res.data.user) {
      Logger.log('User', 'Logout', res.data.user.email);

      /** clear user data(amplitude, sentry) */
      removeAutorization();
      Logger.unsetUser();

      if ('serviceWorker' in navigator) {
        /** remove apiKey from sw */
        Logger.info('removing apiKey from sw');
        (async function () {
          const reg = await navigator.serviceWorker.ready;
          reg.active.postMessage({ apiKey: null });
        }());
      }
      dfd.resolve(res.data.user);
    } else {
      UiBlocker.unblock();
      Logger.info('Something went wrong');
      dfd.reject({ error: 'Something went wrong' });
    }
  } catch (error) {
    UiBlocker.unblock();
    Logger.info('Something went wrong');
    dfd.reject({ error: 'Something went wrong' });
  }

  return dfd.promise;
};

export const checkIsKeywordsActionsAllowed = (permissions, policies) => !!(permissions.manageKeywords && !policies.useKeywordsControlledVocabulary);

export const checkIsSyncAllowed = (role, user) => {
  let isSyncAllowed = isHaveTeammatePermission('sync', user);

  if (isSyncAllowed) {
    const { allowedCollections } = role;
    if (allowedCollections && allowedCollections.length) {
      const rootCollection = allowedCollections.find((collection) => collection.path === '/root');
      isSyncAllowed = !!rootCollection;
    }
  }

  return !!isSyncAllowed;
};

const getCheckerTarget = (user, type) => {
  const {
    subscriptionFeatures,
    role: { permissions },
  } = user;

  switch (type) {
  case 'permissions':
    return permissions;
  case 'subscriptions':
    return subscriptionFeatures;
  default:
    return {};
  }
};

// simple implementation of permission checker
// now it uses for archive checking.
export const checkUserAccess = (type, path, checkerFn = null) => {
  if (!picsioConfig.isMainApp()) return false;

  const { user } = store.getState();
  const checkerTarget = getCheckerTarget(user, type);
  const value = _get(checkerTarget, path, false);

  if (checkerFn) {
    return checkerFn(value);
  }
  return !!value;
};

export const initAmplitude = (user) => {
  const {
    email,
    displayName,
    parent,
    role,
    subscriptionFeatures,
    team = {},
    utmTracking = {},
    personalTwoFactorEnabled,
    twoFactorConfigured,
    twoFactorEnabled,
    twoFactorMode,
  } = user;
  const { permissions } = role;

  Logger.clearUserProperties();

  const teamName = (team.policies && team.policies.teamName) || team.displayName;
  const roleName = !parent ? 'Team owner' : role.name;
  let roleGroup = {};
  roleGroup.role = !parent ? 'Team owner' : 'Teammate';

  const roleGroupsNames = {
    editCustomFieldsSchema: 'manageСustomFieldsSchema',
    manageArchive: 'manageArchive',
    manageAssetRestrictSettings: 'manageRestrictedAssets',
    manageBilling: 'manageBilling',
    manageInboxes: 'manageInboxes',
    manageIntegrations: 'manageIntegrations',
    manageKeywords: 'manageKeywords',
    manageLightboards: 'manageLightboards',
    manageStorage: 'manageStorage',
    manageTeam: 'manageTeam',
    manageTeamSavedSearches: 'manageSavedSearches',
    sync: 'manageSync',
  };

  roleGroup = Object.keys(permissions).reduce((acc, key) => {
    if (roleGroupsNames[key]) {
      roleGroup[roleGroupsNames[key]] = permissions[key];
    }
    return acc;
  }, roleGroup);

  const { picsioStorage, trialEnds } = team;
  let { storageType } = team;
  if (picsioStorage) {
    storageType = 'PicsioStorage';
  }

  const {
    assetsCount,
    autosyncInterval,
    collectionsCount,
    keywordsCount,
    teammatesCount,
    websitesCount,
    planName,
    planId,
  } = subscriptionFeatures;

  const userProperties = {
    trialEnds,
    team: team.email,
    teamName,
    roleName,
    storageType,
    assetsCount,
    collectionsCount,
    keywordsCount,
    teammatesCount,
    websitesCount,
    autosyncInterval,
    planName: planId || planName,
    ...roleGroup,
    ...utmTracking,
  };

  if (personalTwoFactorEnabled !== undefined) {
    userProperties.personalTwoFactorEnabled = personalTwoFactorEnabled;
  }
  if (twoFactorConfigured !== undefined) {
    userProperties.twoFactorConfigured = twoFactorConfigured;
  }
  if (twoFactorEnabled !== undefined) {
    userProperties.twoFactorEnabled = twoFactorEnabled;
  }
  if (twoFactorMode !== undefined) {
    userProperties.twoFactorMode = twoFactorMode;
  }

  Logger.setUserProperties(userProperties);
};

export const getStorageType = (user) => {
  const isUserOnS3 = () => user.team?.storageType === 's3';
  const isUserOnPicsio = () => user.team?.picsioStorage;
  if (isUserOnS3()) {
    if (isUserOnPicsio()) {
      return { storageType: 'picsio' };
    }
    return { storageType: 's3' };
  }
  return { storageType: 'gd' };
};

export const changeFavicon = (url) => {
  const willDeleteLink = document.querySelectorAll("link[rel='apple-touch-icon'], link[rel='icon'], link[rel='mask-icon'], link[rel='manifest']");
  willDeleteLink.forEach((link) => {
    if (link.href.includes('favicon')) {
      link.remove();
    }
  });
  let link = document.querySelector("link[rel='shortcut icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = url;
};
