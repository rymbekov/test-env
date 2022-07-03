/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';
import localization from '../../shared/strings';

export const create = createAsyncThunk(
  'inboxes/create',
  async (name, {
    extra: {
      sdk, utils, Logger, showErrorDialog,
    },
  }) => {
    try {
      const { data } = await sdk.inboxes.create(name);
      return data;
    } catch (error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg') || 'Can not create inbox';
      showErrorDialog(errorMessage);
      Logger.error(new Error('Error inbox creating'), { error }, [
        'CreateInboxFailed',
        errorMessage || 'NoMessage',
      ]);
      throw error;
    }
  },
);

export const reducer = (builder) => {
  builder
    .addCase(
      create.pending,
      (state, { meta }) => {
        state.nameCreatingInbox = meta.arg;
      },
    )
    .addCase(
      create.fulfilled,
      (state, { payload }) => {
        Object.keys(payload.fields).forEach((key) => {
          /** Set titles to default fields */
          if (!Array.isArray(payload.fields[key])) {
            payload.fields[key].title = localization.INBOXSETTINGS.DEFAULT_FIELDS[key];
          }
        });
        state.inboxes.push(payload);
        state.nameCreatingInbox = null;
        state.error = null;
      },
    )
    .addCase(
      create.rejected,
      (state, { error }) => {
        state.nameCreatingInbox = null;
        state.error = error;
      },
    );
};
