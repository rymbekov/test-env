import { createSlice } from '@reduxjs/toolkit';

import { fetchProducts, downgrade } from '../actions/billing';

const initialState = {
  loading: false,
  downgrading: false,
  error: false,
  data: {
    plans: [],
    storages: [],
  },
};

/* eslint-disable no-param-reassign */
const isError = (action) => action.type.endsWith('fetchProducts/rejected')
  || action.type.endsWith('downgrade/rejected');

const slice = createSlice({
  name: 'billing',
  initialState,
  extraReducers: (builder) => builder
    .addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.data = initialState.data;
    })
    .addCase(fetchProducts.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.data = payload;
    })
    .addCase(downgrade.pending, (state) => {
      state.downgrading = true;
    })
    .addCase(downgrade.fulfilled, (state) => {
      state.downgrading = false;
    })
    .addMatcher(isError, (state) => {
      state.error = true;
    }),
});
/* eslint-enable no-param-reassign */

const { reducer } = slice;

export default reducer;
