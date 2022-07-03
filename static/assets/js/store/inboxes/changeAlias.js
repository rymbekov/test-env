/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeAlias = createAsyncThunk(
  'inboxes/changeAlias',
  async ({ _id, alias }, {
    extra: {
      sdk, Logger, utils, showErrorDialog, localization,
    },
  }) => {
    try {
      Logger.log('User', 'InboxSettingsChangeAlias', _id);
      const { data } = await sdk.inboxes.changeAlias(_id, alias);
      return data;
    } catch (error) {
      const { cantChangeAlias } = localization.INBOXSETTINGS.ERRORS;
      const message = utils.getDataFromResponceError(error, 'msg') || cantChangeAlias;
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
  let tmpAlias = '';
  builder
    .addCase(
      changeAlias.pending,
      (state, { meta }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === meta.arg._id) {
            tmpAlias = inbox.alias;
            inbox.isBusy = true;
            inbox.isAliasChanging = true;
            inbox.alias = meta.arg.alias;
          }
        });
      },
    )
    .addCase(
      changeAlias.fulfilled,
      (state, { payload }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === payload._id) {
            delete inbox.isBusy;
            delete inbox.isAliasChanging;
            inbox.alias = payload.alias;
          }
        });
        state.error = null;
        tmpAlias = '';
      },
    )
    .addCase(
      changeAlias.rejected,
      (state, { error, meta }) => {
        state.inboxes.forEach((inbox) => {
          if (inbox._id === meta.arg._id) {
            delete inbox.isBusy;
            delete inbox.isAliasChanging;
            inbox.alias = tmpAlias;
          }
        });
        state.error = error;
        tmpAlias = '';
      },
    );
};
