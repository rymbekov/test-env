/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { reloadRoute } from '../../helpers/history';
import localization from '../../shared/strings';

export const setSortType = createAsyncThunk(
  'inboxes/setSortType',
  async ({ _id, sortType }, { getState, extra: { sdk, Toast } }) => {
    try {
      const userId = getState().user._id;
      await sdk.inboxes.setSortType(_id, sortType, userId);
      reloadRoute();
      return { _id, sortType, userId };
    } catch (error) {
      Toast(localization.TAGSTREE.textCantChangeOrder, { autoClose: false });
      reloadRoute();
      throw error;
    }
  },
);

export const reducer = (builder) => {
  builder
    .addCase(
      setSortType.pending,
      (state) => {
        state.sortTypeUpdating = true;
      },
    )
    .addCase(
      setSortType.fulfilled,
      (state, { payload: { _id, sortType, userId } }) => {
        state.sortTypeUpdating = false;
        state.inboxes.forEach((inbox) => {
          if (inbox._id === _id) {
            if (!inbox.sortType) {
              /** if first sortType for inbox */
              inbox.sortType = [{ userId, ...sortType }];
              return;
            }

            const userSortType = inbox.sortType.find((i) => i.userId === userId);
            if (userSortType) {
              /** UPDATE sortType for current user */
              Object.keys(sortType).forEach((key) => {
                userSortType[key] = sortType[key];
              });
            } else {
              /** ADD sortType for current user */
              inbox.sortType.push({ userId, ...{ sortType } });
            }
          }
        });
      },
    )
    .addCase(
      setSortType.rejected,
      (state) => {
        state.sortTypeUpdating = false;
      },
    );
};
