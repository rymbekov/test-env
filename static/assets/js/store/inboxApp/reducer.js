/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit';
import { LocalStorage } from '../../shared/utils';

import { reducer as changeVisibility, VISIBILITY_SETTING_NAME } from './changeVisibility';
import { reducer as changeField } from './changeField';
import { reducer as changeCustomField } from './changeCustomField';
import { reducer as validateFields } from './validateFields';

const DEFAULT_VISIBILITY_STATE = {
  inboxCommentVisibility: true,
  inboxDescriptionVisibility: true,
  inboxAssetMarksVisibility: true,
  inboxCustomFieldsVisibility: true,
};

const initialState = {
  ...(window.inbox?.fields || {}),
  ...DEFAULT_VISIBILITY_STATE,
  ...(LocalStorage.get(VISIBILITY_SETTING_NAME) || {}),
  user: {
    _id: 'Inbox Guest', // just for save resized customFields <CustomField /> component
  },
  hasErrors: false,
};

const inboxAppReducer = createReducer(
  initialState,
  (builder) => {
    changeVisibility(builder);
    changeField(builder);
    changeCustomField(builder);
    validateFields(builder);
  },
);

export default inboxAppReducer;
