/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';

export const renamedEvent = createAction('inboxes/event/renamed');

export const reducer = (builder) => {
  builder.addCase(
    renamedEvent.type,
    (state, { payload }) => {
      state.inboxes.forEach((inbox) => {
        if (inbox._id === payload._id) {
          inbox.name = payload.name;
          inbox.addedByTeammate = payload.addedByTeammate;
        }
      });
    },
  );
};
