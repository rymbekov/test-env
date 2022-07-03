/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';

export const setActive = createAction('inboxes/setActiveInbox');

export const reducer = (builder) => {
  builder.addCase(
    setActive.type,
    (state, { payload }) => {
      state.activeInboxID = payload;
    },
  );
};
