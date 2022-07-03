import { createAction } from '@reduxjs/toolkit';

export const addItems = createAction('uploadList/addItems');
export const clearItems = createAction('uploadList/clearItems');
export const update = createAction('uploadList/update');

export default {
  addItems,
  clearItems,
  update,
};
