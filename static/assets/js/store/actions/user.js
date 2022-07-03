import { createAsyncThunk } from '@reduxjs/toolkit';
import _get from 'lodash/get';

import store from '../index';
import picsioConfig from '../../../../../config';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import UiBlocker from '../../services/UiBlocker';
import * as utils from '../../shared/utils';
import * as userActions from '../reducers/user';
import Toast from '../../components/Toast';
import {
  checkIsKeywordsActionsAllowed,
  checkIsSyncAllowed,
  initAmplitude,
  getUserStorageName,
} from '../helpers/user';
import { normalizeUserAvatarSrc } from '../helpers/teammates';
import { showUploadFileErrorDialog } from '../../helpers/fileUploader';
import sdk from '../../sdk';

import * as collectionsActions from './collections';
import * as keywordsActions from './keywords';
import * as searchesActions from './savedSearches';
import * as lightboardsActions from './lightboards';
import * as inboxesActions from '../inboxes/actions';
import { showDialog } from '../../components/dialog';
import * as api from '../../api';

const getStoreUser = () => store.getState().user;

export const { updateUserCustomerTax } = userActions;

export const getUser = () => async (dispatch) => {
  try {
    dispatch(userActions.getUserStart());
    const { data: response } = await sdk.users.current();
    if (response && response.user) {
      if (response.authenticatedUsers) {
        const {
          _id,
          email,
          avatar,
          displayName,
          role,
          parent,
          team,
        } = response.user;

        Logger.setUser({ email: response.user.email, displayName: response.user.displayName });

        const currentUser = {
          _id,
          email,
          displayName,
          avatar: normalizeUserAvatarSrc(avatar, 'medium'),
          roleName: !parent ? 'Team owner' : role.name,
          current: true,
        };
        if (team) {
          currentUser.teamName = (team.policies && team.policies.teamName) || team.displayName;
          currentUser.teamLogo = team.logoUrl;
        }

        dispatch(
          userActions.setAuthorizedUsers([{ ...currentUser }, ...response.authenticatedUsers]),
        );
      }

      if ('serviceWorker' in navigator && response.user.apiKey) {
        /** set apiKey to sw */
        (async function () {
          const reg = await navigator.serviceWorker.ready;
          reg.active.postMessage({ apiKey: response.user.apiKey });
        }());
      }

      const { user } = response;

      if (user.avatar) {
        user.avatarOriginal = user.avatar;
        user.avatar = normalizeUserAvatarSrc(user.avatar, 'large', true);
      }
      if (!user.settings) user.settings = {};
      if (!user.team.policies) user.team.policies = {};
      if (!user.team.policies.teamName) user.team.policies.teamName = 'My team';
      user.isTeammate = !!(user.parent && user.parent.confirmed === true);
      user.isSyncAllowed = checkIsSyncAllowed(user.role, user);
      user.isKeywordsActionsAllowed = checkIsKeywordsActionsAllowed(
        user.role.permissions,
        user.team.policies,
      );
      user.ignoreLockMetadataFields = user.team?.settings?.metadater?.ignoreLockMetadataFields || false;
      user.liveChatIconSeen = user.achievements?.liveChatIconSeen || false;

      if (user.isTeammate) {
        user.picsioStorage = user.team.picsioStorage;
      }

      initAmplitude(user);
      user.storageName = getUserStorageName(user.team);

      dispatch(userActions.getUserSuccess({ user }));
    }
  } catch (err) {
    Logger.setUser({ email: 'undefined email', displayName: 'undefined pics.io user' });
    console.error('User can not be fetched from backend.');
    dispatch(userActions.getUserFailure(err));
    throw err;
  }
};

export const updateTeamValue = (key, value) => (dispatch) => {
  dispatch(userActions.updateTeamValue({ key, value }));
};

export const setAuthorizedUsers = (data) => (dispatch) => {
  dispatch(userActions.setAuthorizedUsers(data));
};

export const updateUser = (data, setImmediately = true) => async (dispatch) => {
  if (setImmediately) {
    const result = { ...data };
    const { role } = data;
    if (role) {
      result.isSyncAllowed = checkIsSyncAllowed(role);
      result.isKeywordsActionsAllowed = checkIsKeywordsActionsAllowed(
        role.permissions,
        getStoreUser().team.policies,
      );
    }

    dispatch(userActions.updateUserSuccess({ result }));
    return;
  }
  try {
    dispatch(userActions.updateUserStart({ updating: true }));
    const { data: response } = await sdk.users.update(data);
    if (response) {
      dispatch(userActions.updateUserSuccess({ result: data }));
    } else {
      dispatch(userActions.updateUserFailure());
    }
  } catch (err) {
    Logger.error(new Error('Can not update user'), { error: err, data }, [
      'UpdateUserFailed',
      (err && err.message) || 'NoMessage',
    ]);
    dispatch(userActions.updateUserFailure());
  }
};

export const uploadAvatar = (file) => async (dispatch) => {
  if (typeof file !== 'object') return;
  try {
    dispatch(userActions.updateUserStart({ updating: true }));
    const { promise } = sdk.users.uploadAvatar(file);
    const { data } = await promise;
    const { url } = data;
    dispatch(userActions.updateUserSuccess({ result: { avatar: url } }));
    const customEvent = new CustomEvent('userAvatarSet', { detail: url });
    window.dispatchEvent(customEvent);
  } catch (err) {
    showUploadFileErrorDialog(err);
    Logger.error(new Error('Can not upload user avatar'), { error: err, fileName: file.name }, [
      'UpdateUserFailed',
      (err && err.message) || 'Can not upload avatar',
    ]);
    dispatch(userActions.updateUserFailure());
  }
};

export const deleteAvatar = () => async (dispatch) => {
  try {
    dispatch(userActions.updateUserStart({ updating: true }));
    await sdk.users.deleteAvatar();
    dispatch(userActions.updateUserSuccess({ result: { avatar: null } }));
    const customEvent = new CustomEvent('userAvatarSet', { detail: null });
    window.dispatchEvent(customEvent);
  } catch (err) {
    Logger.error(new Error('Can not delete user avatar'), { error: err }, [
      'UpdateUserFailed',
      (err && err.message) || 'Can not delete avatar',
    ]);
    dispatch(userActions.updateUserFailure());
  }
};

export const savePolicy = (data, setImmediately = true) => async (dispatch) => {
  if (setImmediately) {
    dispatch(userActions.savePolicySuccess({ result: data }));
    return;
  }
  try {
    const { policies } = getStoreUser().team;
    const { key } = data;
    const prevValue = _get(policies, key, false);
    const prevData = {
      key,
      value: prevValue,
    };

    dispatch(userActions.savePolicyStart({ updating: true }));
    dispatch(userActions.savePolicySuccess({ result: data }));

    const { data: response } = await sdk.users.savePolicy(data);

    if (!response) {
      dispatch(userActions.savePolicySuccess({ result: prevData }));
      dispatch(userActions.savePolicyFailure());
    }
  } catch (err) {
    const connection = utils.getNavigatorConnectionInfo();
    Logger.error(new Error('Can not update user'), { error: err, data }, [
      'savePolicyFailed',
      { errorMessage: (err && err.message) || 'NoMessage', connection },
    ]);
    dispatch(userActions.savePolicyFailure());
  }
};

/**
 * For logged user sends restore password email.
 * @param success - [description]
 * @param failed - [description]
 */
export const requestResetPassword = (email) => async () => {
  // "plus" sign needs to decode, because it has a semantic meaning in query string
  // https://stackoverflow.com/a/6855723/10263359
  const decodedEmail = email.replace('+', '%2B');
  const url = `${picsioConfig.getApiBaseUrl()}/requestResetEmail?email=${decodedEmail}`;
  // open support in new blank window
  window.open(url);
  Logger.log('User', 'ResetPassword', email);
};

export const updateCustomerAddress = (address) => async (dispatch) => {
  try {
    const { data: result } = await sdk.users.updateCustomerAddress(address);
    dispatch(
      userActions.updateUserSuccess({
        result: { customer: { ...getStoreUser().customer, address } },
      }),
    );
    return result;
  } catch (error) {
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    return { error: errorMessage };
  }
};

export const updateCustomerFooter = (footer) => async (dispatch) => {
  try {
    const { data: result } = await sdk.users.updateCustomerFooter(footer);
    dispatch(
      userActions.updateUserSuccess({
        result: {
          customer: {
            ...getStoreUser().customer,
            invoice_settings: { ...getStoreUser().customer.invoice_settings, footer },
          },
        },
      }),
    );

    return result;
  } catch (error) {
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    return { error: errorMessage };
  }
};

export const updateCustomerName = (name) => async (dispatch) => {
  try {
    const { data: result } = await sdk.users.updateCustomerName(name);
    dispatch(
      userActions.updateUserSuccess({ result: { customer: { ...getStoreUser().customer, name } } }),
    );

    return result;
  } catch (error) {
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    return { error: errorMessage };
  }
};

export const updateCustomerEmail = (email) => async (dispatch) => {
  try {
    const { data: result } = await sdk.users.updateCustomerEmail(email);
    dispatch(
      userActions.updateUserSuccess({ result: { customer: { ...getStoreUser().customer, email } } }),
    );

    return result;
  } catch (error) {
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    return { error: errorMessage };
  }
};

export const updateSupportConsent = () => async (dispatch) => {
  try {
    const { data } = await sdk.users.toggleSupportConsent();
    const { supportConsentExpiresAt } = data;

    dispatch(userActions.toggleSupportConsent(supportConsentExpiresAt));

    return supportConsentExpiresAt;
  } catch (error) {
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    return { error: errorMessage };
  }
};

export const toggleAdBlockWarning = createAsyncThunk(
  'user/toggleAdBlockWarning',
  async (detected) => {
    const { data } = await sdk.users.toggleAdBlockWarning(detected);
    return data;
  },
);

export const setNewPassword = (data) => async (dispatch) => {
  try {
    UiBlocker.block();
    const res = await sdk.users.setNewPassword(data);
    if (res?.data?.success) {
      Toast(localization.SET_NEW_PASSWORD.success);
      dispatch(userActions.updateUserSuccess());
    } else {
      Toast(localization.SET_NEW_PASSWORD.fail);
    }
  } catch (error) {
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    const errorStatus = utils.getStatusFromResponceError(error);
    if (errorStatus === 400) {
      dispatch(userActions.updateUserFailure(errorMessage));
    }
    return { error: errorMessage };
  } finally {
    UiBlocker.unblock();
  }
};

export const setUserErrorToNull = () => async (dispatch) => {
  dispatch(userActions.updateUserStart());
};

export const updateUserSortType = (payload) => async (dispatch, getState) => {
  const { collectionType, sortType } = payload;
  const prevSortType = getState().user[`${collectionType}SortType`];

  try {
    dispatch(userActions.updateUserSortTypeStart(payload));

    await sdk.users.updateUserSortType(collectionType, sortType);

    switch (collectionType) {
    case 'collections': {
      await dispatch(collectionsActions.getCollections());
      break;
    }
    case 'keywords': {
      keywordsActions.sort(sortType)(dispatch, getState);
      await keywordsActions.getKeywords()(dispatch, getState);
      break;
    }
    case 'searches': {
      await searchesActions.getSavedSearches()(dispatch, getState);
      break;
    }
    case 'lightboards': {
      await lightboardsActions.getLightboards()(dispatch, getState);
      break;
    }
    case 'inboxes': {
      await dispatch(inboxesActions.getInboxes());
      break;
    }
    default:
      break;
    }

    dispatch(userActions.updateUserSortTypeSuccess(payload));
  } catch (err) {
    dispatch(userActions.updateUserSortTypeFailure({ ...payload, prevSortType }));

    showDialog({
      title: localization.SOMETHING_WENT_WRONG.TITLE,
      text: localization.SOMETHING_WENT_WRONG.TEXT,
    });
    Logger.error(new Error('Update sort type'), { error: err }, [
      'UpdateUserSortTypeFailed',
      (err && err.message) || 'NoMessage',
    ]);
  }
};

export const addLiveChatIconSeen = createAsyncThunk(
  'user/addLiveChatIconSeen',
  (_, { getState }) => {
    const { liveChatIconSeen } = getState().user.achievements;
    if (!liveChatIconSeen) {
      return api.put('/users/setAchievement', {
        data: {
          achievement: 'liveChatIconSeen',
        },
      });
    }
    return null;
  },
);
