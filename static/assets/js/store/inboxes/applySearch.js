/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';

export const applySearch = createAction('inboxes/applySearch');

export const reducer = (builder) => {
  builder.addCase(
    applySearch.type,
    (state, { payload: value }) => {
      if (!value) {
        state.filtredInboxes = null;
        return;
      }
      state.filtredInboxes = state.inboxes.filter(
        ({ name }) => name.toLowerCase().includes(value.toLowerCase()),
      );
    },
  );
};
