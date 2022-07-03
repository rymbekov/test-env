/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeField = createAsyncThunk(
  'inboxes/changeField',
  async ({
    inboxId, fieldName, propName, value,
  }, {
    extra: {
      sdk, Logger, utils, showErrorDialog,
    },
  }) => {
    try {
      await sdk.inboxes.changeField({
        inboxId, fieldName, propName, value,
      });
    } catch (error) {
      const message = utils.getDataFromResponceError(error, 'msg') || 'Can not change inbox fields settings';
      showErrorDialog(message);
      Logger.error(new Error('Error changing inbox fields settings'), { error }, [
        'ChangeInboxSettingsFailed',
        message || 'NoMessage',
      ]);
      throw error;
    }
  },
);

export const reducer = (builder) => {
  let oldField = null; // for restoring if rejected

  builder.addCase(
    changeField.pending,
    (state, { meta }) => {
      const {
        fieldName, inboxId, propName, value,
      } = meta.arg;

      state.inboxes.forEach((inbox) => {
        if (inbox._id === inboxId) {
          Object.keys(inbox.fields).forEach((key) => {
            const field = inbox.fields[key];
            if (Array.isArray(field)) return;
            if (key === fieldName) {
              oldField = { ...field };
              field[propName] = value;
              /** if field set to "not visible" -> field is not required */
              if (propName === 'show' && !value) field.required = value;
            }
          });
        }
      });
    },
  ).addCase(
    changeField.fulfilled,
    () => {
      /** just clear old field */
      oldField = null;
    },
  ).addCase(
    changeField.rejected,
    (state, { meta }) => {
      const { fieldName, inboxId } = meta.arg;

      state.inboxes.forEach((inbox) => {
        if (inbox._id === inboxId) {
          Object.keys(inbox.fields).forEach((key) => {
            const field = inbox.fields[key];
            if (Array.isArray(field)) return;
            if (key === fieldName) {
              field.show = oldField.show;
              field.required = oldField.required;
              oldField = null;
            }
          });
        }
      });
    },
  );
};
