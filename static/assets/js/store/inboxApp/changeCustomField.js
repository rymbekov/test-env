/* eslint-disable no-param-reassign */
import { createAction } from '@reduxjs/toolkit';

export const changeCustomField = createAction('inbox/changeCustomField', (order, value, options) => ({
  payload: { order, value, options },
}));

export const reducer = (builder) => {
  builder.addCase(
    changeCustomField.type,
    (state, { payload: { order, value, options } }) => {
      state.customFields.forEach((cf) => {
        if (cf.order === order) {
          state.hasErrors = false;
          cf.error = undefined;
          /** handle multiselect */
          if (options?.multipleAttach) {
            if (options?.isAttach) {
              cf.value = cf.value ? `${cf.value},${value}` : value;
              return;
            }
            const values = cf.value.split(',');
            cf.value = values.filter((item) => item !== value).join(',');
            return;
          }
          /** other types */
          cf.value = value;
        }
      });
    },
  );
};
