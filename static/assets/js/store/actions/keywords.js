import { toast } from 'react-toastify';
import sdk from '../../sdk';
import * as utils from '../../shared/utils';
import * as Api from '../../api/keywords';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import TYPES from '../action-types';
import Toast from '../../components/Toast';
import { showDialog } from '../../components/dialog';

const SEPARATOR = '→';

/**
 * Get keywords
 */
const customId = 'getKeywordsFailed';
export function getKeywords() {
  return async (dispatch) => {
    try {
      dispatch({ type: TYPES.KEYWORDS.FETCH.START });
      const all = await Api.getAll();

      dispatch({
        type: TYPES.KEYWORDS.FETCH.COMPLETE,
        payload: { all },
      });
    } catch (error) {
      Logger.log('UI', 'ToastKeywordsNotLoaded');
      toast.error(
        'Keywords has not loaded. Try refreshing the page to see them.',
        {
          toastId: customId,
          autoClose: false,
        },
      );
      dispatch({
        type: TYPES.KEYWORDS.FETCH.FAILED,
        error,
      });
      const connection = utils.getNavigatorConnectionInfo();
      Logger.error(new Error('Can not get keywords'), { error }, [
        'GetKeywordsFailed',
        { errorMessage: (error && error.message) || 'NoMessage', connection },
      ]);
    }
  };
}

/**
 * Add keywords
 * @param {Object[]} keywords
 */
export function addKeywords(keywords) {
  return (dispatch, getState) => {
    const allKeywords = getState().keywords.all;
    const newKeywords = [];
    keywords.forEach((item) => {
      const isKeywordExist = allKeywords.find((storeKeyword) => storeKeyword._id === item._id);
      if (!isKeywordExist) {
        newKeywords.push(item);
      }
    });

    dispatch({
      type: TYPES.KEYWORDS.ADD_MULTIPLE,
      payload: { keywords: newKeywords },
    });
  };
}

/**
 * Add keyword
 * @param {string} name
 * @param {string} parentID
 */
export function add(name, parentID, multi) {
  const parentIDforServer = ['favorites', 'keywords'].includes(parentID) ? null : parentID;
  return async (dispatch, getState) => {
    function handleError(error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg');
      const errorStatus = utils.getStatusFromResponceError(error);
      if (errorStatus === 403) {
        Toast(localization.NO_PERMISSION_TO_ACCESS, { autoClose: false });
      } else if (errorMessage) {
        Toast(errorMessage, { autoClose: false });
      } else {
        Toast(localization.KEYWORDS.alertCantAddKeyword, { autoClose: false });
      }
      dispatch({
        type: TYPES.KEYWORDS.ADD.FAILED,
        error,
      });
      Logger.error(new Error('Can not add keywords'), { error }, [
        'AddKeywordsFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }

    try {
      dispatch({ type: TYPES.KEYWORDS.ADD.START });

      if (multi) {
        const keywords = await Api.add(name, parentIDforServer, multi);
        const newKeywords = keywords.filter((keyword) => keyword.isNew);
        addKeywords(newKeywords)(dispatch, getState);
      } else {
        const keyword = await Api.add(name, parentIDforServer);
        if (!keyword.name) {
          keyword.name = keyword.path.split(SEPARATOR).pop();
        }

        dispatch({
          type: TYPES.KEYWORDS.ADD.COMPLETE,
          payload: { keyword, parentID },
        });
      }
    } catch (error) {
      handleError(error);
    }
  };
}

/** Added keyword immediately
 * @param {Object} keyword
 * @param {string} parentID
 */
export function added(keyword, parentID) {
  return (dispatch) => {
    dispatch({
      type: TYPES.KEYWORDS.ADD.COMPLETE,
      payload: { keyword, parentID },
    });
  };
}

/**
 * Rename keyword
 * @param {id} string
 * @param {name} string - new name
 */
export function rename(id, name) {
  return async (dispatch) => {
    function handleError(error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg');
      if (errorMessage) {
        Toast(errorMessage, { autoClose: false });
      } else {
        Toast(localization.COLLECTIONS.textCantUpdateKeyword, { autoClose: false });
      }
      dispatch({
        type: TYPES.KEYWORDS.RENAME.FAILED,
        payload: { id },
        error,
      });
      Logger.error(new Error('Can not rename keyword'), { error }, [
        'RenameKeywordFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }

    try {
      dispatch({
        type: TYPES.KEYWORDS.RENAME.START,
        payload: { id },
      });

      const result = await Api.rename(id, name);
      if (result.success) {
        dispatch({
          type: TYPES.KEYWORDS.RENAME.COMPLETE,
          payload: { id, name },
        });
        /** call assets action -> rename inside assets */

        dispatch({
          type: TYPES.ASSETS.RENAME_KEYWORD,
          payload: { id, newName: name },
        });
      } else {
        handleError(result);
      }
    } catch (error) {
      handleError(error);
    }
  };
}

/** Renamed keyword immediately
 * @param {Object} keyword
 * @param {string} parentID
 */
export function renamed(id, name) {
  return (dispatch) => {
    dispatch({
      type: TYPES.KEYWORDS.RENAME.COMPLETE,
      payload: { id, name },
    });
  };
}

/**
 * Add/remove favorites
 * @param {string} id - keyword id
 * @param {string} path
 * @param {boolean} value
 */
export function favorite(id, path, value) {
  return async (dispatch) => {
    function handleError(error) {
      dispatch({
        type: TYPES.KEYWORDS.FAVORITE.FAILED,
        payload: { id },
        error,
      });
      Logger.error(new Error('Can not add keyword to favorites'), { error }, [
        'AddKeywordToFavoritesFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
    try {
      dispatch({
        type: TYPES.KEYWORDS.FAVORITE.START,
        payload: { id },
      });
      const result = await Api.setFavorite(id, value);
      if (result.success) {
        const actionText = value
          ? localization.COLLECTIONS.textAddedTo
          : localization.COLLECTIONS.textRemovedFrom;
        Toast(`"${path.split(SEPARATOR).pop()}" ${actionText} ${localization.COLLECTIONS.titleFavorites}`);
        dispatch({
          type: TYPES.KEYWORDS.FAVORITE.COMPLETE,
          payload: { id, value },
        });
      } else {
        handleError(result);
      }
    } catch (error) {
      handleError(error);
    }
  };
}

/**
 * Remove keyword immediately by notification
 * @param {string} id
 */
export const keywordRemoving = (id) => (dispatch) => dispatch({
  type: TYPES.KEYWORDS.REMOVE.INPROGRESS,
  payload: { id },
});

/**
 * Move keyword
 * @param {string} id
 * @param {string} parentID
 */
export function move(id, parentID) {
  return async (dispatch) => {
    function handleError(error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg');
      if (errorMessage) {
        showDialog({
          title: 'Error',
          text: errorMessage,
          textBtnCancel: null,
        });
        Logger.warn('Can not move keyword:', errorMessage);
      } else {
        Logger.error(new Error('Can not move keyword'), { error, showDialog: true }, [
          'MoveKeywordFailed',
          (error && error.message) || 'NoMessage',
        ]);
      }
      dispatch({
        type: TYPES.KEYWORDS.MOVE.FAILED,
        payload: { id, parentID },
        error,
      });
    }

    try {
      dispatch({
        type: TYPES.KEYWORDS.MOVE.START,
        payload: { id },
      });

      const result = await Api.move(id, parentID);
      if (result.success) {
        dispatch({
          type: TYPES.KEYWORDS.MOVE.COMPLETE,
          payload: { id, parentID },
        });
      } else {
        handleError(result);
      }
    } catch (error) {
      handleError(error);
    }
  };
}

/**
 * Apply search
 * @param {string} value
 */
export function applySearch(value) {
  return (dispatch) => {
    dispatch({
      type: TYPES.KEYWORDS.SEARCH,
      payload: { value },
    });
  };
}

/**
 * Set active keywords
 * @param {string[]} ids
 */
export function setActive(ids) {
  return (dispatch) => {
    dispatch({
      type: TYPES.KEYWORDS.SET_ACTIVE,
      payload: { ids },
    });
  };
}

/**
 * Sort
 * @param {Object} type
 */
export function sort(type) {
  return (dispatch) => {
    dispatch({
      type: TYPES.KEYWORDS.SORT,
      payload: { type },
    });
  };
}

/**
 * Update usedAt
 * @param {string} id
 * @param {string} value
 */
export function updateUsedAt(id, value) {
  return (dispatch) => {
    dispatch({
      type: TYPES.KEYWORDS.UPDATE_USED_AT,
      payload: { id, value },
    });
  };
}

/** Update count
 * @param {string} id
 * @param {number} value
 */
export function updateCount(id, value) {
  return (dispatch) => {
    dispatch({
      type: TYPES.KEYWORDS.UPDATE_COUNT,
      payload: { id, value },
    });
  };
}

/**
 * Set selected keywords
 * @param {string[]} ids
 */
export function setSelected(ids) {
  return (dispatch) => {
    dispatch({
      type: 'keywords/setSelectedKeywords',
      payload: { ids },
    });
  };
}

/**
 * Select one keyword
 * @param {string} _id
 */
export function addToSelection(_id) {
  return (dispatch) => {
    dispatch({
      type: 'keywords/selectOne',
      payload: { _id },
    });
  };
}

/**
 * Deselect one keyword
 * @param {string} _id
 */
export function removeFromSelection(_id) {
  return (dispatch) => {
    dispatch({
      type: 'keywords/deselectOne',
      payload: { _id },
    });
  };
}

export const LIMIT_KEYWORDS_TO_DELETE = 1000;
/**
 * Delete selected keywords
 * @param {string[]} selectedIds
 * @param {string} name - keyword name
 */
export function deleteSelected(selectedIds, name) {
  return (dispatch, getState) => {
    const { selectedKeywords, all } = getState().keywords;
    let ids = [];
    if (selectedIds?.length) {
      ids = selectedIds;
    } else {
      ids = selectedKeywords;
    }

    if (!ids.length) return;

    /** Show limit dialog */
    if (ids.length > LIMIT_KEYWORDS_TO_DELETE) {
      Logger.log('UI', 'LimitDeleteKW', { count: ids.length });
      const { TITLE, TEXT, CANCEL } = localization.DIALOGS.KEYWORDS_DELETE_LIMIT;
      showDialog({
        title: TITLE(ids.length),
        text: TEXT(LIMIT_KEYWORDS_TO_DELETE),
        textBtnCancel: CANCEL,
        textBtnOk: null,
      });
      return;
    }

    const handleError = (error) => {
      dispatch({
        type: 'keywords/deleteSelectedKeywords/failed',
        payload: { ids },
      });
      Toast(localization.KEYWORDSTREE.errorKeywordsDeleting(), { autoClose: false });
      Logger.error(new Error('Can not delete keywords'), { error, ids }, [
        'DeleteKeywordsFailed',
        (error && error.message) || 'NoMessage',
      ]);
    };

    const doRemove = async () => {
      Logger.log('User', 'ConfirmDeleteKWYes', { keywordsIds: ids });
      try {
        dispatch({
          type: 'keywords/deleteSelectedKeywords/start',
          payload: { ids },
        });

        const { data } = await sdk.keywords.deleteKeywords(ids);
        const { success, removedKeywordIds } = data;

        // remove deleted keywords from assets
        if (success) {
          const storeAssets = getState().assets.items || [];
          const assetsWithKeyword = storeAssets.filter((asset) => {
            const keywords = asset.keywords || [];
            return keywords.find((kw) => removedKeywordIds.includes(kw._id));
          });
          const assetsIds = assetsWithKeyword.map((asset) => asset._id);
          if (assetsIds.length) {
            dispatch({
              type: TYPES.ASSETS.DETACH_KEYWORD.COMPLETE,
              payload: {
                ids: assetsIds,
                keywordsIds: removedKeywordIds,
                userId: getState().user._id,
              },
            });
          }

          dispatch({
            type: 'keywords/deleteSelectedKeywords/complete',
            payload: { ids },
          });
        } else {
          handleError(data);
        }
      } catch (error) {
        handleError(error);
      }
    };

    Logger.log('UI', 'ConfirmDeleteKW', { ids });
    const {
      TITLE, TEXT, OK, CANCEL,
    } = localization.DIALOGS.KEYWORDS_DELETE;
    showDialog({
      title: TITLE(ids.length, ids.length === all.length),
      text: TEXT(name, ids.length),
      textBtnCancel: CANCEL,
      textBtnOk: OK,
      onOk: doRemove,
      onCancel: () => Logger.log('User', 'ConfirmDeleteKWNo'),
    });
  };
}

/**
 * Merge selected keywords
 * @param {string} targetKeywordId
 * @param {string[]} selectedIds
 */
export function merge(targetKeywordId, selectedIds) {
  return (dispatch, getState) => {
    let ids = [];
    let notMergedIds = [];
    if (selectedIds?.length) {
      ids = selectedIds;
    } else {
      ids = getState().keywords.selectedKeywords;
    }

    if (!ids.length) return;

    const { all: allKeywords } = getState().keywords;

    const doMerge = async (forceMerge) => {
      try {
        dispatch({
          type: 'keywords/mergeSelectedKeywords/start',
          payload: { ids },
        });

        const { data: mergedKeywords } = await sdk.keywords.merge(targetKeywordId, ids, forceMerge);

        // remove merged keywords from assets and replace by new one
        if (mergedKeywords?.length) {
          const removedKeywordIds = mergedKeywords.map((kw) => kw._id);
          const storeAssets = getState().assets.items || [];
          const assetsWithKeyword = storeAssets.filter((asset) => {
            const keywords = asset.keywords || [];
            return keywords.find((kw) => removedKeywordIds.includes(kw._id));
          });
          const assetsIds = assetsWithKeyword.map((asset) => asset._id);
          const targetKeyword = allKeywords.find((kw) => targetKeywordId === kw._id);
          if (assetsIds.length) {
            dispatch({
              type: TYPES.ASSETS.MERGE_KEYWORDS,
              payload: {
                ids: assetsIds,
                keywordsIds: removedKeywordIds,
                targetKeyword,
                userId: getState().user._id,
              },
            });
          }

          dispatch({
            type: 'keywords/mergeSelectedKeywords/complete',
            payload: { ids, notMergedIds },
          });
        } else {
          handleError(mergedKeywords);
        }
      } catch (error) {
        handleError(error);
      }
    };

    const handleError = (error) => {
      const errorSubcode = utils.getDataFromResponceError(error, 'subcode');

      if (errorSubcode === 'KeywordsNotInRootError') {
        const keywords = utils.getDataFromResponceError(error, 'keywords');
        if (keywords?.length === ids.length) {
          const { TITLE, TEXT, OK } = localization.DIALOGS.KEYWORDS_MERGE_ONLY_ROOT;

          showDialog({
            title: TITLE(ids.length),
            text: TEXT,
            textBtnCancel: null,
            textBtnOk: OK,
            onOk: null,
          });

          dispatch({
            type: 'keywords/mergeSelectedKeywords/failed',
            payload: { ids },
          });
          return;
        }
        const nonReplacedKewords = allKeywords.map((kw) => {
          if (keywords.includes(kw._id)) {
            return {
              _id: kw._id,
              name: kw.name,
              path: kw.path,
            };
          }
          return null;
        }).filter(Boolean);

        const keywordsToOrderedListHtml = (keyword) => `<li>${keyword.path.split(SEPARATOR).pop()}</li>`;
        const html = `<ol>${nonReplacedKewords.map(keywordsToOrderedListHtml).join('')}</ol>`;
        showDialog({
          title: localization.DIALOGS.KEYWORDS_NOT_IN_ROOT.TITLE(ids.length),
          text: localization.DIALOGS.KEYWORDS_NOT_IN_ROOT.TEXT(html),
          textBtnCancel: localization.DIALOGS.KEYWORDS_NOT_IN_ROOT.CANCEL,
          textBtnOk: localization.DIALOGS.KEYWORDS_NOT_IN_ROOT.OK,
          onOk: () => {
            notMergedIds = keywords;
            /** uncheck keywords that not will be merged */
            ids = ids.filter((id) => !notMergedIds.includes(id));
            Logger.log('User', 'ConfirmMergeKWSYes', { keywordsIds: ids });
            doMerge(true);
          },
          onCancel: () => {
            Logger.log('User', 'ConfirmMergeKWSNo');
            dispatch({
              type: 'keywords/mergeSelectedKeywords/failed',
              payload: { ids },
            });
          },
        });
        return;
      }

      dispatch({
        type: 'keywords/mergeSelectedKeywords/failed',
        payload: { ids },
      });
      Toast(localization.KEYWORDSTREE.errorKeywordMerging(), { autoClose: false });
      Logger.error(new Error('Can not merge keywords'), { error, ids }, [
        'MergeKeywordsFailed',
        (error && error.message) || 'NoMessage',
      ]);
    };

    Logger.log('UI', 'ConfirmMergeKWS', { ids });

    const {
      TITLE, TEXT, OK, CANCEL,
    } = localization.DIALOGS.KEYWORDS_MERGE_CONFIRM;
    showDialog({
      title: TITLE(ids.length),
      text: TEXT(ids.length),
      textBtnCancel: CANCEL,
      textBtnOk: OK,
      onOk: () => {
        Logger.log('User', 'ConfirmMergeKWSYes', { keywordsIds: ids });
        doMerge();
      },
      onCancel: () => Logger.log('User', 'ConfirmMergeKWSNo'),
    });
  };
}
