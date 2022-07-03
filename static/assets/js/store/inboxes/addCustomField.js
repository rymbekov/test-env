/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const addCustomField = createAsyncThunk(
  'inbox/addCustomField',
  async ({ inboxId, customField }, {
    extra: {
      sdk, Toast, Logger, localization,
    },
  }) => {
    const { _id, type, title } = customField;
    try {
      await sdk.inboxes.addCustomField(inboxId, { _id, type, title });
      return true;
    } catch (error) {
      Logger.error(new Error('Can not add custom field to inbox'), { error }, [
        'AddCustomFieldToInboxFailed',
        error.message,
      ]);
      Toast(localization.INBOXSETTINGS.ERRORS.cantAddCustomField);
      throw error;
    }
  },
);

export const reducer = (builder) => {
  builder
    .addCase(
      addCustomField.pending,
      (state, action) => {
        const { customField, inboxId } = action.meta.arg;
        const { _id, type, title } = customField;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === inboxId) {
            inbox.fields.customFields.push({
              _id,
              title,
              type,
              show: false,
              required: false,
            });
          }
        });
      },
    ).addCase(
      addCustomField.rejected,
      (state, { meta }) => {
        const { inboxId } = meta.arg;
        const { title } = meta.arg.customField;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === inboxId) {
            /** remove failed custom field */
            inbox.fields.customFields = inbox.fields.customFields.filter((f) => f.title !== title);
          }
        });
      },
    );
};
