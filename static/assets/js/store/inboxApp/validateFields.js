/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';

export const validateFields = createAction('inbox/validateFields', () => ({ payload: { text: 'THIS IS RETURN' } }));

const TEXT_REQUIRED = 'This field was set as required, please fill it';
const setError = (state, field) => {
  state.hasErrors = true;
  field.error = TEXT_REQUIRED;
};

export const reducer = (builder) => {
  builder.addCase(
    validateFields.type,
    (state) => {
      const {
        comment, titleAndDescription, flag, rating, color, customFields,
      } = state;
      state.hasErrors = false;

      if (comment.required && !(comment.value || '').trim()) setError(state, comment);
      if (titleAndDescription.required
          && (!(titleAndDescription.title || '').trim() || !(titleAndDescription.description || '').trim())
      ) {
        setError(state, titleAndDescription);
      }
      if (flag.required && !flag.value) setError(state, flag);
      if (rating.required && !rating.value) setError(state, rating);
      if (color.required && !color.value) setError(state, color);
      customFields.forEach((cf) => {
        if (
          cf.required
          && (typeof cf.value === 'undefined' || (typeof cf.value === 'string' && !cf.value.trim()))
        ) setError(state, cf);
      });
    },
  );
};
