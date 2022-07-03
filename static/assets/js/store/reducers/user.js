import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import _set from 'lodash/set';
import _unset from 'lodash/unset';

import sdk from '../../sdk';

import TYPES from '../action-types';
import {
  subscribe,
  changeCard,
  buyCredits,
  redeemCoupon,
  buyKeywords,
} from '../actions/billing';
import { addLiveChatIconSeen } from '../actions/user';

/* eslint-disable no-param-reassign */
const updateUserPolicy = (state, key, value) => {
  const method = value ? _set : _unset;

  method(state.team.policies, key, value);
};

export const updateUserCustomerTax = createAsyncThunk(
  'user/updateUserCustomerTax',
  async (payload) => {
    const { data } = await sdk.users.updateCustomerTax(payload);
    return data;
  },
);

/* eslint-disable  no-param-reassign */
const userSortTypeUpdate = (state, action) => {
  const {
    payload: { collectionType, sortType, prevSortType = null },
  } = action;
  const stateField = state[`${collectionType}SortType`];
  const currentSort = prevSortType || sortType;

  if (!stateField) {
    state[`${collectionType}SortType`] = currentSort;
  } else {
    stateField.type = currentSort.type;
    stateField.order = currentSort.order;
  }
};

const getUserUpdate = (state, result) => {
  Object.keys(result).forEach((key) => {
    state[key] = result[key];
  });
  state.loading = false;
  state.error = null;
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    authorizedUsers: [],
    isPushNotificationsAvailable: null,
    isPushNotificationsGranted: null,
    achievements: {
      liveChatIconSeen: false,
    },
    picsioStorage: false,
  },
  reducers: {
    // Get current user
    getUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    getUserSuccess(state, action) {
      const { user } = action.payload;

      getUserUpdate(state, user);
    },
    getUserFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    setAuthorizedUsers: (state, action) => {
      state.authorizedUsers = action.payload;
    },

    updateTeamValue(state, action) {
      const { key, value } = action.payload;
      state.team[key] = value;
    },

    updateUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess(state, action) {
      const { result } = action.payload;

      getUserUpdate(state, result);
    },
    updateUserFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    savePolicyStart(state) {
      state.loading = true;
      state.error = null;
    },
    savePolicySuccess(state, action) {
      const {
        result: { key, value },
      } = action.payload;

      updateUserPolicy(state, key, value);

      state.loading = false;
      state.error = null;
    },
    savePolicyFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    toggleSupportConsent(state, { payload }) {
      state.settings.supportConsentExpiresAt = payload;
    },
    updateUserSortTypeStart: userSortTypeUpdate,
    updateUserSortTypeSuccess: userSortTypeUpdate,
    updateUserSortTypeFailure: userSortTypeUpdate,
  },
  extraReducers: {
    [TYPES.COLLECTIONS.SET_WEBSITE](state, { payload }) {
      if (payload.value) {
        state.subscriptionFeatures.websitesCount += 1;
      } else {
        state.subscriptionFeatures.websitesCount -= 1;
      }
    },
    [TYPES.CUSTOM_FIELDS.REMOVE.COMPLETE](state, { payload }) {
      const { title, required } = payload;

      if (required) {
        updateUserPolicy(state, `customFieldsRequired.${title}`, false);
      }
    },
    [subscribe.fulfilled](state, { payload }) {
      state.customer.subscription = payload.subscription;
      if (payload.subscriptionFeatures) {
        state.subscriptionFeatures = payload.subscriptionFeatures;
      }
    },
    [changeCard.fulfilled](state, { payload }) {
      state.customer = payload;
    },
    [buyCredits.fulfilled](state, { payload }) {
      state.customer.balance = payload;
    },
    [redeemCoupon.fulfilled](state, { payload }) {
      state.customer = {
        ...state.customer,
        ...payload,
      };
    },
    [updateUserCustomerTax.fulfilled](state, { payload }) {
      const { customer } = state;

      state.customer = {
        ...customer,
        tax: payload,
      };
    },
    [buyKeywords.fulfilled](state, { payload }) {
      state.team.assetsKeywordedPaid = payload.assetsKeywordedPaid;
    },
    [addLiveChatIconSeen.fulfilled](state) {
      state.achievements.liveChatIconSeen = true;
    },
    [addLiveChatIconSeen.rejected](state) {
      state.achievements.liveChatIconSeen = true;
    },
  },
});
/* eslint-enable no-param-reassign */

// Extract the action creators object and the reducer
const { actions, reducer } = userSlice;

export const {
  setAuthorizedUsers,
  updateTeamValue,
  getUserStart,
  getUserSuccess,
  getUserFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  savePolicyStart,
  savePolicySuccess,
  savePolicyFailure,
  toggleSupportConsent,
  updateUserSortTypeStart,
  updateUserSortTypeSuccess,
  updateUserSortTypeFailure,
} = actions;

export default reducer;
