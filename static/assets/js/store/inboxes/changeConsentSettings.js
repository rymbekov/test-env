/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeConsentsSettings = createAsyncThunk(
  'inboxes/changeConsentsSettings',
  async ({ _id, param, value }, {
    extra: {
      sdk, Logger, utils, showErrorDialog,
    },
  }) => {
    try {
      Logger.log('User', 'InboxSettingsConsentsChange', _id);
      const { data } = await sdk.inboxes.changeConsents(_id, param, value);
      return data;
    } catch (error) {
      const message = utils.getDataFromResponceError(error, 'msg') || 'Can not change inbox consent settings';
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
  let tmpValue = null;

  builder
    .addCase(
      changeConsentsSettings.pending,
      (state, { meta }) => {
        const { _id, param, value } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            tmpValue = inbox[param];

            inbox.isBusy = true;
            inbox[`is${param}Changing`] = true;
            inbox[param] = value;
          }
        });
      },
    )
    .addCase(
      changeConsentsSettings.fulfilled,
      (state, { meta }) => {
        const { _id, param } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            delete inbox.isBusy;
            delete inbox[`is${param}Changing`];
          }
        });
        tmpValue = null;
        state.error = null;
      },
    )
    .addCase(
      changeConsentsSettings.rejected,
      (state, { error, meta }) => {
        const { _id, param } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            delete inbox.isBusy;
            delete inbox[`is${param}Changing`];
            inbox[param] = tmpValue;
          }
        });
        tmpValue = null;
        state.error = error;
      },
    );
};
