import { createAsyncThunk } from '@reduxjs/toolkit';

export const removeCustomField = createAsyncThunk(
  'inboxes/removeCustomField',
  async ({ inboxId, title }, {
    extra: {
      sdk, Toast, Logger, localization,
    },
  }) => {
    try {
      await sdk.inboxes.removeCustomField(inboxId, title);
      return true;
    } catch (error) {
      Logger.error(new Error('Can not remove custom field from inbox'), { error }, [
        'RemoveCustomFieldFromInboxFailed',
        error.message,
      ]);
      Toast(localization.INBOXSETTINGS.ERRORS.cantRemoveCustomField);
      throw error;
    }
  },
);

export const reducer = (builder) => {
  let tmpField = null;
  let tmpFieldIndex = -1;

  builder
    .addCase(
      removeCustomField.pending,
      (state, { meta }) => {
        const { inboxId, title } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === inboxId) {
            const index = inbox.fields.customFields.findIndex((cf) => cf.title === title);
            if (index > -1) {
              tmpFieldIndex = index;
              const res = inbox.fields.customFields.splice(index, 1);
              tmpField = { ...res[0] };
            }
          }
        });
      },
    )
    .addCase(
      removeCustomField.fulfilled,
      () => {
        /** no need to update store */
        tmpField = null;
        tmpFieldIndex = -1;
      },
    )
    .addCase(
      removeCustomField.rejected,
      (state, { meta }) => {
        const { inboxId } = meta.arg;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === inboxId) {
            if (tmpFieldIndex > -1 && tmpField) {
              inbox.fields.customFields.splice(tmpFieldIndex, 0, tmpField);
              tmpField = null;
              tmpFieldIndex = -1;
            }
          }
        });
      },
    );
};
