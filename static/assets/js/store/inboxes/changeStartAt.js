/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeStartAt = createAsyncThunk(
  'inboxes/changeStartAt',
  async ({ _id, startAt }, {
    extra: {
      Logger, sdk, utils, showErrorDialog,
    },
  }) => {
    try {
      await sdk.inboxes.changeStartAt(_id, startAt);
    } catch (error) {
      const message = utils.getDataFromResponceError(error, 'msg') || 'Can not change inbox startAt value';
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
  let tmpStartAt = null;

  builder
    .addCase(
      changeStartAt.pending,
      (state, { meta }) => {
        const { _id, startAt } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            tmpStartAt = inbox.startAt;

            inbox.isBusy = true;
            inbox.isStartAtChanging = true;
            inbox.startAt = startAt;
          }
        });
      },
    )
    .addCase(
      changeStartAt.fulfilled,
      (state, { meta }) => {
        const { _id } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            delete inbox.isBusy;
            delete inbox.isStartAtChanging;
          }
        });
        state.error = null;
        tmpStartAt = null;
      },
    )
    .addCase(
      changeStartAt.rejected,
      (state, { meta, error }) => {
        const { _id } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            delete inbox.isBusy;
            delete inbox.isStartAtChanging;
            inbox.startAt = tmpStartAt;
          }
        });
        state.error = error;
        tmpStartAt = null;
      },
    );
};
