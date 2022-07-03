/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';
import localization from '../../shared/strings';

export const createdEvent = createAsyncThunk(
  'inboxes/event/created',
  async (_id, { extra: { sdk, Logger } }) => {
    try {
      const { data: inbox } = await sdk.inboxes.getOne(_id);
      return inbox;
    } catch (error) {
      Logger.error(
        new Error('Can not get newly created inbox (by teammate)'),
        { error },
        ['GetNewlyCreatedInboxFailed', error.message],
      );
      throw error;
    }
  },
);

export const reducer = (builder) => {
  builder.addCase(
    createdEvent.fulfilled,
    (state, { payload: newInbox }) => {
      newInbox.addedByTeammate = true;
      Object.keys(newInbox.fields).forEach((key) => {
        /** Set titles to default fields */
        if (!Array.isArray(newInbox.fields[key])) {
          newInbox.fields[key].title = localization.INBOXSETTINGS.DEFAULT_FIELDS[key];
        }
      });
      state.inboxes.push(newInbox);
    },
  );
};
