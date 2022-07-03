import ReactDOM from 'react-dom';
import CONSTANTS from '@picsio/db/src/constants';
import remove from 'lodash.remove';

import * as Api from '../../api/assets';
import * as ApiKeywords from '../../api/keywords';
import Logger from '../../services/Logger';
import UiBlocker from '../../services/UiBlocker';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';
import picsioConfig from '../../../../../config';
import showSelectFromTreeDialog from '../../helpers/showSelectFromTreeDialog';
import getThumbnailUrls from '../../helpers/getThumbnailUrls';

import Store from '../index';
import * as UtilsCollections from '../utils/collections';
import * as UtilsLightboards from '../utils/lightboards';
import { isChild } from '../helpers/collections';
import { findAndResolveDuplicates } from '../helpers/assets/index';
import { isHaveTeammatePermission } from '../helpers/user';
import { updateTeamValue, updateUser } from './user';
import Toast from '../../components/Toast';
import TYPES from '../action-types';
import {
  navigate, isRoutePreview, navigateToRoot,
} from '../../helpers/history';

import {
  addKeywords as addKeywordsAction,
  updateUsedAt as updateUsedAtAction,
  updateCount as updateCountAction,
} from './keywords';
import {
  changeCount as changeCountCollectionsAction,
  getChildren as getChildrenCollectionsAction,
} from './collections';
import { showDialog, showErrorDialog } from '../../components/dialog';
import sdk from '../../sdk';
import sortFailed from '../helpers/assets/sortFailed';

const FINISH_IN_BACKGROUND_SIZE = 100;
const CONFIRM_CHANGES_SIZE = 1;
const CONFIRM_CHANGES_MASS_SIZE = 50000;

/**
 * Get assets
 * @param {boolean} isNewRoute
 * @param {number?} delay - delay before request, e.g. updateByNew -> 2000
 */
export const getAssets = (isNewRoute, delay, geoData) => (dispatch, getState) => {
  function handleError(error) {
    UiBlocker.unblock();

    let errorText = localization.CATALOG_VIEW.cantLoadData;
    const errorStatus = utils.getStatusFromResponceError(error);
    if (errorStatus === 404) {
      errorText = localization.CATALOG_VIEW.collectionNotFound;
    }
    if (errorStatus === 400) {
      errorText = localization.CATALOG_VIEW.errorCheckSearchQuery;
    }

    if (!error || errorStatus !== 400) {
      /** Don't send error if status === 400 -> incorrect search query */
      const connection = utils.getNavigatorConnectionInfo();
      Logger.error(new Error('Error fetching assets'), { error, showDialog: true }, [
        'GetAssetsFailed',
        { errorMessage: errorText || 'NoMessage', userDialogueMessage: errorText, connection },
      ]);
    }
    showDialog({
      title:
        errorStatus === 400
          ? localization.CATALOG_VIEW.errorCheckSearchQueryTitle
          : localization.CATALOG_VIEW.textError,
      text: errorText,
      textBtnCancel: null,
      onOk: navigateToRoot,
      onCancel: navigateToRoot,
    });

    dispatch({
      type: TYPES.ASSETS.FETCH.FAILED,
      error,
    });
  }

  function getIds() {
    const store = getState();
    /** Get current ids from search query */
    const {
      tagId, lightboardId, keywords, inboxId,
    } = store.router.location.query;
    /** If no ids in the url -> get them from the store */
    const ids = {
      collectionId: tagId || store.collections.activeCollection?._id,
      lightboardId: lightboardId || store.lightboards.activeLightboard?._id,
      keywordId: (keywords && keywords[0]) || store.keywords.activeKeywords[0] || null,
      inboxId: inboxId || store.inboxes.activeInboxID,
    };

    return ids;
  }

  async function doRequest(from) {
    try {
      const {
        collectionId, lightboardId, keywordId, inboxId,
      } = getIds();

      const defaultSort = { type: 'uploadTime', order: 'desc' };
      const isProofing = picsioConfig.isProofing();
      let sort = isProofing ? window.websiteConfig.sortType || defaultSort : defaultSort;
      if (collectionId) {
        // we can't use getState().collections.activeCollection
        // because it updates after getAssets action
        const collection = await UtilsCollections.forceFindTagWithTagId(collectionId);
        if (collection) sort = isProofing ? window.websiteConfig.sortType || collection.sortType : collection.sortType;
      }

      if (inboxId) {
        const { user, inboxes } = getState();
        const inbox = inboxes.inboxes.find(({ _id }) => _id === inboxId);
        if (inbox.sortType) {
          const sortType = inbox.sortType.find(({ userId }) => user._id === userId);
          if (sortType) sort = sortType;
        }
      }

      if (lightboardId) {
        // we can't use getState().lightboards.activeLightboard
        // because it updates after getAssets action
        const { lightboards } = getState().lightboards;
        const activeLightboard = lightboards.find((lb) => lb._id === lightboardId);

        if (activeLightboard) {
          sort = activeLightboard.sortType;
        }
      }
      const assets = getState().assets.items;
      const response = await Api.get(from, sort, geoData, assets);
      const {
        full, images, total, geo,
      } = response;

      // Check if user is searching something by text request and found nothing
      const { text } = getState().router.location.query;
      if (total === 0 && text) {
        Logger.log('UI', 'SearchNothingFound', { text });
      }

      const {
        collectionId: currentCollectionId,
        lightboardId: currentLightboardId,
        keywordId: currentKeywordId,
        inboxId: currentInboxId,
      } = getIds();
      /**
       * If params changed
       * (for example: fast switching betwen collections, slow internet connection)
       * do not dispatch event to store (other fetch already started)
       */
      if (
        (collectionId && currentCollectionId && collectionId !== currentCollectionId)
        || (lightboardId && currentLightboardId && lightboardId !== currentLightboardId)
        || (keywordId && currentKeywordId && keywordId !== currentKeywordId)
        || (inboxId && currentInboxId && inboxId !== currentInboxId)
      ) {
        return;
      }

      if (images) {
        /** Get thumbnails for mages if no custom thumbnail */
        const ids = images.map((asset) => asset._id);
        if (ids.length) getThumbnails(ids)(dispatch, getState);

        dispatch({
          type: TYPES.ASSETS.FETCH.COMPLETE,
          payload: {
            isNewRoute,
            full,
            total,
            items: images,
            geo,
          },
        });
        UiBlocker.unblock();
      } else {
        handleError(response);
      }
    } catch (error) {
      handleError(error);
    }
  }

  const from = isNewRoute || geoData ? 0 : getState().assets.items.length;
  dispatch({
    type: TYPES.ASSETS.FETCH.START,
    payload: { blockUI: isNewRoute },
  });

  if (delay) {
    UiBlocker.block('Processing files...');
    setTimeout(() => doRequest(from), delay);
  } else {
    doRequest(from);
  }
};

/**
 * @param {String[]} ids
 * @param {Boolean?} checkFor401 - if GD returns 401 error for thumb we needs to refresh roken
 */
export function getThumbnails(ids, checkFor401 = true) {
  return async (dispatch, getAll) => {
    try {
      const thumbnails = await getThumbnailUrls(ids);
      if (
        picsioConfig.isMainApp()
        && checkFor401
        && checkThumbnailErrorInvalidCredentials(thumbnails[0])
      ) {
        return getThumbnails(ids, false)(dispatch, getAll);
      }
      if (thumbnails?.length) {
        setThumbnails(thumbnails)(dispatch, getAll);
      } else {
        Logger.info(`getThumbnails not returned thumbnails for assetIds [${ids}]`);
      }
    } catch (error) {
      Logger.error(new Error('Can not get asset thumbnails'), { error, assetIds: ids }, [
        'errorFetchingThumbnails',
        (error && error.message) || 'NoMessage',
      ]);
    }
  };
}

function checkThumbnailErrorInvalidCredentials(thumbnail) {
  return thumbnail.error && thumbnail.error.code === 401;
}

/**
 * @param {Object[]} thumbnails
 */
export function setThumbnails(thumbnails) {
  return (dispatch, getAll) => {
    const { team } = getAll().user;
    const isUsedS3Storage = team && team.storageType === 's3';
    dispatch({
      type: TYPES.ASSETS.SET_THUMBNAILS,
      payload: { thumbnails, isUsedS3Storage },
    });
  };
}

/**
 * @param {string} id
 * @param {string} revisionId
 * @param {string} url
 * @param {Object[]?} pages
 * @param {Object?} imageSizes
 */
export function setCustomThumbnail(id, revisionId, url, pages, imageSizes, thumbnail) {
  return (dispatch) => {
    dispatch({
      type: TYPES.ASSETS.SET_CUSTOM_THUMBNAIL,
      payload: {
        id,
        revisionId,
        url,
        pages,
        imageSizes,
        thumbnail,
      },
    });
  };
}

/**
 * Revert asset revision
 * @param {string} assetId
 * @param {string} revisionIdToRevert
 * @param {string} newRevisionId
 */
export function revertRevision(assetId, revisionIdToRevert, newRevisionId) {
  return (dispatch, getAll) => {
    const asset = getAll().assets.items.find((a) => a._id === assetId);
    if (asset) {
      dispatch({
        type: TYPES.ASSETS.REVERT_REVISION,
        payload: {
          assetId,
          revisionIdToRevert,
          newRevisionId,
          userId: Store.getState().user._id,
        },
      });
      getThumbnails([asset._id])(dispatch, getAll);
    }
  };
}

/**
 * @param {string[]} ids - assets ids
 * @param {string} type - param type to highlight (e.g. "color")
 */
export const addHighlight = (ids, type) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.ADD_HIGHLIGHT,
    payload: { ids, type },
  });
};

/**
 * @param {string[]} ids - assets ids
 * @param {string} type - param type to highlight (e.g. "color")
 */
export const removeHighlight = (ids, type) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.REMOVE_HIGHLIGHT,
    payload: { ids, type },
  });
};

/**
 * Get one asset
 * @param {string[]} id
 */
export const getTmpAssets = (ids) => async (dispatch, getAll) => {
  try {
    dispatch({ type: TYPES.ASSETS.FETCH_TMP.START });
    const data = await Promise.all(ids.map((id) => Api.fetchOneAsset(id)));

    const _ids = data.map((asset) => asset._id);
    if (_ids.length) getThumbnails(_ids)(dispatch, getAll);
    // we need 'rolePermissions=null' for Proofing. We don't need to check assets permissions there.
    const { permissions: rolePermissions = null } = getAll().user?.role || {};

    dispatch({
      type: TYPES.ASSETS.FETCH_TMP.COMPLETE,
      payload: {
        items: data,
        ids,
        rolePermissions,
      },
    });
  } catch (error) {
    dispatch({ type: TYPES.ASSETS.FETCH_TMP.FAILED, error });
    window.dispatchEvent(
      new CustomEvent('hardError', {
        detail: {
          data: {
            message: localization.PREVIEW_VIEW.fileNotFound,
          },
        },
      }),
    );
  }
};

/** Set tmp item */
export const setTmpItem = (id) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.SET_TMP_ITEM,
    payload: { id },
  });
};

/** Remove tmp items */
export const removeTmpItems = () => ({ type: TYPES.ASSETS.REMOVE_TMP_ITEMS });

/**
 * Get assets by ids
 * @param {string[]} ids - assets ids
 */
export const getAssetsByIds = (ids) => async (dispatch, getAll) => {
  try {
    dispatch({ type: TYPES.ASSETS.GET_BY_IDS.START });
    const data = await Api.fetchAssetsByIds(ids);

    const _ids = data.assets.map((asset) => asset._id);
    if (_ids.length) getThumbnails(_ids)(dispatch, getAll);

    dispatch({
      type: TYPES.ASSETS.GET_BY_IDS.COMPLETE,
      payload: {
        items: data.assets,
      },
    });
  } catch (error) {
    dispatch({ type: TYPES.ASSETS.GET_BY_IDS.FAILED, error });
  }
};

/**
 * Select asset(s)
 * @param {string} id
 * @param {boolean} value
 * @param {boolean} isRange
 * @param {boolean} isOnlyOne
 */
export const select = (id, value, isRange, isOnlyOne) => (dispatch, getAll) => {
  const { selectedItems } = getAll().assets;
  // we need 'rolePermissions=null' for Proofing. We don't need to check assets permissions there.
  const { permissions: rolePermissions = null } = getAll().user?.role || {};

  if (isOnlyOne && selectedItems) {
    deselectAll()(dispatch);
  }

  dispatch({
    type: TYPES.ASSETS.SELECT,
    payload: {
      id, value, isRange, rolePermissions,
    },
  });
  if (selectedItems.length === 1 && !value) {
    window.dispatchEvent(new Event('selection:switched:off'));
  } else {
    window.dispatchEvent(new Event('selection:switched:on'));
  }
  if (selectedItems.length !== 0 && value) {
    Logger.log('User', 'ThumbnailSelectMultiple', {
      amount: selectedItems.length + 1,
    });
  } else {
    Logger.log('User', value ? 'ThumbnailSelect' : 'ThumbnailDeselect', {
      assetId: id,
    });
  }
};

/**
 * Select many asset(s)
 * @param {string} ids
 * @param {boolean} value
 */
export const selectMany = (ids, value) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.SELECT_MANY,
    payload: { ids, value },
  });
  Logger.log('User', value ? 'ThumbnailSelect' : 'ThumbnailDeselect');
};

/**
 * Reorder assets
 * @param {number} indexInsertBefore
 */

export const reorder = (indexInsertBefore) => async (dispatch, getAll) => {
  const { items, selectedItems } = getAll().assets;
  const { tagId, lightboardId } = getAll().router.location.query;
  const draggedModels = items.filter((item) => selectedItems.includes(item._id));

  const before = items.slice(0, indexInsertBefore);
  const after = items.slice(indexInsertBefore);
  remove(before, (item) => ~draggedModels.indexOf(item));
  remove(after, (item) => ~draggedModels.indexOf(item));

  const newItems = before.concat(draggedModels).concat(after);
  const doReorder = async (overwrite) => {
    await Api.reorder(
      tagId,
      lightboardId,
      newItems.map((item, index) => ({ _id: item._id, index })),
      overwrite,
    );
    tagId && UtilsCollections.setSortType({ type: 'custom' }, true);
    lightboardId && UtilsLightboards.setSortType({ type: 'custom' }, true);
  };

  const showCurrentCustomOrder = () => {
    tagId && UtilsCollections.setSortType({ type: 'custom' });
    lightboardId && UtilsLightboards.setSortType({ type: 'custom' });
  };

  try {
    dispatch({
      type: TYPES.ASSETS.REORDER,
      payload: { items: newItems },
    });
    await doReorder();
  } catch (error) {
    const errorStatus = utils.getStatusFromResponceError(error);
    if (errorStatus === 409) {
      Logger.log('UI', 'ChangeOrderAssetsToCustomDialog');
      showDialog({
        title: localization.DIALOGS.WARNING_CHANGE_ASSETS_ORDER.TITLE,
        text: localization.DIALOGS.WARNING_CHANGE_ASSETS_ORDER.TEXT,
        textBtnCancel: localization.DIALOGS.WARNING_CHANGE_ASSETS_ORDER.CANCEL_TEXT,
        textBtnOk: localization.DIALOGS.WARNING_CHANGE_ASSETS_ORDER.OK_TEXT,
        onOk: () => doReorder(true),
        onCancel: showCurrentCustomOrder,
      });
    } else {
      Logger.error(new Error('Can not reorder images'), { error, showDialog: true }, [
        'showWriteToSupportDialog',
        (error && error.message) || 'NoMessage',
      ]);
    }
  }
};

/**
 * Select all assets
 */
export const selectAll = () => async (dispatch, getAll) => {
  const store = getAll().assets;
  const { permissions: rolePermissions } = getAll().user.role;
  function handleError(error, spinner) {
    spinner.destroy();
    dispatch({
      type: TYPES.ASSETS.SELECT_ALL.FAILED,
      error,
    });
    Logger.error(new Error('Can not select all images'), { error, showDialog: true }, [
      'SelectAllFailed',
      (error && error.message) || 'NoMessage',
    ]);
  }

  /** if not all assets loaded */
  if (store.total > store.items.length) {
    const spinner = UiBlocker.block();
    try {
      dispatch({
        type: TYPES.ASSETS.SELECT_ALL.START,
      });
      const selected = await Api.selectAll();
      if (selected.images) {
        const selectedAssetsIds = selected.images.map((image) => image._id);
        const permissionsNames = Object.keys(store.items[0].permissions);
        const assetsBatchPermissions = await Api.getAssetPermissions(
          selectedAssetsIds, permissionsNames,
        );
        spinner.destroy();
        dispatch({
          type: TYPES.ASSETS.SELECT_ALL.COMPLETE,
          payload: {
            selectedAssetsIds,
            assetsBatchPermissions,
            rolePermissions,
          },
        });
        window.dispatchEvent(new Event('selection:switched:on'));
      } else {
        handleError(selected, spinner);
      }
    } catch (error) {
      handleError(error, spinner);
    }
  } else {
    const assetsPermissions = utils.mergePermissions(store.items.map((n) => n.permissions));
    dispatch({
      type: TYPES.ASSETS.SELECT_ALL.COMPLETE,
      payload: {
        selectedAssetsIds: store.items.map((item) => item._id).filter(Boolean),
        assetsPermissions,
        rolePermissions,
      },
    });
    window.dispatchEvent(new Event('selection:switched:on'));
  }
};

/** Deselect all assets */
export function deselectAll() {
  return (dispatch) => {
    dispatch({
      type: TYPES.ASSETS.DESELECT_ALL,
    });
    window.dispatchEvent(new Event('selection:switched:off'));
  };
}

/**
 * Add assets to collection
 * @param {string} collectionID
 * @param {string} collectionPath
 * @param {string[]?} assetIDs
 * @param {Boolean} isMove
 * @param {Boolean} withoutAlertDialog
 */
export const addToCollection = ({
  collectionID,
  collectionPath,
  assetIDs,
  isMove: isMoveFromParameter = false,
  withoutAlertDialog = false,
}) => async (dispatch, getAll) => {
  let isMove = isMoveFromParameter;
  const { assets, user, router } = getAll();
  const ids = assetIDs || assets.selectedItems;
  const { items } = assets;
  const isUsedS3Storage = user.team && user.team.storageType === 's3';
  let isAddToCollectionAllowed = true;
  let isMoveIntoNestedCollection = false;
  const { inboxId, tagId: activeCollectionID } = router.location.query;
  const isInbox = Boolean(inboxId || items[0].inbox);
  if (isInbox) isMove = true;

  // check that the assets are moved from the collection
  if (activeCollectionID) {
    const activeCollection = await UtilsCollections.forceFindTagWithTagId(activeCollectionID);
    const fullPathActiveCollection = activeCollection.path + activeCollection.name;
    isMoveIntoNestedCollection = isChild(fullPathActiveCollection, `/${collectionPath}`);
  }

  const spinnerText = isMove
    ? localization.TAGSTREE.textAttachingToCollection
    : localization.TAGSTREE.textAttachingCollection;

  if (ids.length > items.length) {
    const permissions = await Api.getAssetPermissions(ids, ['editAssetCollections']);
    // by getAssetPermissions we receive 'false', 'true' or 'mixed'.
    // So if we received 'false' or 'mixed' it means 'false'
    if (permissions.editAssetCollections !== true) {
      isAddToCollectionAllowed = false;
    }
  } else {
    // find assets without permission
    isAddToCollectionAllowed = items
      .filter((item) => ids.includes(item._id))
      .every(
        (item) => (item.permissions && item.permissions.editAssetCollections) || (isInbox && item.inbox),
      );
  }

  if (!isAddToCollectionAllowed) {
    showForbiddenDialog(localization.DIALOGS.WARNING_EDIT_ASSET_COLLECTIONS.TEXT);
    return;
  }

  checkMultipleChanges(ids.length, doAdd, undefined);

  async function doAdd() {
    const isPreview = isRoutePreview();
    if (isPreview && isInbox) setTmpItem(ids[0])(dispatch);

    let idsToChange = ids;
    let actions;
    if (isUsedS3Storage && isMove) {
      /** Check duplicated filenames */
      try {
        let assetsToResolve;
        if (items.length < ids.length) {
          const res = await Api.selectAll();
          assetsToResolve = res.images;
        } else {
          assetsToResolve = items;
        }
        const assetsToChange = assetsToResolve.filter((a) => ids.includes(a._id));
        const resolveResult = await findAndResolveDuplicates({
          assets: assetsToChange,
          collectionId: collectionID,
        });
        idsToChange = resolveResult.assets.map((a) => a._id);
        actions = resolveResult.actions;
      } catch (error) {
        /** if "Too many items to analyze" ( more than 10 000 ) */
        const errorStatus = utils.getStatusFromResponceError(error);
        if (errorStatus === 413) {
          const { TITLE, TEXT, CANCEL_TEXT } = localization.DIALOGS.LIMIT_CHECK_DUPLICATES;
          showDialog({
            title: TITLE,
            text: TEXT,
            textBtnCancel: CANCEL_TEXT,
            textBtnOk: null,
            style: { maxWidth: 600 },
          });
        } else {
          Logger.error(
            new Error('Can not find duplicates on the server [Move to collection]'),
            { error, showDialog: true },
            ['FindDuplicatesFailed', (error && error.message) || 'NoMessage'],
          );
        }
        /** IF CAN NOT RESOLVE DUPLICATES -> EXIT */
        return;
      }
      /** do nothing if all assets skipped */
      if (idsToChange.length < 1) return;
    }

    try {
      UiBlocker.block(spinnerText);
      dispatch({ type: TYPES.ASSETS.ADD_COLLECTION.START });

      /** for s3 storage -> send isMove: true */
      const { data: result } = await sdk.assets.attachToCollection(
        idsToChange, collectionID, isMove, actions,
      );
      let successAssetIds = idsToChange;

      /** has failed jobs */
      if (result.failedAssets) {
        const failedAssetsIds = result.failedAssets.map((a) => a._id);
        successAssetIds = idsToChange.filter((id) => !failedAssetsIds.includes(id));
        showErrorDialog(
          localization.COLLECTIONS.textFilesNotAddedToCollection(
            failedAssetsIds.length,
            collectionPath,
          ),
        );
      }

      if (!withoutAlertDialog) {
        Toast(
          localization.COLLECTIONS.textFilesAddedToCollection(
            successAssetIds.length,
            decodeURIComponent(collectionPath),
          ),
          { audit: true },
        );
      }

      dispatch({
        type: TYPES.ASSETS.ADD_COLLECTION.COMPLETE,
        payload: {
          ids: successAssetIds,
          collectionID,
          collectionPath,
          isMove,
          isTeamDrive: false,
          isMoveIntoNestedCollection,
          activeCollectionID,
        },
      });
      if (idsToChange.length > FINISH_IN_BACKGROUND_SIZE) {
        Toast(localization.DETAILS.textFinishInBg);
      }
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      let text = localization.COLLECTIONS.textFilesNotAddedToCollection(
        idsToChange.length,
        collectionPath,
      );

      if (errorStatus === 403) {
        /* if no permissions */
        text = localization.NO_PERMISSION_TO_ACCESS;
      } else {
        Logger.error(new Error('Can not attach asset to collection'), { error }, [
          'AttachAssetToCollectionFailed',
          (error && error.message) || 'NoMessage',
        ]);
      }

      showErrorDialog(text);
      dispatch({
        type: TYPES.ASSETS.ADD_COLLECTION.FAILED,
        error,
      });
    }

    UiBlocker.unblock();
  }
};

/**
 * Add assets to collection immediately
 * @param {Object} params
 * @param {string[]} params.ids - assets ids
 * @param {string} _id - collection id
 * @param {string} params.path - collection path
 */
export const addedToCollection = ({ ids, _id, path }) => (dispatch, getAll) => {
  addHighlight(ids, 'collections')(dispatch);
  const { tagId: activeCollectionID } = getAll().router.location.query;
  dispatch({
    type: TYPES.ASSETS.ADD_COLLECTION.COMPLETE,
    payload: {
      ids,
      collectionID: _id,
      collectionPath: path,
      isTeamDrive: false,
      activeCollectionID,
    },
  });
};

/**
 * Remove assets from collection
 * @param {Object} collection
 * @param {string[]} ids
 * @param {boolean?} withoutConfirmation
 */
export const removeFromCollection = (collection, ids, withoutConfirmation) => (
  dispatch,
  getAll,
) => {
  const selectedItems = ids || getAll().assets.selectedItems;
  const isDialogHidden = utils.getCookie('picsio.removeFromCollectionConfirmDialog') || false;

  Logger.log('UI', 'RemoveAssetsFromCollectionDialog');
  const configDialog = {
    title: localization.DETAILS.titleRemove,
    text: `${localization.DETAILS.textRemoveFilesFromCollection} <span className="highlight">'${collection.path}'</span>?`,
    textBtnCancel: localization.DIALOGS.btnCancel,
    textBtnOk: localization.DIALOGS.btnOk,
    onOk: doRemove,
  };

  const configWithoutConfirmation = {
    checkbox: {
      label: localization.DETAILS.labelCheckboxDontShow,
    },
    onOk: (data) => {
      utils.setCookie('picsio.removeFromCollectionConfirmDialog', data.checkbox);
      doRemove();
    },
  };

  if (!withoutConfirmation || (withoutConfirmation && !isDialogHidden)) {
    showDialog(
      withoutConfirmation ? { ...configDialog, ...configWithoutConfirmation } : configDialog,
    );
  } else {
    doRemove();
  }

  async function doRemove() {
    try {
      const collectionID = collection._id;

      UiBlocker.block(localization.TAGSTREE.textDetachingCollection);
      dispatch({ type: TYPES.ASSETS.REMOVE_COLLECTION.START });

      const res = await Api.removeFromCollection(selectedItems, collectionID);
      const failed = (res && res.failed) || [];
      const failedIds = failed.map((asset) => asset._id);
      const removedAssetIds = selectedItems.filter((id) => !failedIds.includes(id));

      if (failed.length) {
        Toast(
          localization.DETAILS.textDetachFromCollectionSomeAssetsFailed(
            {
              count: failed.length,
              collection: collection.path,
            },
            { autoClose: false },
          ),
        );
      } else if (selectedItems.length > FINISH_IN_BACKGROUND_SIZE) {
        Toast(localization.DETAILS.textFinishInBg);
      }
      dispatch({
        type: TYPES.ASSETS.REMOVE_COLLECTION.COMPLETE,
        payload: { selectedItems: removedAssetIds, collectionID },
      });
    } catch (error) {
      let text = localization.DETAILS.textDetachFromCollectionSomeAssetsFailed.assign({
        count: '',
        collection: collection.path,
      });
      const errorStatus = utils.getStatusFromResponceError(error);
      if (errorStatus === 403) {
        /* if no permissions */
        text = localization.NO_PERMISSION_TO_ACCESS;
      } else {
        Logger.error(new Error('Error detach some assets from collection'), { error }, [
          'DetachAssetsFromCollectionFailed',
          (error && error.message) || 'NoMessage',
        ]);
      }
      showErrorDialog(text);
      dispatch({
        type: TYPES.ASSETS.REMOVE_COLLECTION.FAILED,
        error,
      });
    }

    UiBlocker.unblock();
  }
};

/**
 * Removed assets from collection immediately
 * @param {array} ids
 */
export const removedFromCollection = (params) => (dispatch) => {
  addHighlight(params.ids, 'collections')(dispatch);
  dispatch({
    type: TYPES.ASSETS.REMOVED_COLLECTION,
    payload: {
      collectionID: params._id,
      selectedIds: params.ids,
      itemsRemoved: params.ids.length,
    },
  });
};

/**
 * Add assets to lightboard
 * @param {string} lightboardID
 * @param {string} lightboardPath
 * @param {Boolean} isMove
 * @param {string[]?} assetIDs - assets ids
 */
export const addToLightboard = ({
  lightboardID, lightboardPath, assetIDs, isMove = false,
}) => (
  dispatch,
  getAll,
) => {
  const { user, assets } = getAll();
  const ids = assetIDs || assets.selectedItems;
  const { items } = assets;
  const { team } = user;
  const isUsedS3Storage = team.storageType === 's3';
  const spinnerText = localization.LIGHTBOARDSTREE.textAttachingToLightboard;

  checkMultipleChanges(ids.length, doAdd, undefined);

  async function doAdd() {
    let idsToChange = ids;
    let actions;
    if (isUsedS3Storage && isMove) {
      /** Check duplicated filenames */
      try {
        let assets;
        if (items.length < ids.length) {
          const res = await Api.selectAll();
          assets = res.images;
        } else {
          assets = items;
        }
        const assetsToChange = assets.filter((a) => ids.includes(a._id));
        const resolveResult = await findAndResolveDuplicates({
          assets: assetsToChange,
          lightboardId: lightboardID,
        });
        idsToChange = resolveResult.assets.map((a) => a._id);
        actions = resolveResult.actions;
      } catch (error) {
        /** if "Too many items to analyze" ( more than 10 000 ) */
        const errorStatus = utils.getStatusFromResponceError(error);
        if (errorStatus === 413) {
          const { TITLE, TEXT, CANCEL_TEXT } = localization.DIALOGS.LIMIT_CHECK_DUPLICATES;
          showDialog({
            title: TITLE,
            text: TEXT,
            textBtnCancel: CANCEL_TEXT,
            textBtnOk: null,
            style: { maxWidth: 600 },
          });
        } else {
          Logger.error(
            new Error('Can not find duplicates on the server [Move to lightboard]'),
            { error, showDialog: true },
            ['FindDuplicatesFailed', (error && error.message) || 'NoMessage'],
          );
        }
        /** IF CAN NOT RESOLVE DUPLICATES -> EXIT */
        return;
      }
      /** do nothing if all assets skipped */
      if (idsToChange.length < 1) return;
    }
    UiBlocker.block(spinnerText);
    try {
      dispatch({ type: TYPES.ASSETS.ADD_LIGHTBOARD.START });
      await Api.addToLightboard(idsToChange, lightboardID, isMove, actions);

      dispatch({
        type: TYPES.ASSETS.ADD_LIGHTBOARD.COMPLETE,
        payload: {
          assetIDs: idsToChange,
          lightboardID,
          lightboardPath,
          isMove,
          isTeamDrive: false,
          userId: Store.getState().user._id,
        },
      });

      if (idsToChange.length > FINISH_IN_BACKGROUND_SIZE) {
        Toast(localization.DETAILS.textFinishInBg, { autoClose: false });
      } else {
        Toast(
          localization.COLLECTIONS.textFilesAddedToLightboard(
            decodeURIComponent(lightboardPath.split('→').pop()),
          ),
        );
      }
    } catch (error) {
      let text = localization.COLLECTIONS.textFilesNotAddedToLightboard(
        lightboardPath.split('→').pop(),
      );
      const errorStatus = utils.getStatusFromResponceError(error);
      if (errorStatus === 409) {
        /* if lightboard folder not found */
        text = localization.COLLECTIONS.textLightboardFolderNotFound;
      } else if (errorStatus === 403) {
        /* if no permissions */
        text = localization.NO_PERMISSION_TO_ACCESS;
      } else {
        Logger.error(new Error('Can not attach asset to lightboard'), { error }, [
          'AttachAssetToLightboardFailed',
          (error && error.message) || 'NoMessage',
        ]);
      }

      showErrorDialog(text);
      dispatch({
        type: TYPES.ASSETS.ADD_LIGHTBOARD.FAILED,
        error,
      });
    }
    UiBlocker.unblock();
  }
};

/**
 * Remove assets from lightboard
 * @param {Object} lightboard
 * @param {string} lightboard._id
 * @param {string} lightboard.path
 * @param {string[]?} _ids
 */
export const removeFromLightboard = ({ _id, path }, _ids) => (dispatch, getAll) => {
  const { items, selectedItems } = getAll().assets;
  const ids = _ids || selectedItems;

  /** Prepare text for dialog */
  const selected = items.filter((item) => ids.includes(item._id));
  const assetsToModify = selected.filter((asset) => (asset.lightboards || []).some((lb) => lb._id === _id));
  const assetsToDelete = assetsToModify.filter((asset) => {
    if (asset.tags && asset.tags.length) return false;
    if (asset.lightboards && asset.lightboards.length > 1) return false;
    return true;
  });

  const text = assetsToDelete.length
    ? localization.DETAILS.textRemoveFilesFromLightboardAndDelete
    : `${localization.DETAILS.textRemoveFilesFromLightboard(
      ids.length,
    )} <span className="highlight">'${path.split('→').pop()}'</span>?`;

  /** Show dialog */
  Logger.log('UI', 'RemoveFromLightboardConfirmDialog');
  showDialog({
    title: localization.DETAILS.titleRemove,
    text,
    textBtnCancel: localization.DIALOGS.btnCancel,
    textBtnOk: localization.DIALOGS.btnOk,
    onOk: doRemove,
  });

  async function doRemove() {
    UiBlocker.block();
    try {
      dispatch({ type: TYPES.ASSETS.REMOVE_LIGHTBOARD.START });

      const res = await Api.removeFromLightboard(ids, _id);
      const failed = (res && res.failed) || [];
      const failedIds = failed.map((asset) => asset._id);
      /** completed */
      const removedAssetIds = ids.filter((id) => !failedIds.includes(id));

      if (failed && failed.length) {
        Toast(
          localization.DETAILS.textDetachFromLightboardSomeAssetsFailed({
            count: failed.length,
            lightboard: path.slice(1),
          }),
          { autoClose: false },
        );
      } else if (ids.length > FINISH_IN_BACKGROUND_SIZE) {
        Toast(localization.DETAILS.textFinishInBg, { autoClose: false });
      }
      dispatch({
        type: TYPES.ASSETS.REMOVE_LIGHTBOARD.COMPLETE,
        payload: {
          ids: removedAssetIds,
          lightboardId: _id,
        },
      });
    } catch (error) {
      const text = localization.DETAILS.textDetachFromLightboardSomeAssetsFailed({
        count: '',
        lightboard: path.slice(1),
      });
      Toast(text, { autoClose: false });
      Logger.error(new Error('Can not remove assets from lightboard'), { error }, [
        'RemoveFromLightboardFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({
        type: TYPES.ASSETS.REMOVE_LIGHTBOARD.FAILED,
        error,
      });
    }
    UiBlocker.unblock();
  }
};

/**
 * Add keyword to assets
 * @param {string} keywordName
 * @param {string[]?} ids - assets IDs
 */
export const attachKeyword = (keywordName, ids) => async (dispatch, getAll) => {
  const selectedItems = ids || getAll().assets.selectedItems;
  const { items } = getAll().assets;
  let isEditAssetKeywordsAllowed = true;

  if (selectedItems > items.length) {
    const permissions = await Api.getAssetPermissions(selectedItems, ['editAssetKeywords']);
    // by getAssetPermissions we receive 'false', 'true' or 'mixed'.
    // So if we received 'false' or 'mixed' it means 'false'
    if (permissions.editAssetKeywords !== true) {
      isEditAssetKeywordsAllowed = false;
    }
  } else {
    // find assets without permission
    isEditAssetKeywordsAllowed = items
      .filter((item) => selectedItems.includes(item._id))
      .every((item) => item.permissions && item.permissions.editAssetKeywords);
  }

  if (!isEditAssetKeywordsAllowed) {
    showForbiddenDialog(localization.DIALOGS.WARNING_EDIT_ASSET_KEYWORDS.TEXT);
    return;
  }

  checkMultipleChanges(selectedItems.length, doAttach);

  async function doAttach() {
    try {
      dispatch({ type: TYPES.ASSETS.ATTACH_KEYWORD.START });

      /** wait for response */
      const keywords = await Api.addKeyword(selectedItems, keywordName);

      keywords.forEach((keyword) => {
        const clonedKeyword = { ...keyword };
        dispatch({
          type: TYPES.ASSETS.ATTACH_KEYWORD.COMPLETE,
          payload: {
            ids: selectedItems,
            keyword: clonedKeyword,
            userId: getAll().user._id,
          },
        });

        if (clonedKeyword.isNew) {
          clonedKeyword.isFavorite = false;
          clonedKeyword.count = selectedItems.length;

          /** call keywords action */
          addKeywordsAction([clonedKeyword])(dispatch, getAll);
        } else {
          /** call keywords action */
          updateCountAction(clonedKeyword._id, selectedItems.length)(dispatch);
          updateUsedAtAction(clonedKeyword._id, clonedKeyword.usedAt)(dispatch);
        }
        if (selectedItems.length > 1) {
          Toast(localization.DETAILS.textKeywordsSuccess);
        }
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : utils.getDataFromResponceError(error, 'msg');
      if (errorMessage) {
        Toast(errorMessage, { autoClose: false });
      } else {
        Toast(localization.DETAILS.textCantUpdateKeywords, { autoClose: false });
      }
      dispatch({ type: TYPES.ASSETS.ATTACH_KEYWORD.FAILED, error });
    }
  }
};

/**
 * Add keyword to assets immediately
 * @param {string[]} ids
 * @param {Object} keyword
 */
export const attachedKeyword = (ids, keyword, userId) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.ATTACH_KEYWORD.COMPLETE,
    payload: {
      ids,
      keyword,
      notify: true,
      userId,
    },
  });
};

/**
 * Remove keyword from assets
 * @param {string} keywordName
 * @param {string[]?} ids - assets IDs
 */
export const detachKeyword = (keywordID, ids) => (dispatch, getAll) => {
  const selectedItems = ids || getAll().assets.selectedItems;
  checkMultipleChanges(selectedItems.length, doDetach);

  async function doDetach() {
    try {
      dispatch({ type: TYPES.ASSETS.DETACH_KEYWORD.START });

      /** wait for response */
      await Api.removeKeyword(selectedItems, keywordID);
      dispatch({
        type: TYPES.ASSETS.DETACH_KEYWORD.COMPLETE,
        payload: {
          ids,
          keywordsIds: [keywordID],
          userId: Store.getState().user._id,
        },
      });
      updateCountAction(keywordID, -selectedItems.length)(dispatch);
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : utils.getDataFromResponceError(error, 'msg');
      if (errorMessage) {
        Toast(errorMessage, { autoClose: false });
      } else {
        Toast(localization.DETAILS.textCantUpdateKeywords, { autoClose: false });
      }
      dispatch({ type: TYPES.ASSETS.DETACH_KEYWORD.FAILED, error });
    }
  }
};

/**
 * Remove keyword from assets immediately
 * @param {string[]} ids
 * @param {string} keywordID
 */
export const detachedKeyword = (ids, keywordID, userId) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.DETACH_KEYWORD.COMPLETE,
    payload: {
      ids,
      keywordsIds: [keywordID],
      notify: true,
      userId,
    },
  });
};

/**
 * Rename keyword
 * @param {string} id
 * @param {string} newName
 */
export const renameKeyword = (id, newName) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.RENAME_KEYWORD,
    payload: { id, newName },
  });
};

/**
 * Rename collection
 * @param {string} id
 * @param {string} newName
 */
export const renameCollection = (id, newName) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.RENAME_COLLECTION,
    payload: { id, newName },
  });
};

/**
 * Change path
 * @param {string} oldPath
 * @param {string} newPath
 */
export const changePath = (oldPath, newPath, collectionName) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.CHANGE_PATH,
    payload: { oldPath, newPath, collectionName },
  });
};

/**
 * Delete collection - triggered when collection removed (e.g. from tree)
 * @param {string} id
 */
export const deleteCollection = (id) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.DELETE_COLLECTION,
    payload: { id },
  });
};

/**
 * Update lightboard
 * @param {string} id
 * @param {Object} data - data to update, e.g. { path: newPath}
 */
export const updateLightboard = (id, data) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.UPDATE_LIGHTBOARD,
    payload: { id, data },
  });
};

/**
 * Delete lightboard
 * @param {string} id
 */
export const deleteLightboard = (id) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.DELETE_LIGHTBOARD,
    payload: { id },
  });
};

/**
 * Remove all keywords - upload new dictionary
 */
export const removeAllKeywords = () => (dispatch) => {
  dispatch({ type: TYPES.ASSETS.REMOVE_ALL_KEYWORDS });
};

/**
 * Generate keywords for assets
 * @param {string[]} assetsIds
 */
export const generateKeywords = (assetsIds) => async (dispatch, getAll) => {
  const { assetsKeywordedPaid, assetsKeyworded } = getAll().user.team;
  const { customer } = getAll().user;
  const { user, roles, teammates } = getAll();
  const { subscription, balance } = customer;
  // eslint-disable-next-line camelcase
  let pricePer1000Keywords = 2000;
  if (subscription && subscription.metadata && subscription.metadata.pricePer1000Keywords) {
    pricePer1000Keywords = subscription.metadata.pricePer1000Keywords;
  }
  // eslint-disable-next-line camelcase
  const userBalance = balance || 0;

  const assetsLengthAllowedToKeywordingByBalance = Math.floor((Math.abs(userBalance) / pricePer1000Keywords) * 1000) || 0;
  const billingDenied = !isHaveTeammatePermission('manageBilling');
  const keywordingDenied = !isHaveTeammatePermission('manageKeywords');
  const teamManagingDenied = !isHaveTeammatePermission('manageTeam');

  const canNotBuyApiCalls = billingDenied || keywordingDenied || teamManagingDenied;

  const handleGoToBilling = () => {
    navigate('/teammates?tab=aiKeywords');
    ReactDOM.unmountComponentAtNode(document.querySelector('.wrapperDialog'));
  };

  const usersWithPermissionsToBuyApiCalls = utils.getUsersWithPermissionToBuyKeywords(user, teammates.items, roles.items);

  let totalAssetsAllowedForKeywording = assetsLengthAllowedToKeywordingByBalance + assetsKeywordedPaid - assetsKeyworded;
  // if user clicks fast, assetsKeyworded can more assetsKeywordedPaid and we receive 'minus' value
  if (totalAssetsAllowedForKeywording < 0) totalAssetsAllowedForKeywording = 0;
  Logger.log('User', 'infoPanelKeywordsAutogenerate', {
    assetsLength: assetsIds.length,
    allowedAssets: totalAssetsAllowedForKeywording,
  });

  if (totalAssetsAllowedForKeywording === 0 || totalAssetsAllowedForKeywording < assetsIds.length) {
    let html = null;
    if (totalAssetsAllowedForKeywording === 0) {
      html = localization.DETAILS.textReachedAutokeywordingLimit(
        () => handleGoToBilling(),
        canNotBuyApiCalls,
        usersWithPermissionsToBuyApiCalls,
      );
    } else {
      html = localization.DETAILS.textCantAutokeywordingForSelectedAssets(
        () => handleGoToBilling(),
        canNotBuyApiCalls,
        usersWithPermissionsToBuyApiCalls,
        totalAssetsAllowedForKeywording,
      );
    }

    return showDialog({
      title: localization.DETAILS.titleNotEnoughtCredits,
      children: html,
      dialogConfig: {
        disableCancel: false,
        disableOk: canNotBuyApiCalls,
        cancelName: localization.DIALOGS.btnCancel,
        okName: localization.DETAILS.textOpenBilling,
        onOk: canNotBuyApiCalls
          ? Function.prototype
          : () => navigate('/billing?tab=overview'),
      },
    });
  }

  try {
    dispatch({
      type: TYPES.ASSETS.GENERATE_KEYWORDS.START,
      payload: { assetsIds },
    });

    await ApiKeywords.generate(assetsIds);
    Toast(localization.DETAILS.textKeywordsGeneration, { autoClose: false });
  } catch (error) {
    dispatch({
      type: TYPES.ASSETS.GENERATE_KEYWORDS.FAILED,
      payload: { assetsIds },
      error,
    });

    let title;
    let html;
    let onOk;
    let disableOk;
    let cancelName;

    if (utils.getDataFromResponceError(error, 'error') === 'NOT_ENOUGH_CREDITS') {
      cancelName = localization.DIALOGS.btnCancel;
      title = localization.DETAILS.titleNotEnoughtCredits;
      html = localization.DETAILS.textNotEnoughtCredits;
      disableOk = false;
      onOk = () => navigate('/billing?tab=overview');

      if (canNotBuyApiCalls) {
        disableOk = true;
        cancelName = localization.DIALOGS.btnOk;
        html += localization.DETAILS.textReachedAutokeywordingLimit(
          () => handleGoToBilling(),
          canNotBuyApiCalls,
          usersWithPermissionsToBuyApiCalls,
        );
      } else {
        html += localization.DETAILS.textReachedAutokeywordingLimit(
          () => handleGoToBilling(),
        );
      }
    } else {
      title = localization.DETAILS.titleNotEnoughtCredits;
      html = localization.DETAILS.textNotEnoughtCreditsForKeywording(() => handleGoToBilling());
      disableOk = true;
      onOk = Function.prototype;
    }

    showDialog({
      title,
      children: html,
      dialogConfig: {
        disableCancel: false,
        disableOk,
        cancelName,
        okName: localization.DETAILS.textOpenBilling,
        onOk,
      },
    });
    Logger.error(new Error('Error generate keywords'), { error }, [
      'GenerateKeywordsFailed',
      (error && error.message) || 'NoMessage',
    ]);
  }
};

export const keywordsGenerated = (keywordedAssets) => (dispatch, getAll) => {
  dispatch({
    type: TYPES.ASSETS.GENERATE_KEYWORDS.COMPLETE,
    payload: { keywordedAssets },
  });

  // update team.assetsKeyworded when receive event ['assets.keywording.complete']
  if (keywordedAssets.length) {
    const { team } = getAll().user;
    updateTeamValue('assetsKeyworded', team.assetsKeyworded + keywordedAssets.length)(dispatch);
  }
};

/**
 * Assign user to assets
 * @param {string} assigneeId
 * @param {string[]?} ids - assets ids
 */
export const assignUser = (assigneeId, ids) => (dispatch, getAll) => {
  const selectedItems = ids || getAll().assets.selectedItems;
  checkMultipleChanges(selectedItems.length, doAssign);

  async function doAssign() {
    try {
      dispatch({ type: TYPES.ASSETS.ASSIGN_USER.START });

      /** wait for response */
      await Api.assignUser(assigneeId, selectedItems);

      dispatch({
        type: TYPES.ASSETS.ASSIGN_USER.COMPLETE,
        payload: { assigneeId, ids },
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : utils.getDataFromResponceError(error, 'msg');
      if (errorMessage) {
        Toast(errorMessage, { autoClose: false });
      } else {
        Toast(localization.DETAILS.textCantUpdateAssignees(ids.length), { autoClose: false });
      }
      Logger.error(new Error('Error assing user'), { error }, [
        'AssignUserFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({ type: TYPES.ASSETS.ASSIGN_USER.FAILED, error });
    }
  }
};

/**
 * Assign user to assets immediately
 * @param {string[]} ids
 * @param {string} value
 */
export const assignedUser = (ids, assigneeId) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.ASSIGN_USER.COMPLETE,
    payload: { assigneeId, ids, notify: true },
  });
};

/**
 * unAssign user from assets
 * @param {string} assigneeId
 * @param {string[]?} ids - assets ids
 */
export const unAssignUser = (assigneeId, ids) => (dispatch, getAll) => {
  const selectedItems = ids || getAll().assets.selectedItems;
  checkMultipleChanges(selectedItems.length, doUnAssign);

  async function doUnAssign() {
    try {
      dispatch({ type: TYPES.ASSETS.UNASSIGN_USER.START });

      /** wait for response */
      await Api.unAssignUser(assigneeId, selectedItems);

      dispatch({
        type: TYPES.ASSETS.UNASSIGN_USER.COMPLETE,
        payload: { assigneeId, ids },
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : utils.getDataFromResponceError(error, 'msg');
      if (errorMessage) {
        Toast(errorMessage, { autoClose: false });
      } else {
        Toast(localization.DETAILS.textCantUpdateAssignees, { autoClose: false });
      }
      Logger.error(new Error('Error unassing user'), { error }, [
        'UnassignUserFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({ type: TYPES.ASSETS.UNASSIGN_USER.FAILED, error });
    }
  }
};

/**
 * unAssign user to assets immediately
 * @param {string[]} ids
 * @param {string} value
 */
export const unAssignedUser = (ids, assigneeId) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.UNASSIGN_USER.COMPLETE,
    payload: { assigneeId, ids, notify: true },
  });
};

/**
 * Change flag on assets
 * @param {string[]} ids
 * @param {string?} value
 */
export const changeFlag = (ids, value) => (dispatch, getAll) => {
  checkMultipleChanges(ids.length, doChange);

  async function doChange() {
    try {
      if (value === undefined || !['flagged', 'unflagged', 'rejected'].includes(value)) {
        const { items } = getAll().assets;
        const item = items.find((item) => item._id === ids[0]);
        if (item) {
          // determine next flag value
          // we use this while click flag on tile
          switch (item.flag) {
          case 'rejected':
            value = 'flagged';
            break;
          case 'flagged':
            value = 'unflagged';
            break;
          default:
            value = 'rejected';
          }
        } else {
          value = 'rejected';
        }
      }
      dispatch({
        type: TYPES.ASSETS.CHANGE_FLAG.START,
        payload: {
          ids,
          keys: ['flag'],
          values: [value],
          userId: Store.getState().user._id,
        },
      });

      await Api.setFlag(ids, value);

      dispatch({
        type: TYPES.ASSETS.CHANGE_FLAG.COMPLETE,
        payload: {
          ids,
          keys: ['flag'],
          values: [value],
          userId: Store.getState().user._id,
        },
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : localization.DETAILS.textCantUpdate('flags');
      Toast(errorMessage, { autoClose: false });
      Logger.error(new Error('Error change flag'), { error }, [
        'ChangeFlagFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({ type: TYPES.ASSETS.CHANGE_FLAG.FAILED, error });
    }
  }
};

/**
 * Change flag on assets immediately
 * @param {string[]} ids
 * @param {string} value
 */
export const changedFlag = (ids, value, userId) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.CHANGE_FLAG.COMPLETE,
    payload: {
      ids,
      keys: ['flag'],
      values: [value],
      eventType: 'flag',
      userId,
    },
  });
};

/**
 * Change stars on assets
 * @param {string[]} ids
 * @param {number} value - must be from 0 to 5
 */
export const changeRating = (ids, value) => (dispatch) => {
  checkMultipleChanges(ids.length, doChange);

  async function doChange() {
    try {
      dispatch({
        type: TYPES.ASSETS.CHANGE_STARS.START,
        payload: {
          ids,
          keys: ['rating'],
          values: [value],
          userId: Store.getState().user._id,
        },
      });

      await Api.setRating(ids, value);

      dispatch({
        type: TYPES.ASSETS.CHANGE_STARS.COMPLETE,
        payload: {
          ids,
          keys: ['rating'],
          values: [value],
          userId: Store.getState().user._id,
        },
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : localization.DETAILS.textCantUpdate('rating');
      Toast(errorMessage, { autoClose: false });
      Logger.error(new Error('Error change rating'), { error }, [
        'ChangeRatingFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({ type: TYPES.ASSETS.CHANGE_STARS.FAILED, error });
    }
  }
};

/**
 * Change stars on assets immediately
 * @param {string[]} ids
 * @param {string} value
 */
export const changedRating = (ids, value, userId) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.CHANGE_STARS.COMPLETE,
    payload: {
      ids,
      keys: ['rating'],
      values: [value],
      eventType: 'rating',
      userId,
    },
  });
};

/**
 * Change color on assets
 * @param {string[]} ids
 * @param {string} value - must be one of "red | yellow | green | blue | purple | nocolor"
 */
export const changeColor = (ids, value) => (dispatch) => {
  checkMultipleChanges(ids.length, doChange);

  async function doChange() {
    try {
      dispatch({
        type: TYPES.ASSETS.CHANGE_COLOR.START,
        payload: {
          ids,
          keys: ['color'],
          values: [value],
          userId: Store.getState().user._id,
        },
      });

      await Api.setColor(ids, value);

      dispatch({
        type: TYPES.ASSETS.CHANGE_COLOR.COMPLETE,
        payload: {
          ids,
          keys: ['color'],
          values: [value],
          userId: Store.getState().user._id,
        },
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : localization.DETAILS.textCantUpdate('color');
      Toast(errorMessage, { autoClose: false });
      Logger.error(new Error('Error change color'), { error }, [
        'ChangeColorFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({ type: TYPES.ASSETS.CHANGE_COLOR.FAILED, error });
    }
  }
};

/**
 * Change color on assets immediately
 * @param {string[]} ids
 * @param {string} value
 */
export const changedColor = (ids, value, userId) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.CHANGE_COLOR.COMPLETE,
    payload: {
      ids,
      keys: ['color'],
      values: [value],
      eventType: 'color',
      userId,
    },
  });
};

/**
 * Reset asset highlight
 * @param {string[]} ids
 */
export const resetHighlight = (ids) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.RESET_HIGHLIGHT,
    payload: {
      ids,
      keys: ['paramsForHighlight'],
      values: [[]],
    },
  });
};

/**
 * @param {string} id
 * @param {string} name
 */
export const rename = (id, name) => async (dispatch) => {
  dispatch({ type: TYPES.ASSETS.RENAME.START });
  try {
    await sdk.assets.rename(id, name);
    dispatch({
      type: TYPES.ASSETS.RENAME.COMPLETE,
      payload: {
        id,
        name,
      },
    });
  } catch (error) {
    dispatch({
      type: TYPES.ASSETS.RENAME.FAILED,
      error,
    });
    const errorStatus = utils.getStatusFromResponceError(error);
    const subcode = utils.getDataFromResponceError(error, 'subcode');
    const { UNABLE_TO_RENAME_ASSET, ERROR_RENAME_ASSET } = localization.DIALOGS;

    if (subcode === 'MissingCanRenameGoogleDriveCapabilityError') {
      const hideDialog = showDialog({
        title: ERROR_RENAME_ASSET.TITLE,
        children: ERROR_RENAME_ASSET.TEXT(() => {
          navigate('/storage');
          hideDialog();
        }),
        textBtnCancel: null,
        async onOk() {
          Logger.log('User', 'Rename faile');
        },
      });
    } else if (errorStatus === 400) {
      showDialog({
        title: UNABLE_TO_RENAME_ASSET.TITLE,
        text: UNABLE_TO_RENAME_ASSET.TEXT,
        textBtnCancel: null,
        async onOk() {
          Logger.log('User', 'Rename faile');
        },
      });
    } else {
      Toast(localization.DETAILS.textCantUpdateAssetName, { autoClose: false });
    }
    Logger.error(new Error('Error rename asset'), { error }, [
      'RenameAssetFailed',
      (error && error.message) || 'NoMessage',
    ]);
  }
};

/**
 * Asset renamed on the server
 * @param {string} id - asset id
 * @param {string} name - new name
 */
export const renamed = (id, name) => async (dispatch) => dispatch({
  type: TYPES.ASSETS.RENAME.COMPLETE,
  payload: { id, name },
});

/**
 * Change title on assets
 * @param {string[]} ids
 * @param {string} title
 * @param {Function} onCancel
 */
export const changeTitle = (ids, title, onCancel) => (dispatch) => {
  checkMultipleChanges(ids.length, doChange, onCancel);

  async function doChange() {
    try {
      dispatch({ type: TYPES.ASSETS.CHANGE_TITLE.START });

      await Api.setTitle(ids, title);

      dispatch({
        type: TYPES.ASSETS.CHANGE_TITLE.COMPLETE,
        payload: { ids, title, userId: Store.getState().user._id },
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : localization.DETAILS.textCantUpdate('title');
      Toast(errorMessage, { autoClose: false });
      dispatch({ type: TYPES.ASSETS.CHANGE_TITLE.FAILED, error });
      Logger.error(new Error('Error change title'), { error }, [
        'ChangeTitleFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  }
};

/**
 * Change description on assets
 * @param {string[]} ids
 * @param {string} description
 * @param {Function} onCancel
 */
export const changeDescription = (ids, description, onCancel) => (dispatch) => {
  checkMultipleChanges(ids.length, doChange, onCancel);

  async function doChange() {
    try {
      dispatch({ type: TYPES.ASSETS.CHANGE_DESCRIPTION.START });

      await Api.setDescription(ids, description);

      dispatch({
        type: TYPES.ASSETS.CHANGE_DESCRIPTION.COMPLETE,
        payload: { ids, description, userId: Store.getState().user._id },
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : localization.DETAILS.textCantUpdate('description');
      Toast(errorMessage, { autoClose: false });
      dispatch({ type: TYPES.ASSETS.CHANGE_DESCRIPTION.FAILED, error });
      Logger.error(new Error('Error change description'), { error }, [
        'ChangeDescriptionFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  }
};

/**
 * Change custom field
 * @param {string[]} ids
 * @param {string} title
 * @param {string} type
 * @param {string?} visibility
 * @param {*} value
 * @param {Function} onCancel
 */
export const changeCustomField = ({
  ids,
  title,
  type,
  visibility,
  value,
  onCancel,
  multiple = false,
  isAttach,
}) => (dispatch) => {
  checkMultipleChanges(ids.length, doChange, onCancel);

  async function doChange() {
    try {
      dispatch({
        type: TYPES.ASSETS.CHANGE_CUSTOM_FIELD.START,
        payload: {
          title,
        },
      });

      if (multiple) {
        if (isAttach) {
          await Api.attachMultipleCustomField(ids, title, type, value);

          dispatch({
            type: TYPES.ASSETS.CHANGE_MULTIPLE_CUSTOM_FIELD.ATTACH,
            payload: {
              ids,
              title,
              value,
              userId: Store.getState().user._id,
            },
          });
        } else {
          await Api.detachMultipleCustomField(ids, title, type, value);

          dispatch({
            type: TYPES.ASSETS.CHANGE_MULTIPLE_CUSTOM_FIELD.DETACH,
            payload: {
              ids,
              title,
              value,
              userId: Store.getState().user._id,
            },
          });
        }
      } else {
        await Api.patchCustomField(ids, title, type, visibility, value);

        dispatch({
          type: TYPES.ASSETS.CHANGE_CUSTOM_FIELD.COMPLETE,
          payload: {
            ids,
            title,
            value,
            userId: Store.getState().user._id,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: TYPES.ASSETS.CHANGE_CUSTOM_FIELD.FAILED,
        payload: {
          title,
        },
        error,
      });

      const errorStatus = utils.getStatusFromResponceError(error);
      const errorMessage = errorStatus === 403
        ? localization.NO_PERMISSION_TO_ACCESS
        : utils.getDataFromResponceError(error, 'msg');
      if (errorMessage) {
        Toast(errorMessage, { autoClose: false });
      } else {
        Toast(localization.DETAILS.textCantUpdate(title), { autoClose: false });
      }
      Logger.error(new Error('Error change custom field'), { error }, [
        'ChangeCustomFieldFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  }
};

/**
 * @param {string} assetId
 * @param {data} data - approval data
 */
export const updateApprove = (assetId, data) => async (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.UPDATE_APPROVE,
    payload: { assetId, data },
  });
};

/**
 * Set user orientation
 * @param {string[]} ids
 * @param {number} value.rotation - one of: 0 | 90 | 180 | 270
 * @param {boolean} value.flipX
 * @param {boolean} value.flipY
 */
export const setUserOrientation = (ids, value) => (dispatch) => {
  checkMultipleChanges(ids.length, doChange);

  async function doChange() {
    try {
      dispatch({
        type: TYPES.ASSETS.SET_USER_ORIENTATION.START,
        payload: { ids, value },
      });

      await Api.setUserOrientation(ids, value);

      dispatch({
        type: TYPES.ASSETS.SET_USER_ORIENTATION.COMPLETE,
        payload: { ids, value },
      });
    } catch (error) {
      Toast(localization.DETAILS.textCantUpdate('orientaion'), { autoClose: false });
      dispatch({ type: TYPES.ASSETS.SET_USER_ORIENTATION.FAILED, error });
      Logger.error(new Error('Error set user orientation'), { error }, [
        'SetUserOrientationFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  }
};

/**
 * Change sharing settings
 * @param {string} id - asset id
 * @param {string} key
 * @param {*} value
 */
export const changeShare = (id, key, value) => async (dispatch, getAll) => {
  const asset = getAll().assets.items.find((item) => item._id === id);

  if (asset) {
    try {
      dispatch({ type: TYPES.ASSETS.SHARE.START });

      const response = await Api.setSingleAssetSharingSettings(id, {
        [key]: value,
      });
      const { singleSharingSettings } = response.asset;
      const data = {
        ...singleSharingSettings,
        isProtected: !!singleSharingSettings.isProtected,
      };

      if (key === 'isShared') {
        data.isShared = value;
      }

      dispatch({
        type: TYPES.ASSETS.SHARE.COMPLETE,
        payload: {
          assetId: id,
          data,
        },
      });
    } catch (error) {
      const text = localization.DETAILS.textCantSetSingleAssetSettings;

      const errorStatus = utils.getStatusFromResponceError(error);
      const subcode = utils.getDataFromResponceError(error, 'subcode');
      const { ERROR_PLAN_LIMIT } = localization.DIALOGS;

      if (errorStatus === 409 && subcode === 'AssetSharingLimitExceededError') {
        showDialog({
          title: ERROR_PLAN_LIMIT.TITLE,
          text: ERROR_PLAN_LIMIT.TEXT,
          textBtnOk: ERROR_PLAN_LIMIT.OK_TEXT,
          textBtnCancel: null,
          async onOk() {
            navigate('/billing?tab=overview');
          },
        });
      } else {
        Toast(text, { autoClose: false });
      }

      dispatch({ type: TYPES.ASSETS.SHARE.FAILED, error });
      Logger.error(new Error('Can not set single sharing settings'), { error }, [
        'ShareAssetFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  }
};

/**
 * Change restrict settings
 * @param {string[]?} iDs - ids
 * @param {Object} value
 */
export const changeRestrict = (iDs, value) => async (dispatch, getAll) => {
  let ids = iDs;
  const assetsStore = getAll().assets;
  if (ids === undefined) ids = assetsStore.selectedItems;
  checkMultipleChanges(ids.length, doChange);

  async function doChange() {
    try {
      dispatch({ type: TYPES.ASSETS.RESTRICT.START, payload: { ids } });

      const result = await Api.setAssetsRestrictSettings(ids, value);
      if (result) {
        dispatch({
          type: TYPES.ASSETS.RESTRICT.COMPLETE,
          payload: { ids, value },
        });
      }
    } catch (error) {
      dispatch({
        type: TYPES.ASSETS.RESTRICT.FAILED,
        error,
      });
      Toast(localization.RESTRICT.cantRestrict(ids.length), { autoClose: false });
      Logger.error(new Error('Can not restrict assets'), { error }, [
        'RestrictAssetsFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  }
};

/**
 * Move assets to trash
 * @param {string[]?} iDs - ids
 */
export const trashAssets = (iDs) => (dispatch, getAll) => {
  let ids = iDs;
  const assetsStore = getAll().assets;
  if (ids === undefined) ids = assetsStore.selectedItems;

  Logger.log('UI', 'MoveAssetsToTrashDialog', ids.length);
  const { MOVE_TO_TRASH } = localization.DIALOGS;
  showDialog({
    title: MOVE_TO_TRASH.TITLE,
    text: MOVE_TO_TRASH.TEXT(ids.length),
    onCancel: () => {
      Logger.log('User', 'MoveAssetsToTrashDialogCancel');
    },
    async onOk() {
      Logger.log('User', 'MoveAssetsToTrashDialogOk', ids.length);
      try {
        dispatch({ type: TYPES.ASSETS.DELETE_ASSETS.START, payload: { ids } });
        // throw new Error('You have a limited access to this file in Google Drive,
        // which means you can\'t trash this asset in Picsio either. ');
        UiBlocker.block();
        const { data } = await sdk.assets.trash(ids);
        const {
          queued, successful = [], failed = [], failedAssets = [],
        } = data;

        dispatch({
          type: TYPES.ASSETS.DELETE_ASSETS.COMPLETE,
          payload: { ids: successful, queued },
        });

        if (failed.length) {
          const { failedGDArr, failedOtherArr } = sortFailed(failedAssets, 'MissingCanTrashGoogleDriveCapabilityError');

          if (failedGDArr.length) {
            const hideDialog = showDialog({
              title: localization.DIALOGS.ERROR_TRASH_DIALOG.TITLE,
              children: ids.length > 1
                ? localization.DIALOGS.ERROR_TRASH_DIALOG.TEXT_ASSET_BULK_OPERATION(
                  successful.length,
                  failedGDArr.length,
                  () => {
                    navigate('/storage');
                    hideDialog();
                  },
                )
                : localization.DIALOGS.ERROR_TRASH_DIALOG.TEXT_ASSET_ONE_OPERATION(
                  () => {
                    navigate('/storage');
                    hideDialog();
                  },
                ),
              textBtnCancel: null,
            });
          }

          if (failedOtherArr.length) {
            Toast(
              localization.DETAILS.textCantDeleteAsset(failedOtherArr.length),
              { autoClose: false },
            );
          }

          dispatch({
            type: TYPES.ASSETS.DELETE_ASSETS.FAILED,
            payload: { ids: failed },
          });
        }

        if (queued) {
          Toast(localization.DETAILS.textFinishInBg, { autoClose: false });
        } else {
          changeCountCollectionsAction(-successful.length)(dispatch);
        }
      } catch (error) {
        dispatch({
          type: TYPES.ASSETS.DELETE_ASSETS.FAILED,
          payload: { ids },
          error,
        });
        Toast(localization.DETAILS.textCantRemoveAsset(ids.length), { autoClose: false });
        Logger.error(new Error('Can not delete assets'), { error }, [
          'DeleteAssetsFailed',
          (error && error.message) || 'NoMessage',
        ]);
      } finally {
        UiBlocker.unblock();
      }
    },
  });
};

/**
 * Attach comment to asset
 * @param {string} target - collection id where new asset will come
 * @param {boolean} resolveDuplicates
 * @param {boolean} overwriteDuplicates
 * @param {string} id - original asset id
 */
export const duplicateAsset = (id, target, resolveDuplicates, overwriteDuplicates) => async (dispatch, getAll) => {
  const assetsStore = getAll().assets;
  const { _id: activeCollectionID } = getAll().collections.activeCollection;

  Logger.log('User', 'DuplicateAsset', id);
  const { tagId } = getAll().router.location.query;
  try {
    UiBlocker.block();
    const original = assetsStore.items.find(({ _id }) => id === _id);
    let { _id: targetCollectionId } = original.tags.length > 0 && original.tags[0];
    if (!targetCollectionId) {
      targetCollectionId = tagId || activeCollectionID;
    }
    const { archived } = original;
    let { data: result } = await sdk.assets.copy(id, target, resolveDuplicates,
      overwriteDuplicates, archived);

    result = { ...original, ...result, comments: [] };
    if (activeCollectionID === target) {
      dispatch({
        type: TYPES.ASSETS.FETCH.COMPLETE,
        payload: {
          full: assetsStore.full,
          total: assetsStore.total + 1,
          items: [result],
        },
      });
    }

    UiBlocker.unblock();
  } catch (error) {
    const errorStatus = utils.getStatusFromResponceError(error);
    const subcode = utils.getDataFromResponceError(error, 'subcode');
    const { ERROR_COPY_ASSET } = localization.DIALOGS;
    Logger.log('ErrorStatus', errorStatus);

    if (subcode === 'MissingCanCopyGoogleDriveCapabilityError'
      || subcode === 'MissingCanAddChildrenGoogleDriveCapabilityError') {
      const hideDialog = showDialog({
        title: ERROR_COPY_ASSET.TITLE,
        children: ERROR_COPY_ASSET.TEXT(() => {
          navigate('/storage');
          hideDialog();
        }),
        textBtnCancel: null,
        async onOk() {
          Logger.log('User', 'Copy faile');
        },
      });
    } else {
      Toast(localization.DETAILS.textAssetDuplicateFail, { autoClose: false });
    }

    Logger.error(new Error('Can not duplicate asset'), { error }, [
      'RestrictAssetsFailed',
      (error && error.message) || 'NoMessage',
    ]);
    UiBlocker.unblock();
  }
};

/**
 * Attach comment to asset
 * @param {object} comment - new comment to asset
 * @param {string} assetId - commented asset id
 */
export const attachCommentToAsset = (comment, assetId) => async (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.ATTACH_COMMENT,
    payload: {
      comment,
      assetId,
    },
  });
};

/**
 * Remove not found assets
 * @param {string[]?} iDs - ids
 */
export const removeNotFoundAssets = (iDs) => async (dispatch, getAll) => {
  let ids = iDs;
  const assetsStore = getAll().assets;
  if (ids === undefined) ids = assetsStore.selectedItems;

  function handleSuccess() {
    dispatch({
      type: TYPES.ASSETS.DELETE_ASSETS.COMPLETE,
      payload: { ids },
    });
    changeCountCollectionsAction(-ids.length)(dispatch);
  }

  UiBlocker.block();
  try {
    dispatch({ type: TYPES.ASSETS.DELETE_ASSETS.START, payload: { ids } });

    const result = await Api.deleteAssets(ids);
    if (result.queued) {
      Toast(localization.DETAILS.textFinishInBg, { autoClose: false });
    } else {
      handleSuccess();
    }
  } catch (error) {
    const errorStatus = utils.getStatusFromResponceError(error);
    if (errorStatus === 410) {
      /** Already deleted in GD -> status === 410 */
      handleSuccess();
    } else {
      dispatch({
        type: TYPES.ASSETS.DELETE_ASSETS.FAILED,
        payload: { ids },
        error,
      });
      Toast(localization.DETAILS.textCantRemoveAsset(ids.length), { autoClose: false });
      Logger.error(new Error('Can not remove not found assets'), { error }, [
        'RemoveNotFoundAssetsFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  } finally {
    UiBlocker.unblock();
  }
};

/**
 * Deleted files immediately
 * @param {String[]} ids
 */
export const deletedAssets = (ids) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.DELETE_ASSETS.COMPLETE,
    payload: { ids },
  });
};

/**
 * Set "trashing" field to "waiting"
 * @param {String[]} ids
 */
export const setTrashing = (ids, fieldName = CONSTANTS.TRASHING_STATUS_FIELD_NAME) => (
  dispatch,
) => {
  dispatch({
    type: TYPES.ASSETS.DELETE_ASSETS.START,
    payload: { ids, fieldName },
  });
};

/**
 * Set moving asset status
 * @param {string[]} ids
 * @param {string} status
 */
export const setMoving = (ids, status) => (dispatch) => {
  const type = getDispatchTypeByAsyncStatus(status);
  dispatch({
    type: TYPES.ASSETS.MOVING_ASSETS[type],
    payload: { ids },
  });
};

/**
 * Set "untrashing" field
 * @param {String[]} ids
 * @param {String} status - async job status [waiting, complete, failed]
 */
export const setUntrashing = (ids, status) => (dispatch) => {
  const type = getDispatchTypeByAsyncStatus(status);
  dispatch({
    type: TYPES.ASSETS.RESTORE_ASSETS[type],
    payload: { ids },
  });
};

/**
 * Restore assets from trash
 * @param {string[]} ids
 */
export const restoreAssets = (ids) => async (dispatch, getAll) => {
  const store = getAll();
  const { collections } = store.collections;
  const { items: assetsInStore } = store.assets;
  const isUserOnS3 = store.user.team.storageType === 's3';
  showSelectFromTreeDialog({
    title: 'Select collection to restore',
    treeListItems: [collections.my] || [],
    onLoadChildren: (item) => getChildrenCollectionsAction(item._id)(dispatch),
    onOk,
    openedItems: [collections.my._id],
    type: 'default',
  });

  async function onOk(selectedCollections) {
    const collectionId = selectedCollections[0];
    let idsToRestore = ids;
    let actions;

    if (isUserOnS3) {
      /** Check duplicated filenames */
      try {
        let assets;
        if (assetsInStore.length < ids.length) {
          const res = await Api.getAssetsBySchemaForSearchQuery({ _id: 1, name: 1 });
          assets = res.images;
        } else {
          assets = assetsInStore;
        }
        const assetsToRestore = assets.filter((a) => ids.includes(a._id));
        const resolveResult = await findAndResolveDuplicates({
          assets: assetsToRestore,
          collectionId,
        });
        idsToRestore = resolveResult.assets.map((a) => a._id);
        actions = resolveResult.actions;
      } catch (error) {
        /** if "Too many items to analyze" ( more than 10 000 ) */
        const errorStatus = utils.getStatusFromResponceError(error);
        if (errorStatus === 413) {
          const { TITLE, TEXT, CANCEL_TEXT } = localization.DIALOGS.LIMIT_CHECK_DUPLICATES;
          showDialog({
            title: TITLE,
            text: TEXT,
            textBtnCancel: CANCEL_TEXT,
            textBtnOk: null,
            style: { maxWidth: 600 },
          });
        } else {
          Logger.error(
            new Error('Can not find duplicates on the server [Restore from trash]'),
            { error, showDialog: true },
            ['FindDuplicatesFailed', (error && error.message) || 'NoMessage'],
          );
        }
        /** IF CAN NOT RESOLVE DUPLICATES -> EXIT */
        return;
      }
      /** do nothing if all assets skipped */
      if (idsToRestore.length < 1) return;
    }
    try {
      /** Restore assets */
      UiBlocker.block();
      dispatch({
        type: TYPES.ASSETS.RESTORE_ASSETS.START,
        payload: { ids: idsToRestore },
      });

      const { data } = await sdk.assets.untrash(idsToRestore, collectionId, actions);

      const {
        queued, successful = [], failed = [], failedAssets = [],
      } = data;

      if (failed.length) {
        const { failedGDArr, failedOtherArr } = sortFailed(failedAssets, 'MissingCanUntrashGoogleDriveCapabilityError');

        if (failedGDArr.length) {
          const hideDialog = showDialog({
            title: localization.DIALOGS.ERROR_UNTRASH_DIALOG.TITLE,
            children: ids.length > 1
              ? localization.DIALOGS.ERROR_UNTRASH_DIALOG.TEXT_ASSET_BULK_OPERATION(
                successful.length, failedGDArr.length, () => {
                  navigate('/storage');
                  hideDialog();
                },
              )
              : localization.DIALOGS.ERROR_UNTRASH_DIALOG.TEXT_ASSET_ONE_OPERATION(
                () => {
                  navigate('/storage');
                  hideDialog();
                },
              ),
            textBtnCancel: null,
          });
        }

        if (failedOtherArr.length) {
          Toast(
            localization.DETAILS.textCantRestoreAsset(failedOtherArr.length),
            { autoClose: false },
          );
        }

        dispatch({
          type: TYPES.ASSETS.RESTORE_ASSETS.FAILED,
          payload: { ids: failed },
        });
      }

      if (queued) {
        Toast(localization.DETAILS.textFinishInBg, { autoClose: false });
      } else {
        dispatch({
          type: TYPES.ASSETS.RESTORE_ASSETS.COMPLETE,
          payload: { ids: successful },
        });
      }
    } catch (error) {
      Logger.error(new Error('Error restore assets'), { error }, [
        'RestoreAssetFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({
        type: TYPES.ASSETS.RESTORE_ASSETS.FAILED,
        payload: { ids: idsToRestore },
        error,
      });
    }
    UiBlocker.unblock();
  }
};

/** Delete assets without trash */
export const deleteAssets = (ids, deleteWithoutTrash) => async (dispatch) => {
  function handleSuccess(assets) {
    dispatch({
      type: TYPES.ASSETS.DELETE_ASSETS.COMPLETE,
      payload: { ids: assets },
    });
  }
  showDialog({
    title: deleteWithoutTrash ? `Delete file${ids.length > 1 ? 's' : ''}` : 'Delete from trash',
    text: deleteWithoutTrash
      ? `<div>This operation will remove ${ids.length} assets from your connected cloud storage and Pics.io.</div>`
      : `<div>This operation will remove ${ids.length} assets from your connected cloud storage and Pics.io trash.</div>`,
    onCancel: () => {
      Logger.log('User', 'DeleteAssetsFromTrashDialogCancel');
    },
    async onOk() {
      Logger.log('User', 'DeleteAssetsFromTrashDialogOk', ids.length);
      try {
        dispatch({
          type: TYPES.ASSETS.DELETE_ASSETS.START,
          payload: { ids, fieldName: CONSTANTS.DELETING_STATUS_FIELD_NAME },
        });
        UiBlocker.block();

        const result = await Api.deleteAssets(ids);

        const {
          queued, successful = [], failed = [], failedAssets = [],
        } = result;

        if (failed.length) {
          const { failedGDArr, failedOtherArr } = sortFailed(failedAssets, 'MissingCanDeleteGoogleDriveCapabilityError');

          if (failedGDArr.length) {
            const hideDialog = showDialog({
              title: localization.DIALOGS.ERROR_DELETE_DIALOG.TITLE,
              children: ids.length > 1
                ? localization.DIALOGS.ERROR_DELETE_DIALOG.TEXT_ASSET_BULK_OPERATION(
                  successful.length, failed.length, () => {
                    navigate('/storage');
                    hideDialog();
                  },
                )
                : localization.DIALOGS.ERROR_DELETE_DIALOG.TEXT_ASSET_ONE_OPERATION(
                  () => {
                    navigate('/storage');
                    hideDialog();
                  },
                ),
              textBtnCancel: null,
            });
          }

          if (failedOtherArr.length) {
            Toast(
              localization.DETAILS.textCantDeleteAsset(failedOtherArr.length),
              { autoClose: false },
            );
          }

          dispatch({
            type: TYPES.ASSETS.DELETE_ASSETS.FAILED,
            payload: { ids: failed },
          });
        }

        if (queued) {
          Toast(localization.DETAILS.textFinishInBg, { autoClose: false });
        } else {
          handleSuccess(successful);
        }
      } catch (error) {
        const errorStatus = utils.getStatusFromResponceError(error);
        if (errorStatus === 410) {
          /** Already deleted in GD -> status === 410 */
          handleSuccess(ids);
        } else {
          dispatch({
            type: TYPES.ASSETS.DELETE_ASSETS.FAILED,
            payload: { ids },
            error,
          });
          Toast(localization.DETAILS.textCantDeleteAsset(ids.length), { autoClose: false });
          Logger.error(new Error('Can not delete from trash'), { error, assetIds: ids }, [
            'DeleteAssetFromTrashFailed',
            (error && error.message) || 'NoMessage',
          ]);
        }
      }
      UiBlocker.unblock();
    },
  });
};

/**
 * Add revision
 * @param {Object} data
 */
export const addRevision = ({
  assetId,
  headRevisionId,
  imageMediaMetadata,
  thumbnailLink,
}) => async (dispatch, getAll) => {
  dispatch({
    type: TYPES.ASSETS.ADD_REVISION.COMPLETE,
    payload: {
      assetId,
      headRevisionId,
      imageMediaMetadata,
      thumbnailLink,
      userId: Store.getState().user._id,
    },
  });
  getThumbnails([assetId])(dispatch, getAll);
};

/**
 * Notify user about changes more than CONFIRM_CHANGES_SIZE assets
 * @param {number} assetsLength
 * @param {Function} onOk
 * @param {Function?} onCancel
 */
function checkMultipleChanges(assetsLength, onOk, onCancel = Function.prototype) {
  const isDialogHidden = utils.getCookie('picsio.multipleChangesDialogHidden') || false;
  if (assetsLength > CONFIRM_CHANGES_MASS_SIZE) {
    Logger.log('UI', 'MassChangesInfoDialog');
    showDialog({
      title: localization.DETAILS.titleWarning,
      text: localization.DETAILS.textAreYouRealySure,
      textBtnCancel: null,
      textBtnOk: localization.DIALOGS.btnOk,
      onOk: () => {},
      onCancel,
    });
  } else if (assetsLength > CONFIRM_CHANGES_SIZE && !isDialogHidden) {
    Logger.log('UI', 'MultipleChangesConfirmDialog');

    showDialog({
      title: localization.DETAILS.titleConfirm,
      text: localization.DETAILS.textAreYouSure(assetsLength),
      textBtnCancel: localization.DIALOGS.btnCancel,
      textBtnOk: localization.DIALOGS.btnOk,
      checkbox: {
        label: localization.DETAILS.labelCheckboxDontShow,
      },
      onOk: (data) => {
        Logger.log('User', 'MultipleChangesConfirmDialogOk', data.checkbox);
        utils.setCookie('picsio.multipleChangesDialogHidden', data.checkbox);
        onOk();
      },
      onCancel: () => {
        Logger.log('User', 'MultipleChangesConfirmDialogCancel');
        onCancel();
      },
    });
  } else {
    onOk();
  }
}

/**
 * Notify user about missing permissions
 * @param {string} text
 */
function showForbiddenDialog(text) {
  Logger.log('UI', 'ForbiddenDialog', text);
  showDialog({
    title: localization.DIALOGS.WARNING_EDIT_ASSET_COLLECTIONS.TITLE,
    text,
    textBtnCancel: null,
    textBtnOk: localization.DIALOGS.btnOk,
    onCancel: () => {},
    onOk: () => {},
  });
}

/**
 * Change upload revision progress
 * @param {string} assetID
 * @param {number} value
 */
export const changeUploadRevisionProgress = (assetID, value) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.CHANGE_UPLOAD_REVISION_PROGRESS,
    payload: {
      assetID,
      value,
    },
  });
};

/**
 * Update asset field
 * @param {string} assetID
 * @param {array} fields
 * @param {array} values
 */
export const updateFields = (assetID, fields, values) => (dispatch, getAll) => {
  const { items } = getAll().assets;
  /** dispatch only if assets is loaded to the store */
  if (items.find((asset) => asset._id === assetID)) {
    dispatch({
      type: TYPES.ASSETS.UPDATE_FIELDS,
      payload: {
        assetID,
        fields,
        values,
      },
    });
  }
};

function getDispatchTypeByAsyncStatus(status) {
  if (status === CONSTANTS.ASYNC_JOB_STATUS_WAITING) return 'START';
  if (status === CONSTANTS.ASYNC_JOB_STATUS_FAILED) return 'FAILED';
  return 'COMPLETE';
}

/**
 * Remove meta field modified by user from DB
 * @param {string[]} ids
 * @param {string} fieldName
 */
export const removeModifiedField = (fieldName) => (dispatch, getAll) => {
  let ids = getAll().assets.selectedItems;

  if (ids.length === 0) {
    if (isRoutePreview()) {
      const previewID = window.location.pathname.split('/').pop();
      ids = [previewID];
    }
  }
  checkMultipleChanges(ids.length, doChange);

  async function doChange() {
    try {
      dispatch({
        type: TYPES.ASSETS.REMOVE_MODIFIED_FIELD.START,
        payload: {
          ids,
          fieldName,
        },
      });

      await Api.removeModifiedMetaFieldStatus(ids, fieldName);

      dispatch({
        type: TYPES.ASSETS.REMOVE_MODIFIED_FIELD.COMPLETE,
        payload: {
          ids,
          fieldName,
        },
      });
    } catch (error) {
      Logger.error(new Error('Error remove modified fields'), { error }, [
        'RemoveModifiedFieldFailed',
        (error && error.message) || 'NoMessage',
      ]);
      dispatch({ type: TYPES.ASSETS.REMOVE_MODIFIED_FIELD.FAILED, error });
    }
  }
};

/**
 * Remove meta field modified immediately
 * @param {string[]} ids
 * @param {string} fieldName
 */
export const removedModifiedField = (ids, fieldName) => (dispatch) => {
  dispatch({
    type: TYPES.ASSETS.REMOVE_MODIFIED_FIELD.COMPLETE,
    payload: {
      ids,
      fieldName,
    },
  });
};

/**
 * Re-run parsing
 * @param {string} jobName
 */
export const reRunParsing = (jobName) => async (dispatch, getAll) => {
  let ids = getAll().assets.selectedItems;
  Logger.log('User', `Rerun${utils.capitalizeFirstLetter(jobName)}`, ids.length);

  if (ids.length === 0) {
    if (isRoutePreview()) {
      const previewID = window.location.pathname.split('/').pop();
      ids = [previewID];
    }
  }

  try {
    dispatch({
      type: TYPES.ASSETS.RERUN_PARSING.START,
      payload: {
        ids,
        jobName,
      },
    });

    await Api.rerunJob({ ids, jobName });

    dispatch({
      type: TYPES.ASSETS.RERUN_PARSING.COMPLETE,
      payload: {
        ids,
        jobName,
      },
    });
  } catch (error) {
    Logger.error(new Error(`Error re-run ${jobName}`), { error }, [
      `Rerun${utils.capitalizeFirstLetter(jobName)}Failed`,
      (error && error.message) || 'NoMessage',
    ]);
    dispatch({ type: TYPES.ASSETS.RERUN_PARSING.FAILED, error });
  }
};

export const getPages = (ids, revisionId) => async (dispatch, getAll) => {
  try {
    const checkExpiresAt = (expiresAt) => {
      if (!expiresAt) return true;
      const nowDate = new Date();
      const expiresAtDate = new Date(expiresAt);
      const hour = 3600000;
      return nowDate.getTime() + hour * 4 > expiresAtDate.getTime();
    };

    dispatch({ type: TYPES.ASSETS.FETCH_PAGES.START });
    const assetsFromStore = getAll().assets.items;
    let isNeedToFetchPages = false;
    if (ids.length === 2) {
      isNeedToFetchPages = true;
    } else {
      ids.forEach((id) => {
        const asset = assetsFromStore.find((item) => item._id === id);
        if (revisionId && asset.pages && !asset.pages[revisionId]) {
          isNeedToFetchPages = true;
        }
        if (revisionId && asset.pages && asset.pages[revisionId] && asset.pages[revisionId][0]) {
          isNeedToFetchPages = checkExpiresAt(asset.pages[revisionId][0].expiresAt);
        }
        if (!revisionId && asset.pages) {
          isNeedToFetchPages = checkExpiresAt(asset.pages.expiresAt);
        }
      });
    }

    if (!isNeedToFetchPages) return;

    let pagesData = [];
    if (!revisionId) {
      pagesData = await Promise.all(ids.map((id) => Api.fetchPagesThumbnails(id)));
    } else {
      pagesData = await Api.fetchPagesThumbnails(ids[0], revisionId);
    }
    const pages = {};
    ids.forEach((id, index) => {
      pages[id] = revisionId ? pagesData : pagesData[index];
    });

    dispatch({
      type: TYPES.ASSETS.FETCH_PAGES.COMPLETE,
      payload: {
        pages,
        revisionId,
      },
    });
  } catch (error) {
    dispatch({ type: TYPES.ASSETS.FETCH_PAGES.FAILED, error });
    Logger.error(new Error('Error fetching asset pages'), { error, showDialog: false }, [
      'GetAssetPagesFailed',
      (error && error.message) || 'NoMessage',
    ]);
  }
};

/**
 * Get asset revisions thumbnails
 * @param {string} assetId
 * @param {array} revisions
 */
export const getRevisionsThumbnails = (assetId) => async (dispatch) => {
  dispatch({ type: TYPES.ASSETS.FETCH_REVISIONS_THUMBNAILS.START });

  try {
    const revisionsThumbnails = await Api.fetchRevisionsThumbnails(assetId);

    dispatch({
      type: TYPES.ASSETS.FETCH_REVISIONS_THUMBNAILS.COMPLETE,
      payload: {
        id: assetId,
        revisionsThumbnails,
      },
    });
  } catch (error) {
    dispatch({ type: TYPES.ASSETS.FETCH_REVISIONS_THUMBNAILS.FAILED, error });
    Logger.error(new Error('Error fetching asset revisions thumbnails'), { error, showDialog: false }, [
      'GetAssetRevisionsThumbnailsFailed',
      (error && error.message) || 'NoMessage',
    ]);
  }
};

export const getWatermarks = () => async (dispatch) => {
  try {
    const watermarks = await Api.getWatermarks();
    dispatch({
      type: TYPES.ASSETS.FETCH_WATERMARKS,
      payload: {
        watermarks,
      },
    });
  } catch (error) {
    Logger.error(new Error('Error fetching watermarks'), { error, showDialog: false }, [
      'GetWatermarksFailed',
      (error && error.message) || 'NoMessage',
    ]);
  }
};

export const createWatermark = (name) => async (dispatch, getAll) => {
  const { watermarks } = getAll().assets;
  try {
    UiBlocker.block();
    const res = await Api.createWatermark(name);
    watermarks.push(res);
    dispatch({
      type: TYPES.ASSETS.FETCH_WATERMARKS,
      payload: {
        watermarks,
      },
    });
    UiBlocker.unblock();
  } catch (error) {
    Logger.error(new Error('Error creating watermarks'), { error, showDialog: false }, [
      'CreateWatermarkFailed',
      (error && error.message) || 'NoMessage',
    ]);
    UiBlocker.unblock();
  }
};

export const deleteWatermark = (watermarkId) => async (dispatch) => {
  try {
    UiBlocker.block();
    const { success } = await Api.deleteWatermark(watermarkId, false);
    if (success) {
      dispatch({
        type: TYPES.ASSETS.DELETE_WATERMARKS,
        payload: {
          watermarkId,
        },
      });
    }
    UiBlocker.unblock();
  } catch (error) {
    const errorStatus = utils.getStatusFromResponceError(error);
    const { data } = error.response;
    if (errorStatus === 412) {
      showDialog({
        title: localization.WATERMARKS.titleDeleteWatermark,
        text: localization.WATERMARKS.textDeleteWatermark(data.assetsCount),
        textBtnOk: localization.WATERMARKS.btnOkWatermark,
        textBtnCancel: localization.DIALOGS.btnCancel,
        async onOk() {
          try {
            UiBlocker.block();
            const { success } = await Api.deleteWatermark(watermarkId, true);
            if (success) {
              dispatch({
                type: TYPES.ASSETS.DELETE_WATERMARKS,
                payload: {
                  watermarkId,
                },
              });
            }
            UiBlocker.unblock();
          } catch (err) {
            Toast(localization.WATERMARKS.errorDeletingWatermark);
            Logger.error(new Error('Error deleting watermark'), { err, showDialog: false }, [
              'ErrorDeletingWatermark',
              (err && err.message) || 'NoMessage',
            ]);
          }
        },
        onCancel() {},
      });
    }
    UiBlocker.unblock();
  }
};

export const updateWatermark = (data) => async (dispatch, getAll) => {
  const {
    name, description, type, file, text, isDefault, size, opacity, position, _id,
  } = data;
  const form = new FormData();
  form.append('name', name);
  if (description) {
    form.append('description', description);
  }
  form.append('type', type);
  if (type === 'image' && file && file?.name) {
    form.append('file', file, file.name);
  }
  form.append('text', text);
  form.append('isDefault', isDefault);
  form.append('size', size);
  form.append('opacity', opacity);
  form.append('position', position);
  form.append('_id', _id);
  const { items } = getAll().assets;
  try {
    UiBlocker.block();
    const { success } = await Api.updateWatermark(_id, form, false);
    if (success) {
      const itemIds = items.filter(
        (item) => item.watermarkId === _id,
      )
        .map((item) => item._id);
      dispatch({
        type: TYPES.ASSETS.CHANGE_WATERMARK,
        payload: {
          watermarkId: _id,
          itemIds,
          keys: Object.keys(data),
          values: Object.values(data),
        },
      });
    }
    UiBlocker.unblock();
  } catch (error) {
    const errorStatus = utils.getStatusFromResponceError(error);
    const { data: message } = error.response;
    if (errorStatus === 412) {
      showDialog({
        title: localization.WATERMARKS.titleUpdateWatermark,
        text: localization.WATERMARKS.textUpdateWatermark(message.assetsCount),
        textBtnOk: localization.WATERMARKS.btnOkWatermark,
        textBtnCancel: localization.DIALOGS.btnCancel,
        async onOk() {
          try {
            UiBlocker.block();
            const { success } = await Api.updateWatermark(_id, form, true);
            if (success) {
              const itemIds = items.filter(
                (item) => item.watermarkId === _id,
              )
                .map((item) => item._id);
              dispatch({
                type: TYPES.ASSETS.CHANGE_WATERMARK,
                payload: {
                  watermarkId: _id,
                  itemIds,
                  keys: Object.keys(data),
                  values: Object.values(data),
                },
              });
            }
            UiBlocker.unblock();
          } catch (err) {
            Toast(localization.WATERMARKS.errorDeletingWatermark);
            Logger.error(new Error('Error updating watermark'), { err, showDialog: false }, [
              'ErrorUpdatingWatermark',
              (err && err.message) || 'NoMessage',
            ]);
          }
        },
        onCancel() {
          UiBlocker.unblock();
        },
      });
    }
  }
};

export const attachWatermark = (overwrite = false, force = false, assetIds, _id) => async (dispatch) => {
  try {
    dispatch({
      type: TYPES.ASSETS.ATTACH_WATERMARK.START,
    });
    const assetsWithWatermarks = await Api.attachWatermark(assetIds, _id, overwrite, force);
    const ids = assetsWithWatermarks.map((asset) => asset._id);
    dispatch({
      type: TYPES.ASSETS.ATTACH_WATERMARK.COMPLETE,
      payload: {
        ids,
        watermarkId: _id,
      },
    });
  } catch (error) {
    dispatch({
      type: TYPES.ASSETS.ATTACH_WATERMARK.FAIL,
    });
    Logger.error(new Error('Error attaching watermarks'), { error, showDialog: false }, [
      'AttachWatermarksFailed',
      (error && error.message) || 'NoMessage',
    ]);
  }
};

export const setDefaultWatermark = (_id) => async (dispatch) => {
  try {
    UiBlocker.block();
    const { success } = await Api.setDefaultWatermark(_id);
    if (success) {
      dispatch({
        type: TYPES.ASSETS.SET_DEFAULT_WATERMARK,
        payload: {
          watermarkId: _id,
        },
      });
    } else {
      Toast(localization.WATERMARKS.errorMakeWatermarkDefault);
      throw Error();
    }
    UiBlocker.unblock();
  } catch (error) {
    UiBlocker.unblock();
    Logger.error(new Error('Error setting watermark default'), { error, showDialog: false }, [
      'SetDefaultWatermarkFailed',
      (error && error.message) || 'NoMessage',
    ]);
  }
};
