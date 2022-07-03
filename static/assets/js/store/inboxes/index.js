/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit';
import TYPES from '../action-types';

import { reducer as getInboxes } from './getInboxes';
import { reducer as setActiveInbox } from './setActive';
import { reducer as addCustomField } from './addCustomField';
import { reducer as removeCustomField } from './removeCustomField';
import { reducer as changeField } from './changeField';
import { reducer as changeCustomField } from './changeCustomField';
import { reducer as changePassword } from './changePassword';
import { reducer as create } from './create';
import { reducer as createdEvent } from './createdEvent';
import { reducer as applySearch } from './applySearch';
import { reducer as rename } from './rename';
import { reducer as renamedEvent } from './renamedEvent';
import { reducer as deletedEvent } from './deletedEvent';
import { reducer as changedEvent } from './changedEvent';
import { reducer as remove } from './remove';
import { reducer as changeAlias } from './changeAlias';
import { reducer as changeShare } from './changeShare';
import { reducer as changeStartAt } from './changeStartAt';
import { reducer as changeExpiresAt } from './changeExpiresAt';
import { reducer as changeConsentSettings } from './changeConsentSettings';
import { reducer as setSortType } from './setSortType';

const initialState = {
  isLoaded: true,
  isLoading: false,
  inboxes: [],
  filtredInboxes: null,
  activeInboxID: null,
  activeInbox: null,
  searchQuery: '',
  nameCreatingInbox: null,
  error: null,
  sortType: null,
  sortTypeUpdating: false,
};

const inboxesReducer = createReducer(
  initialState,
  (builder) => {
    applySearch(builder);

    getInboxes(builder);

    create(builder);

    createdEvent(builder);

    setActiveInbox(builder);

    changePassword(builder);

    addCustomField(builder);

    removeCustomField(builder);

    rename(builder);

    renamedEvent(builder);

    deletedEvent(builder);

    changedEvent(builder);

    remove(builder);

    changeField(builder);

    changeCustomField(builder);

    changeAlias(builder);

    changeShare(builder);

    changeStartAt(builder);

    changeExpiresAt(builder);

    changeConsentSettings(builder);

    setSortType(builder);

    /** unset activeInboxID */
    builder.addMatcher((action) => (
      action.type === TYPES.SAVEDSEARCHES.SET_ACTIVE
      || action.type === 'archive/setActiveCollection'
      || action.type === 'collections/setActiveCollection'
      || action.type === 'lightboards/setActiveLightboard'
    ), (state, { payload }) => {
      const key = Object.keys(payload)[0];
      const value = payload[key];
      const isUnsetAllowed = Array.isArray(value) ? !!value.length : !!value;

      if (isUnsetAllowed) {
        state.activeInboxID = null;
      }
    });
  },
);

export default inboxesReducer;
