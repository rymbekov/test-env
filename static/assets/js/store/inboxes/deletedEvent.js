/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';

export const deletedEvent = createAction('inboxes/event/deleted');

export const reducer = (builder) => {
  builder.addCase(
    deletedEvent.type,
    (state, { payload }) => {
      const { _id, deletedByTeammate } = payload;
      state.inboxes.forEach((inbox) => {
        if (inbox._id === _id) {
          inbox.deletedByTeammate = deletedByTeammate;
        }
      });
    },
  );
};
