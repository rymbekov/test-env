/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { navigateToRoot } from '../../helpers/history';

export const remove = createAsyncThunk(
  'inboxes/remove',
  async (id, {
    getState, extra: {
      sdk, Logger, utils, showErrorDialog,
    },
  }) => {
    try {
      await sdk.inboxes.remove(id);
      /** if we currently on the deleted inbox -> go to root collection */
      const { query } = getState().router.location;
      if (query.inboxId === id) navigateToRoot();

      return id;
    } catch (error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg') || 'Can not remove inbox';
      showErrorDialog(errorMessage);
      Logger.error(
        new Error('Error inbox removing'),
        { error },
        ['RemoveInboxFailed', errorMessage || 'NoMessage'],
      );
      throw error;
    }
  },
);

export const reducer = (builder) => {
  builder
    .addCase(
      remove.pending,
      (state, { meta }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === meta.arg) {
            inbox.isBusy = true;
          }
        });
      },
    )
    .addCase(
      remove.fulfilled,
      (state, { payload }) => {
        state.inboxes = state.inboxes.filter(({ _id }) => _id !== payload);
        state.error = null;
      },
    )
    .addCase(
      remove.rejected,
      (state, { meta, error }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === meta.arg) delete inbox.isBusy;
        });
        state.error = error;
      },
    );
};
