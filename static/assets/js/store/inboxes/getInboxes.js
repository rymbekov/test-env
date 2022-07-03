/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';

const CUSTOM_ID = 'getInboxesFailed';

export const getInboxes = createAsyncThunk(
  'inboxes/getInboxes',
  // eslint-disable-next-line consistent-return
  async (_, {
    extra: {
      Logger, Toast, sdk, localization,
    },
  }) => {
    try {
      const { data: inboxes } = await sdk.inboxes.getAll();
      return {
        inboxes, localization,
      };
    } catch (error) {
      Logger.log('UI', 'ToastInboxesNotLoaded');
      Toast(
        localization.INBOXSETTINGS.ERRORS.cantGetInboxes,
        { toastId: CUSTOM_ID, autoClose: false },
      );
      Logger.error(new Error('Error inboxes fetching'), { error }, [
        'FetchInboxesFailed',
        'Inboxes can not be fetched from backend.',
      ]);
      throw error;
    }
  },
);

export const reducer = (builder) => {
  builder
    .addCase(
      getInboxes.pending,
      (state) => {
        state.isLoaded = false;
        state.isLoading = true;
        state.error = null;
      },
    ).addCase(
      getInboxes.fulfilled,
      (state, { payload: { inboxes, localization } }) => {
        state.inboxes = inboxes.map((inbox) => {
          Object.keys(inbox.fields || []).forEach((key) => {
            /** Set titles to default fields */
            if (!Array.isArray(inbox.fields[key])) {
              inbox.fields[key].title = localization.INBOXSETTINGS.DEFAULT_FIELDS[key];
            }
          });

          return inbox;
        });
        state.isLoaded = true;
        state.isLoading = false;
        state.error = null;
      },
    ).addCase(
      getInboxes.rejected,
      (state, { error }) => {
        state.inboxes = [];
        state.isLoaded = false;
        state.isLoading = false;
        state.error = error;
      },
    );
};
