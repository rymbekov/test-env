import { toast } from 'react-toastify';
import sortby from 'lodash.sortby';
import uniqBy from 'lodash.uniqby';
import * as Api from '../../api/customFields';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import TYPES from '../action-types';
import Toast from '../../components/Toast';
import { showDialog } from '../../components/dialog';

/**
 * Get all custom fields
 */
export const get = () => async (dispatch) => {
  try {
    dispatch({ type: TYPES.CUSTOM_FIELDS.FETCH.START });

    const response = await Api.fetch();
    const fields = uniqBy(response.fields, 'title');

    dispatch({
      type: TYPES.CUSTOM_FIELDS.FETCH.COMPLETE,
      payload: { items: fields },
    });
  } catch (error) {
    Logger.log('UI', 'ToastCustomFieldsNotLoaded');
    toast.error(
      'Custom fields has not loaded. Try refreshing the page to see them.',
      {
        autoClose: false,
      },
    );
    console.error(error);
    dispatch({ type: TYPES.CUSTOM_FIELDS.FETCH.FAILED, error });
  }
};

/**
 * Create custom field
 * @param {Object} data
 * @param {number} data.order
 * @param {string} data.title
 * @param {string} data.type
 * @param {string} data.visibility
 * @param {boolean} data.writable
 * @param {boolean?} quiet
 */
export const add = (data, quiet) => async (dispatch, getAll) => {
  try {
    const newItems = [...getAll().customFields.items];
    dispatch({
      type: TYPES.CUSTOM_FIELDS.ADD.START,
      payload: { item: data },
    });

    if (!quiet) await Api.add(data);

    newItems.forEach((field) => {
      if (field.order >= data.order) {
        field.order++;
      }
    });
    newItems.push(data);
    sortby(newItems, ['order']);

    dispatch({
      type: TYPES.CUSTOM_FIELDS.ADD.COMPLETE,
      payload: { item: data },
    });
  } catch (error) {
    console.error(error);
    const errorMessage = utils.getDataFromResponceError(error, 'msg') || localization.CUSTOMFIELDSSCHEMA.textErrorDbCant;
    dispatch({
      type: TYPES.CUSTOM_FIELDS.ADD.FAILED,
      payload: { item: data },
      error: errorMessage,
    });
  }
};

export const removeErrorMessage = () => (dispatch) => {
  dispatch({
    type: TYPES.CUSTOM_FIELDS.REMOVE_ERROR,
  });
};

/**
 * Remove custom field
 * @param {string} title
 * @param {boolean?} quiet
 */
export const remove = (title, quiet, required) => async (dispatch, getState) => {
  try {
    const state = getState();
    const newItems = state.customFields.items;

    dispatch({ type: TYPES.CUSTOM_FIELDS.REMOVE.START, payload: { title, required } });

    if (!quiet) await Api.remove(title);

    const itemToRemove = newItems.find((item) => item.title === title);
    const index = itemToRemove.order;
    newItems.splice(index, 1);
    newItems.forEach((field) => {
      if (field.order > itemToRemove.order) {
        field.order--;
      }
    });
    sortby(newItems, ['order']);

    dispatch({
      type: TYPES.CUSTOM_FIELDS.REMOVE.COMPLETE,
      payload: { title, required },
    });
  } catch (error) {
    Logger.error(new Error('Can not remove custom field'), { error, showDialog: true }, [
      'showWriteToSupportDialog',
      (error && error.message) || 'NoMessage',
    ]);
    dispatch({
      type: TYPES.CUSTOM_FIELDS.REMOVE.FAILED,
      payload: { title },
      error,
    });
  }
};

/**
 * Update custom fields
 * @param {Object[]} customFields
 */
export const update = (titles, key, value) => async (dispatch, getAll) => {
  try {
    const customFields = getAll().customFields.items.filter((item) => titles.includes(item.title));
    customFields.forEach((field) => (field[key] = value));

    dispatch({ type: TYPES.CUSTOM_FIELDS.UPDATE.START, payload: { titles } });

    await Api.update(customFields);

    dispatch({ type: TYPES.CUSTOM_FIELDS.UPDATE.COMPLETE, payload: { titles, key, value } });
  } catch (error) {
    console.error(error);
    dispatch({
      type: TYPES.CUSTOM_FIELDS.UPDATE.FAILED,
      payload: { titles },
      error,
    });
  }
};

/**
 * Update one custom field
 * @param {Object[]} customFields
 * @param {boolean} force
 */
export const updateCustomField = (customFieldModified, force = false) => async (dispatch) => {
  try {
    // temporary remove defautlTitle, we can't edit FieldTitle
    // eslint-disable-next-line no-param-reassign
    delete customFieldModified.defautlTitle;

    dispatch({
      type: TYPES.CUSTOM_FIELDS.UPDATE_ONE.START,
      payload: { customField: customFieldModified },
    });

    try {
      await Api.update([customFieldModified], force);
    } catch (error) {
      const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
      if (
        errorSubcode === 'CustomFieldsTypeChangedApiError'
        || errorSubcode === 'CustomFieldsTypeChangedAssetsLimitApiError'
      ) {
        let l10n = localization.CUSTOMFIELDSSCHEMA.changeTypeWarningDialog;
        let onOk = () => updateCustomField(customFieldModified, true)(dispatch);
        const onCancel = () => {
          dispatch({
            type: TYPES.CUSTOM_FIELDS.UPDATE_ONE.CANCELLED,
            payload: { customField: customFieldModified },
          });
        };

        if (errorSubcode === 'CustomFieldsTypeChangedAssetsLimitApiError') {
          l10n = localization.CUSTOMFIELDSSCHEMA.changeTypeLimitDialog;
          onOk = () => {
            window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
          };
        }
        const { title, text, textBtnOk } = l10n;
        showDialog({
          title, text, textBtnOk, onOk, onCancel,
        });
        return;
      }
      throw error;
    }

    dispatch({
      type: TYPES.CUSTOM_FIELDS.UPDATE_ONE.COMPLETE,
      payload: { customField: customFieldModified },
    });
  } catch (error) {
    Logger.error(new Error('Can not update custom field'), { error }, [
      'CustomFieldUpdateFailed', {
        errorMessage: error?.message,
      },
    ]);
    dispatch({
      type: TYPES.CUSTOM_FIELDS.UPDATE_ONE.FAILED,
      error,
    });
  }
};

/**
 * Import custom fields schema
 * @param {FormData} data
 */
export const importSchema = (data) => async (dispatch) => {
  try {
    dispatch({ type: TYPES.CUSTOM_FIELDS.IMPORT.START });

    let items = await Api.importSchema(data);
    items = uniqBy(items, 'title');
    dispatch({ type: TYPES.CUSTOM_FIELDS.IMPORT.COMPLETE, payload: { items } });
  } catch (error) {
    console.error(error);
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    if (errorMessage) {
      Toast(errorMessage, { autoClose: false });
    } else {
      Toast(localization.CUSTOMFIELDSSCHEMA.textImportError, { autoClose: false });
    }
    dispatch({ type: TYPES.CUSTOM_FIELDS.IMPORT.FAILED, error });
  }
};

/**
 * Move custom fields
 * @param {string[]} titlesToMove - fields titles to move
 * @param {string?} fieldTitleToMoveAfter - title of field to insert after, if `null` - put to start
 */
export const move = (titlesToMove, fieldTitleToMoveAfter) => async (dispatch, getAll) => {
  try {
    dispatch({ type: TYPES.CUSTOM_FIELDS.MOVE.START });

    let newItems = [...getAll().customFields.items];
    const indexToRemove = newItems.findIndex((item) => item.title === titlesToMove[0]);
    const itemsToMove = newItems.splice(indexToRemove, titlesToMove.length);

    const indexToPut = fieldTitleToMoveAfter ? newItems.findIndex((item) => item.title === fieldTitleToMoveAfter) : -1;

    newItems.splice(indexToPut + 1, 0, ...itemsToMove);
    /** setup orders */
    newItems = newItems.map((item, index) => {
      const { isUpdating, ...data } = item; // eslint-disable-line
      data.order = index;
      return data;
    });

    await Api.update(newItems);

    dispatch({ type: TYPES.CUSTOM_FIELDS.MOVE.COMPLETE, payload: { items: newItems } });
  } catch (error) {
    console.error(error);
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    if (errorMessage) {
      Toast(errorMessage, { autoClose: false });
    } else {
      Toast(localization.CUSTOMFIELDSSCHEMA.textMoveFieldError, { autoClose: false });
    }
    dispatch({ type: TYPES.CUSTOM_FIELDS.MOVE.FAILED, error });
  }
};

/**
 * Apply search
 * @param {string} value
 */
export function applySearch(value) {
  return (dispatch) => {
    dispatch({
      type: TYPES.CUSTOM_FIELDS.SEARCH,
      payload: { value },
    });
  };
}
