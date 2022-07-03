import { createSlice } from '@reduxjs/toolkit';

import { addItems, update, clearItems } from '../actions/uploadList';

const initialState = {
  items: [],
  totalCount: 0,
  totalSize: 0,
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'uploadList',
  initialState,
  extraReducers: (builder) => builder
    .addCase(update, (state, { payload }) => {
      state.totalCount = payload.totalCount;
      state.totalSize = payload.totalSize;
    })
    .addCase(addItems, (state, { payload }) => {
      state.items = payload;
    })
    .addCase(clearItems, (state) => {
      state.items = [];
    }),
});
/* eslint-enable no-param-reassign */

const { reducer } = slice;

export default reducer;
