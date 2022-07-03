/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';
import { LocalStorage } from '../../shared/utils';

export const VISIBILITY_SETTING_NAME = 'picsio.inboxPanelVisibility';

export const changeVisibility = createAction('inbox/changeVisibility', (name, value) => {
  const settings = LocalStorage.get(VISIBILITY_SETTING_NAME) || {};
  settings[name] = value;
  LocalStorage.set(VISIBILITY_SETTING_NAME, settings);

  return {
    payload: { name, value },
  };
});

export const reducer = (builder) => {
  builder.addCase(
    changeVisibility.type,
    (state, { payload: { name, value } }) => {
      state[name] = value;
    },
  );
};
