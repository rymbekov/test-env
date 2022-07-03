/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeCustomField = createAsyncThunk(
  'inboxes/changeCustomField',
  async ({
    inboxId, fieldTitle, propName, value,
  }, {
    extra: {
      sdk, utils, showErrorDialog, Logger,
    },
  }) => {
    try {
      await sdk.inboxes.changeCustomField({
        inboxId, fieldTitle, propName, value,
      });
    } catch (error) {
      const message = utils.getDataFromResponceError(error, 'msg') || 'Can not change inbox customFields settings';
      showErrorDialog(message);
      Logger.error(new Error('Error changing inbox customFields settings'), { error }, [
        'ChangeInboxSettingsFailed',
        message || 'NoMessage',
      ]);
      throw error;
    }
  },
);

export const reducer = (builder) => {
  let oldField = null; // for restoring if rejected

  builder
    .addCase(
      changeCustomField.pending,
      (state, { meta }) => {
        const {
          inboxId, fieldTitle, propName, value,
        } = meta.arg;

        state.inboxes.forEach((inbox) => {
          if (inbox._id === inboxId) {
            inbox.fields.customFields.forEach((cf) => {
              if (cf.title === fieldTitle) {
                oldField = { ...cf };
                cf[propName] = value;
                if (propName === 'show' && !value) cf.required = value;
              }
            });
          }
        });
      },
    )
    .addCase(
      changeCustomField.fulfilled,
      () => {
        oldField = null;
      },
    )
    .addCase(
      changeCustomField.rejected,
      (state, { meta }) => {
        const { inboxId, fieldTitle } = meta.arg;

        state.inboxes.forEach((inbox) => {
          if (inbox._id === inboxId) {
            inbox.fields.customFields.forEach((cf) => {
              if (cf.title === fieldTitle) {
                cf.show = oldField.show;
                cf.required = oldField.required;
                oldField = null;
              }
            });
          }
        });
      },
    );
};
