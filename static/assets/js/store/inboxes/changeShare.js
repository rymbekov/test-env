/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeShare = createAsyncThunk(
  'inboxes/changeShare',
  async (
    { _id, isShared },
    {
      extra: {
        sdk, Logger, showErrorDialog, utils,
      },
    },
  ) => {
    try {
      Logger.log('User', 'InboxSettingsChangeShare', _id);
      await sdk.inboxes.changeShare(_id, isShared);
    } catch (error) {
      const message = utils.getDataFromResponceError(error, 'msg') || 'Can not change inbox share status';
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
  let tmpIsShared;

  builder
    .addCase(
      changeShare.pending,
      (state, { meta }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === meta.arg._id) {
            tmpIsShared = inbox.isShared;

            inbox.isBusy = true;
            inbox.isShareChanging = true;
            inbox.isShared = meta.arg.isShared;
          }
        });
      },
    )
    .addCase(
      changeShare.fulfilled,
      (state, { meta }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === meta.arg._id) {
            delete inbox.isBusy;
            delete inbox.isShareChanging;
          }
        });
        tmpIsShared = undefined;
      },
    )
    .addCase(
      changeShare.rejected,
      (state, { meta, error }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === meta.arg._id) {
            delete inbox.isBusy;
            delete inbox.isShareChanging;
            inbox.isShared = tmpIsShared;
          }
        });
        state.error = error;
        tmpIsShared = undefined;
      },
    );
};
