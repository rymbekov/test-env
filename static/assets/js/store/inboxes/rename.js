/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const rename = createAsyncThunk(
  'inboxes/rename',
  async ({ id, name }, {
    extra: {
      sdk, Logger, showErrorDialog, utils,
    },
  }) => {
    try {
      const { data } = await sdk.inboxes.rename(id, name);
      return data;
    } catch (error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg') || 'Can not rename inbox';
      showErrorDialog(errorMessage);
      Logger.error(
        new Error('Error inbox renaming'),
        { error },
        ['RenameInboxFailed', errorMessage || 'NoMessage'],
      );
      throw error;
    }
  },
);

export const reducer = (builder) => {
  builder
    .addCase(
      rename.pending,
      (state, { meta }) => {
        const { id } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === id) inbox.isBusy = true;
        });
      },
    )
    .addCase(
      rename.fulfilled,
      (state, { payload }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === payload._id) {
            inbox.name = payload.name;
            delete inbox.isBusy;
          }
        });
      },
    )
    .addCase(
      rename.rejected,
      (state, { meta, error }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === meta.arg.id) {
            delete inbox.isBusy;
          }
        });
        state.error = error;
      },
    );
};
