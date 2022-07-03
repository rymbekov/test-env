/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';

export const changedEvent = createAction('inboxes/event/changed');

export const reducer = (builder) => {
  builder.addCase(
    changedEvent.type,
    (state, { payload }) => {
      state.inboxes.forEach((inbox) => {
        if (inbox._id === payload._id) {
          Object.keys(payload).forEach((key) => {
            inbox[key] = payload[key];
          });
        }
      });
    },
  );
};
