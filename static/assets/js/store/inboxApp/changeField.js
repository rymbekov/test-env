/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';

export const changeField = createAction(
  'inbox/chnageField',
  (name, value) => ({ payload: { name, value } }),
);

export const reducer = (builder) => {
  builder.addCase(
    changeField.type,
    (state, { payload: { name, value } }) => {
      if (['title', 'description'].includes(name)) {
        state.titleAndDescription[name] = value;
        if (
          state.titleAndDescription.error
          && (state.titleAndDescription.title || '').trim()
          && (state.titleAndDescription.description || '').trim()
        ) {
          state.hasErrors = false;
          state.titleAndDescription.error = undefined;
        }
      } else {
        state[name].value = value;
        if (value) {
          state.hasErrors = false;
          state[name].error = undefined;
        }
      }
    },
  );
};
