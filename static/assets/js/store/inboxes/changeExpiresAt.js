/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeExpiresAt = createAsyncThunk(
  'inboxes/changeExpiresAt',
  async ({ _id, expiresAt }, {
    extra: {
      Logger, utils, sdk, showErrorDialog,
    },
  }) => {
    try {
      Logger.log('User', 'InboxSettingsChangeExpiresAt', _id);
      await sdk.inboxes.changeExpiresAt(_id, expiresAt);
    } catch (error) {
      const message = utils.getDataFromResponceError(error, 'msg') || 'Can not change inbox expiresAt value';
      showErrorDialog(message);
      Logger.error(new Error('Error changing inbox settings'), { error }, [
        'ChangeInboxSettingsFailed',
        message || 'NoMessage',
      ]);
      throw error;
    }
  },
);

export const reducer = (builder) => {
  let tmpExpiresAt = null;

  builder
    .addCase(
      changeExpiresAt.pending,
      (state, { meta }) => {
        const { _id, expiresAt } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            tmpExpiresAt = inbox.expiresAt;

            inbox.isBusy = true;
            inbox.isExpiresAtChanging = true;
            inbox.expiresAt = expiresAt;
          }
        });
      },
    )
    .addCase(
      changeExpiresAt.fulfilled,
      (state, { meta }) => {
        const { _id } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            delete inbox.isBusy;
            delete inbox.isExpiresAtChanging;
          }
        });
        state.error = null;
        tmpExpiresAt = null;
      },
    )
    .addCase(
      changeExpiresAt.rejected,
      (state, { error, meta }) => {
        const { _id } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            delete inbox.isBusy;
            delete inbox.isExpiresAtChanging;
            inbox.expiresAt = tmpExpiresAt;
          }
        });
        state.error = error;
        tmpExpiresAt = null;
      },
    );
};
