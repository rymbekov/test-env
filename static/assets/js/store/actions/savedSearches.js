import { toast } from 'react-toastify';
import * as Api from '../../api/savedSearches';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import store from '../index';
import TYPES from '../action-types';
import Toast from '../../components/Toast';
import { showDialog, showErrorDialog } from '../../components/dialog';

/**
 * Get savedSearches
 */
const customId = 'getSavedSearchesFailed';
export function getSavedSearches() {
  return async (dispatch) => {
    dispatch({ type: TYPES.SAVEDSEARCHES.FETCH.START });
    const userId = store.getState().user._id;

    try {
      const savedSearches = await Api.getAll();
      dispatch({
        type: TYPES.SAVEDSEARCHES.FETCH.COMPLETE,
        payload: { savedSearches, userId },
      });
    } catch (error) {
      Logger.log('UI', 'ToastSavedSearchesNotLoaded');
      toast.error(
        'Saved searches has not loaded. Try refreshing the page to see them.',
        {
          toastId: customId,
          autoClose: false,
        },
      );
      dispatch({
        type: TYPES.SAVEDSEARCHES.FETCH.FAILED,
        error,
      });
      Logger.error(new Error('Can not get saved searches'), { error }, [
        'GetSavedSearchesFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  };
}

/**
 * Add savedSearch
 * @param {string} name
 * @param {Object} data
 * @param {boolean} shared
 */
export function add(name, data, shared) {
  return async (dispatch) => {
    try {
      dispatch({ type: TYPES.SAVEDSEARCHES.ADD.START });
      const newItem = await Api.add(name, data, shared);
      if (newItem) {
        Toast(localization.TAGSTREE.alertSearchAdded(name));

        dispatch({
          type: TYPES.SAVEDSEARCHES.ADD.COMPLETE,
          payload: { newItem },
        });
      }
    } catch (error) {
      dispatch({
        type: TYPES.SAVEDSEARCHES.ADD.FAILED,
        error,
      });
      const errorStatus = utils.getStatusFromResponceError(error);
      if (errorStatus === 403) {
        showErrorDialog(localization.NO_PERMISSION_TO_ACCESS);
      } else {
        Logger.error(new Error('Can not add saved searches'), { error }, [
          'AddSavedSearchesFailed',
          (error && error.message) || 'NoMessage',
        ]);
      }
    }
  };
}

/**
 * Delete savedSearch
 * @param {string} id
 * @param {string} name
 */
export function remove(id, name) {
  return async (dispatch) => {
    Logger.log('UI', 'ConfirmDeleteSavedSearch');
    showDialog({
      title: localization.TAGSTREE.titleRemoveSavedSearch,
      text: localization.TAGSTREE.textYouAreAboutRemoveSavedSearch(name),
      textBtnOk: localization.DIALOGS.btnYes,
      textBtnCancel: localization.DIALOGS.btnNo,
      async onOk() {
        dispatch({
          type: TYPES.SAVEDSEARCHES.REMOVE.START,
          payload: { id },
        });
        Logger.log('User', 'ConfirmDeleteSavedSearchYes', { savedSearcheId: id });
        try {
          const result = await Api.remove(id);
          if (result.deleted) {
            Toast(localization.TAGSTREE.textHasBeenRemoved(name));
            dispatch({
              type: TYPES.SAVEDSEARCHES.REMOVE.COMPLETE,
              payload: { result, id },
            });
          }
          return;
        } catch (error) {
          dispatch({
            type: TYPES.SAVEDSEARCHES.REMOVE.FAILED,
            payload: { id },
            error,
          });
          const errorStatus = utils.getStatusFromResponceError(error);
          if (errorStatus === 403) {
            showErrorDialog(localization.NO_PERMISSION_TO_ACCESS);
          } else {
            Logger.error(new Error('Can not remove saved searches'), { error }, [
              'RemoveSavedSearchesFailed',
              (error && error.message) || 'NoMessage',
            ]);
          }
        }
      },
      onCancel: () => Logger.log('User', 'ConfirmDeleteSavedSearchNo'),
    });
  };
}

/**
 * Favorite savedSearch
 * @param {string} id
 * @param {string} name
 * @param {boolean} value
 * @param {string} userId
 */
export function favorite(id, name, value) {
  const userId = store.getState().user._id;
  return async (dispatch) => {
    try {
      dispatch({
        type: TYPES.SAVEDSEARCHES.FAVORITE.START,
        payload: { id },
      });
      const result = await Api.favorite(id, value);

      if (result.success) {
        Toast(`"${name}" has been ${value ? 'added to' : 'removed from'} Favorites`);
        dispatch({
          type: TYPES.SAVEDSEARCHES.FAVORITE.COMPLETE,
          payload: { id, value, userId },
        });
      }
    } catch (error) {
      dispatch({
        type: TYPES.SAVEDSEARCHES.FAVORITE.FAILED,
        payload: { id },
        error,
      });
      Logger.error(new Error('Can not add saved searches to favorites'), { error }, [
        'AddSavedSearchesToFavoritesFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  };
}

/**
 * Apply search
 * @param {string} value
 */
export function applySearch(value) {
  const userId = store.getState().user._id;
  return (dispatch) => {
    dispatch({
      type: TYPES.SAVEDSEARCHES.SEARCH,
      payload: { value, userId },
    });
  };
}

/**
 * Set active savedSearch
 * @param {string} id
 */
export function setActive(id) {
  return (dispatch, getState) => {
    if (id === null) {
      dispatch({
        type: TYPES.SAVEDSEARCHES.SET_ACTIVE,
        payload: { activeSavedSearch: null },
      });
      return;
    }

    const savedSearches = getState().savedSearches.all;
    const activeSavedSearch = savedSearches?.find((i) => i._id === id);
    dispatch({
      type: TYPES.SAVEDSEARCHES.SET_ACTIVE,
      payload: { activeSavedSearch },
    });
  };
}
