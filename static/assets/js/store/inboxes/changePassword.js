/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changePassword = createAsyncThunk(
  'inboxes/changePassword',
  async ({ id, password }, {
    extra: {
      sdk, Logger, utils, showErrorDialog,
    },
  }) => {
    try {
      Logger.log('User', 'InboxSettingsChangePassword', id);
      await sdk.inboxes.changePassword(id, password);
    } catch (error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg') || 'Can not change inbox password';
      Logger.log('UI', 'InboxSettingsChangeErrorDialog');
      showErrorDialog(errorMessage);
      Logger.error(new Error('Error changing inbox settings'), { error }, [
        'ChangeInboxSettingsFailed',
        errorMessage || 'NoMessage',
      ]);
    }
  },

);

export const reducer = (builder) => {
  builder
    .addCase(
      changePassword.pending,
      (state, action) => {
        const { id, password } = action.meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === id) {
            inbox.isBusy = true;
            inbox.isPasswordChanging = true;
            inbox.password = password;
          }
        });
      },
    )
    .addCase(
      changePassword.fulfilled,
      (state, action) => {
        const { id, password } = action.meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === id) {
            inbox.isBusy = false;
            inbox.isPasswordChanging = false;
            inbox.password = password;
          }
        });
      },
    )
    .addCase(
      changePassword.rejected,
      (state, action) => {
        const { id } = action.meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === id) {
            inbox.isBusy = false;
            inbox.isPasswordChanging = false;
          }
        });
      },
    );
};
