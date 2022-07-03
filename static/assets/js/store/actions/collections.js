import Q from 'q';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as collectionsApi from '../../api/collections';

import Logger from '../../services/Logger';
import UiBlocker from '../../services/UiBlocker';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';
import Dialogs from '../../ui/dialogs';
import picsioConfig from '../../../../../config';

import Store from '../index';
import * as rolesActions from '../reducers/roles';
import { isArchiveAllowed } from '../helpers/user';
import TYPES from '../action-types';
import * as helpers from '../helpers/collections';
import {
  renameCollection as renameCollectionAssetsAction,
  deleteCollection as deleteCollectionAssetsAction,
  changePath as changePathAssetsAction,
  setMoving as setMovingAssetsAction,
} from './assets';
import Toast from '../../components/Toast';
import { showDialog, showErrorDialog } from '../../components/dialog';
import archiveActions from './archive';
import {
  navigateToRoot, reloadApp, reloadRoute, setSearchRoute,
} from '../../helpers/history';
import sdk from '../../sdk';

/**
 * Get collections
 */
export function getCollections() {
  return async (dispatch) => {
    dispatch({ type: TYPES.COLLECTIONS.FETCH.START });

    try {
      let promises;
      if (picsioConfig.isMainApp()) {
        promises = [
          collectionsApi.getFavorites(),
          collectionsApi.getWebsites(),
          collectionsApi.getRoot(),
        ];
      } else {
        promises = [
          {},
          {},
          { ...picsioConfig.access.tag, name: picsioConfig.access.overridedTagname },
        ];
      }

      const [favorites, websites, my] = await Q.all(promises);

      const nameSharedCollection = my.path.split('/').pop();

      favorites.path = 'favorites';
      websites.path = 'websites';
      my.path = 'root';
      my.hasChild = true;
      my.name = picsioConfig.isMainApp() ? 'My team library' : nameSharedCollection;

      if (!my.storageId) my.storageId = my.googleId;

      const isFavoritesOpened = utils.LocalStorage.get('picsio.tagsTree.favorites.open');
      const isWebsitesOpened = utils.LocalStorage.get('picsio.tagsTree.websites.open');
      favorites.isOpen = isFavoritesOpened === null ? true : isFavoritesOpened;
      websites.isOpen = isWebsitesOpened === null ? true : isWebsitesOpened;
      my.isOpen = picsioConfig.isMainApp() ? utils.LocalStorage.get('picsio.tagsTree.my.open') : true;

      dispatch({
        type: TYPES.COLLECTIONS.FETCH.COMPLETE,
        payload: {
          tree: { favorites, websites, my },
        },
      });

      if (picsioConfig.isMainApp()) {
        setTeamName()(dispatch);
      }

      // we forgot why my._id might be undefined, 13 june 2018
      if (my._id) {
        window.rootCollectionId = my._id;
        const { tagId: currentCollectionId, archived } = Store.getState().router.location.query;
        const isRoot = my._id === currentCollectionId;

        if (!isRoot && !archived) {
          getChildren(my._id, { currentCollectionId })(dispatch);
        } else {
          getChildren(my._id)(dispatch);
        }
        if (isArchiveAllowed()) {
          if (archived) {
            if (isRoot) {
              dispatch(archiveActions.fetchArchivedCollections({ collectionId: my._id }));
            } else {
              dispatch(
                archiveActions.fetchArchivedCollections({
                  collectionId: my._id,
                  currentCollectionId,
                }),
              );
            }
          }
        }
        return { rootCollectionId: my._id, currentCollectionId, archived };
      }
      console.error('By some  reasons my._id is undefined. Please report to @pokie.');
      return null;
    } catch (error) {
      console.error(error);
      dispatch({
        type: TYPES.COLLECTIONS.FETCH.FAILED,
        error,
      });
      throw error;
    }
  };
}

/**
 * Get children for collection
 * @param {string} collectionID
 * @param {string?} currentCollectionId
 */
export function getChildren(collectionID, { currentCollectionId } = {}) {
  return (dispatch) => {
    dispatch({
      type: TYPES.COLLECTIONS.FETCH_CHILDREN.START,
      payload: { collectionID },
    });

    return collectionsApi
      .getChildren(collectionID, { currentCollectionId })
      .then((children) => {
        const nodes = children.map(helpers.normalizeCollection);

        dispatch({
          type: TYPES.COLLECTIONS.FETCH_CHILDREN.COMPLETE,
          payload: {
            collectionID,
            nodes,
          },
        });
      })
      .catch((error) => {
        const errorStatus = utils.getStatusFromResponceError(error);
        if (errorStatus === 404) {
          reloadApp();
          return;
        }

        Logger.error(new Error('Can not get collections children'), { error });
        dispatch({
          type: TYPES.COLLECTIONS.FETCH_CHILDREN.FAILED,
          error,
        });

        if (currentCollectionId) {
          const searchQuery = Store.getState().router.location.query;
          setSearchRoute({ ...searchQuery, tagId: collectionID });
          getChildren(collectionID)(dispatch);
        }
      });
  };
}

/**
 * Rename collection
 * @param {Object} collection
 * @param {string} newName
 */
export function renameCollection(collection, newName) {
  return async (dispatch, getAll) => {
    const assets = getAll().assets.items;
    const { tagId } = getAll().router.location.query;
    const assetIds = tagId === collection._id ? assets.map((a) => a._id) : [];
    function handleError(error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      let dialogTitle = 'Error';
      let dialogText = localization.UNABLE_TO_RENAME_COLLECTION;
      if (errorStatus === 403) {
        dialogText = localization.NO_PERMISSION_TO_ACCESS;
      } else if (errorStatus === 409) {
        /** if collection is busy */
        dialogTitle = localization.DIALOGS.WARNING_BUSY_COLLECTION.TITLE;
        dialogText = localization.DIALOGS.WARNING_BUSY_COLLECTION.TEXT;
      }
      dispatch({
        type: TYPES.COLLECTIONS.RENAME.FAILED,
        payload: {
          collectionID: collection._id,
          error: localization.UNABLE_TO_RENAME_COLLECTION,
        },
        error,
      });
      if (error) {
        Logger.error(new Error('Can not rename collection'), { error }, [
          'RenameCollectionFailed',
          (error && error.message) || 'NoMessage',
        ]);
      }
      return showDialog({
        title: dialogTitle,
        text: dialogText,
        textBtnCancel: null,
      });
    }

    dispatch({
      type: TYPES.COLLECTIONS.RENAME.START,
      payload: { collectionID: collection._id },
    });

    try {
      const { data } = await sdk.collections.rename(collection._id, newName);

      if (data.tag && data.tag.name !== undefined) {
        dispatch({
          type: TYPES.COLLECTIONS.RENAME.COMPLETE,
          payload: { collectionID: collection._id, newName },
        });
        renameCollectionAssetsAction(collection._id, newName)(dispatch);
        if (data.queued) {
          setMovingAssetsAction(assetIds, 'waiting')(dispatch);
          Toast(localization.DETAILS.textFinishInBg, { autoClose: false });
        }
      } else {
        handleError();
      }
    } catch (err) {
      handleError(err);
    }
  };
}

/**
 * Rename collection
 * @param {Object} collection
 * @param {string} newName
 */
export const renamedCollection = (collection) => (dispatch) => dispatch({
  type: TYPES.COLLECTIONS.RENAME.COMPLETE,
  payload: { collectionID: collection._id, newName: collection.name, notify: true },
});

/**
 * Add collection
 * @param {string} path
 * @param {string} name
 * @param {string} parentID
 */
export function addCollection(path, name, parentID, resetNewName) {
  return async (dispatch) => {
    dispatch({ type: TYPES.COLLECTIONS.ADD.START });

    const data = { tag: { name } };

    const createCollectionInSubCollection = (path) => !path.startsWith('root');

    if (createCollectionInSubCollection(path)) {
      data.path = path;
    }

    function handleError(error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      let errorMessage = '';

      const reset = () => {
        if (resetNewName) {
          resetNewName();
        }
      };

      switch (errorStatus) {
      case 403: {
        errorMessage = localization.NO_PERMISSION_TO_ACCESS;
        break;
      }
      case 426: {
        errorMessage = localization.COLLECTION_IS_EXISTED_AND_ARCHIVED;
        break;
      }
      default: {
        errorMessage = localization.UNABLE_TO_CREATE_COLLECTION;
        break;
      }
      }

      showDialog({
        title: 'Error',
        text: errorMessage,
        textBtnCancel: null,
        onOk: reset,
        onCancel: reset,
        onClose: reset,
      });
      dispatch({
        type: TYPES.COLLECTIONS.ADD.FAILED,
        error,
      });
      Logger.error(new Error('Can not create collection'), { error }, [
        'CreateCollectionFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }

    try {
      Logger.addBreadcrumb(data);
      const collection = await collectionsApi.add(data);

      if (collection._id) {
        const pathArr = collection.path.split('/');
        if (pathArr[1] === 'root') pathArr.splice(1, 1);

        collection.name = pathArr.pop();
        collection.path = `${pathArr.join('/')}/`;
        collection.hasChild = false;

        dispatch({
          type: TYPES.COLLECTIONS.ADD.COMPLETE,
          payload: {
            parentID,
            collection,
          },
        });
      } else {
        throw new Error(collection.msg || 'Collection is undefined');
      }
    } catch (error) {
      handleError(error);
    }
  };
}

/**
 * Push collections to store (created by sockets, import)
 * @param {Object[]} collections
 */
export const pushCollections = (collections, replace) => (dispatch) => dispatch({
  type: TYPES.COLLECTIONS.PUSH,
  payload: { collections, replace },
});

/**
 * Collection removed by someboby
 * @param {string} collectionID
 */
export const collectionRemoved = (collectionID) => (dispatch) => dispatch({
  type: TYPES.COLLECTIONS.REMOVE.COMPLETE,
  payload: { collectionID },
});

/**
 * Collection removed by notification
 * @param {string} collectionID
 */
export const collectionRemoving = (collectionID) => (dispatch) => dispatch({
  type: TYPES.COLLECTIONS.REMOVE.INPROGRESS,
  payload: { collectionID },
});

/**
 * Remove collection
 * @param {Object} collection
 */
export function removeCollection(collection) {
  return (dispatch) => {
    function handleError(error) {
      let errorText = localization.UNABLE_TO_REMOVE_COLLECTION;
      const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
      const errorStatus = utils.getStatusFromResponceError(error);
      if (errorSubcode === 'GDinsufficientPermissionsError') {
        errorText = localization.UNABLE_TO_REMOVE_COLLECTION_NO_GD_PERMISSIONS;
      }
      if (errorStatus === 403) {
        errorText = localization.NO_PERMISSION_TO_ACCESS;
      }
      showErrorDialog(errorText);

      dispatch({
        type: TYPES.COLLECTIONS.REMOVE.FAILED,
        payload: { collectionID: collection._id },
      });
      Logger.error(new Error('Can not remove collection'), { error }, [
        'RemoveCollectionFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }

    /**
     * Remove from server
     * @param {boolean} removeAssets
     */
    async function doRemove() {
      UiBlocker.block(localization.TAGSTREE.textRemovingCollection);
      try {
        await collectionsApi.remove(collection._id).then((response) => {
          if (response.removed) {
            // remove collection drom roles
            Store.getState().roles.items.forEach((role) => {
              const lengthAllowedCollections = (role.allowedCollections || []).length;
              const filteredAllowedCollections = (role.allowedCollections || []).filter(
                (allowedCollection) => allowedCollection._id !== collection._id,
              );
              if (lengthAllowedCollections !== filteredAllowedCollections.length) {
                const updatedRole = { ...role };
                updatedRole.allowedCollections = filteredAllowedCollections;
                rolesActions.updateRole(updatedRole)(dispatch);
              }
            });

            dispatch({
              type: TYPES.COLLECTIONS.REMOVE.COMPLETE,
              payload: { collectionID: collection._id },
            });

            const { tagId } = Store.getState().router.location.query;
            if (collection._id === tagId) {
              navigateToRoot();
            } else {
              deleteCollectionAssetsAction(collection._id)(dispatch);
            }

            Toast(localization.COLLECTION_REMOVED, { audit: true });
          } else {
            handleError(response.msg || localization.UNABLE_TO_REMOVE_COLLECTION);
          }
        });
      } catch (error) {
        handleError(error);
      }
      UiBlocker.unblock();
    }

    /** @TODO check websites on the server // 30.05.2018 */
    const html = localization.TAGSTREE.textRemoveCollectionAndSite(
      utils.decodeSlash(collection.name),
      collection.website && `https://${collection.website.alias}`,
    );

    Logger.log('UI', 'RemoveCollectionDialog');
    new Dialogs.Text({
      title: localization.TAGSTREE.textRemoveCollection,
      html,
      dialogConfig: {
        textBtnCancel: localization.DIALOGS.btnCancel,
        textBtnOk: localization.DIALOGS.btnOk,
        onOk: () => {
          dispatch({
            type: TYPES.COLLECTIONS.REMOVE.START,
            payload: { collectionID: collection._id },
          });
          Logger.log('User', 'RemoveCollectionDialogOk');

          doRemove();
        },
        onCancel: () => {
          Logger.log('User', 'RemoveCollectionDialogCancel');
        },
      },
    });
  };
}

/**
 * Add/remove favotites
 * @param {string} collectionID
 * @param {string} collectionName
 * @param {string} collectionPath
 * @param {boolean} value
 */
export function addToFavorites(collectionID, collectionName, collectionPath, value) {
  return async (dispatch) => {
    const path = collectionPath + collectionName;
    function handleError(error) {
      console.error(error);
      dispatch({
        type: TYPES.COLLECTIONS.FAVORITE.FAILED,
        payload: { collectionID },
      });
      Logger.error(new Error('Can not add collection to favorites'), { error }, [
        'AddCollectionToFavoritesFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }

    dispatch({
      type: TYPES.COLLECTIONS.FAVORITE.START,
      payload: { collectionID },
    });

    try {
      await collectionsApi.setFavorites(path, value).then((res) => {
        if (res.ok) {
          let actionLog;
          let actionText;
          if (value) {
            actionText = 'added to';
            actionLog = 'CollectionsPanelAddToFav';
          } else {
            actionText = 'removed from';
            actionLog = 'CollectionsPanelRemoveFromFav';
          }

          Logger.log('User', actionLog, { collectionID });
          Toast(`"${collectionName}" has been ${actionText} Favorites`);
          dispatch({
            type: TYPES.COLLECTIONS.FAVORITE.COMPLETE,
            payload: { collectionID, value },
          });
        } else {
          handleError(`Can't favorite ${collectionName}: ${res}`);
        }
      });
    } catch (error) {
      handleError(error);
    }
  };
}

/**
 * Set search
 * @param {string} value
 */
export function applySearch(value) {
  return async (dispatch) => {
    if (value.length < 3) {
      dispatch({
        type: TYPES.COLLECTIONS.SEARCH.SET,
        payload: { value },
      });
      return;
    }

    dispatch({
      type: TYPES.COLLECTIONS.SEARCH.SET,
      payload: { value },
    });
    dispatch({ type: TYPES.COLLECTIONS.SEARCH.START });
    try {
      const collections = await collectionsApi.search(value);
      if (Array.isArray(collections)) {
        dispatch({
          type: TYPES.COLLECTIONS.SEARCH.COMPLETE,
          payload: {
            collections,
            value,
          },
        });
      } else {
        console.error('onSearch erorr', collections);
        Toast(localization.TAGSTREE.textCantCompleteSearch());
        dispatch({ type: TYPES.COLLECTIONS.SEARCH.FAILED, error: collections });
      }
    } catch (error) {
      console.error('onSearch erorr', error);
      Toast(localization.TAGSTREE.textCantCompleteSearch());
      dispatch({ type: TYPES.COLLECTIONS.SEARCH.FAILED, error });
      Logger.error(new Error('Can not search for collections'), { error }, [
        'SearchForCollectionFailed',
        (error && error.message) || 'NoMessage',
      ]);
    }
  };
}

/**
 * Change total assets count
 * @param {number} count
 */
export const changeCount = (count) => (dispatch) => dispatch({
  type: TYPES.COLLECTIONS.CHANGE_ASSETS_COUNT,
  payload: { count },
});

/**
 * Set sort type to collection
 * @param {string} collectionID
 * @param {string} sortType
 */
export const setSortType = (collectionID, sortType, onlyLocal) => async (dispatch) => {
  if (onlyLocal) {
    dispatch({
      type: TYPES.COLLECTIONS.SET_SORT_TYPE.COMPLETE,
      payload: { collectionID, sortType },
    });
  } else {
    try {
      dispatch({
        type: TYPES.COLLECTIONS.SET_SORT_TYPE.START,
      });
      await collectionsApi.setSortType(collectionID, sortType);
      dispatch({
        type: TYPES.COLLECTIONS.SET_SORT_TYPE.COMPLETE,
        payload: { collectionID, sortType },
      });
      reloadRoute();
    } catch (err) {
      dispatch({
        type: TYPES.COLLECTIONS.SET_SORT_TYPE.FAILED,
      });
      console.error(err);
      Toast(localization.TAGSTREE.textCantChangeOrder, { autoClose: false });
      reloadRoute();
    }
  }
};

/**
 * Set website
 * @param {string} collectionID
 * @param {Object} value
 */
export const setWebsite = (collectionID, value, notify) => (dispatch) => dispatch({
  type: TYPES.COLLECTIONS.SET_WEBSITE,
  payload: { collectionID, value, notify },
});

/**
 * Toggle recursive search
 */
export function recursiveSearchToggle(value) {
  return (dispatch) => {
    utils.LocalStorage.set('picsio.recursiveSearch', !value);

    dispatch({
      type: TYPES.COLLECTIONS.RECURSIVE_SEARCH_TOGGLE,
      payload: { value },
    });

    // we need to use setSearchRoute, not reloadRoute, because setSearchRoute
    // uses constructQueryString to add 'recursive=false'
    // TODO: rewrite picsioNavigator to pass parameter 'recursive=false' directly
    const { tagId, archived } = Store.getState().router.location.query;
    if (tagId) {
      const query = { tagId, archived };
      setSearchRoute(query);
    } else {
      // when we select lightboard and then turn off Recursive search, we don't have tagId, so we needs to navigateToRoot
      navigateToRoot();
    }
    if (value) {
      Logger.log('User', 'CollectionsPanelDontShowRecursiveSetOn');
    } else {
      Logger.log('User', 'CollectionsPanelDontShowRecursiveSetOff');
    }
  };
}

/**
 * Reset recursive search
 */
export function setRecursiveSearch(value) {
  return (dispatch) => {
    utils.LocalStorage.set('picsio.recursiveSearch', !value);
    dispatch({
      type: TYPES.COLLECTIONS.RECURSIVE_SEARCH_SET,
      payload: { value },
    });
  };
}

/** Set teamName */
export function setTeamName(name) {
  return (dispatch) => {
    const { teamName } = Store.getState().user.team.policies;
    dispatch({
      type: TYPES.COLLECTIONS.UPDATE_ROOT_COLLECTION_NAME,
      payload: {
        teamName: name || teamName,
      },
    });
  };
}

/**
 * Move collection
 * @param {string} collectionId
 * @param {string} targetCollectionId
 */
export function moveCollection(
  collectionIdToMove,
  targetCollectionId,
  newPath,
  oldPath,
  collectionName,
) {
  return async (dispatch, getAll) => {
    const all = getAll();
    const store = all.collections;
    const assets = all.assets.items;
    const { tagId } = all.router.location.query;
    const assetIds = tagId === collectionIdToMove ? assets.map((a) => a._id) : [];
    const storeSearchCollections = store.search.collections;
    const storeCollections = store.collections;
    const targetCollection = helpers.findCollection(storeCollections, 'my', {
      _id: targetCollectionId,
    });
    const needsFetchChildren = !targetCollection.nodes && targetCollection.hasChild;

    dispatch({
      type: TYPES.COLLECTIONS.MOVE.START,
      payload: {
        targetCollectionId,
      },
    });

    UiBlocker.block(localization.TAGSTREE.textMovingCollection);
    try {
      Logger.addBreadcrumb({ collectionIdToMove, targetCollectionId });
      const { data } = await sdk.collections.move(collectionIdToMove, targetCollectionId);

      if (data) {
        dispatch({
          type: TYPES.COLLECTIONS.MOVE.COMPLETE,
          payload: {
            targetCollectionId,
            collectionIdToMove,
            needsFetchChildren,
          },
        });

        if (storeSearchCollections) getChildren(collectionIdToMove)(dispatch);

        changePathAssetsAction(oldPath, newPath, collectionName)(dispatch);
        if (data.queued) {
          setMovingAssetsAction(assetIds, 'waiting')(dispatch);
          Toast(localization.DETAILS.textFinishInBg, { autoClose: false });
        } else {
          Toast(localization.TAGSTREE.textMovedCollection, { audit: true });
        }
      }
    } catch (error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg');
      const errorStatus = utils.getStatusFromResponceError(error);
      let dialogTitle = 'Error';
      let dialogText = (errorMessage && localization.TAGSTREE.textUnableToMoveCollection(errorMessage))
        || localization.UNABLE_TO_MOVE_COLLECTION;
      /** if collection is busy */
      if (errorStatus === 403) {
        dialogText = localization.NO_PERMISSION_TO_ACCESS;
      } else if (errorStatus === 409) {
        dialogTitle = localization.DIALOGS.WARNING_BUSY_COLLECTION.TITLE;
        dialogText = localization.DIALOGS.WARNING_BUSY_COLLECTION.TEXT;
      }
      Logger.error(new Error('Can not move collection'), { error }, [
        'MoveCollectionFailed',
        errorMessage || 'NoMessage',
      ]);
      showDialog({
        title: dialogTitle,
        text: dialogText,
        textBtnCancel: null,
      });
      dispatch({
        type: TYPES.COLLECTIONS.MOVE.FAILED,
        payload: {
          targetCollectionId,
        },
      });
    }
    UiBlocker.unblock();
  };
}

/**
 * Change collection color
 * @param {string} collectionId
 * @param {string} color
 */
export function changeCollectionColor(collectionId, color) {
  return async (dispatch) => {
    try {
      dispatch({
        type: TYPES.COLLECTIONS.CHANGE_COLOR.START,
        payload: {
          collectionId,
        },
      });
      const result = await collectionsApi.setColor(collectionId, color);

      if (result.success) {
        dispatch({
          type: TYPES.COLLECTIONS.CHANGE_COLOR.COMPLETE,
          payload: {
            collectionId,
            color,
          },
        });
      }
    } catch (error) {
      Logger.error(new Error('Can not change collection color'), { error }, [
        'ChangeCollectionColorFailed',
        'NoMessage',
      ]);
      showDialog({
        title: 'Error',
        text: localization.UNABLE_TO_CHANGE_COLLECTION_COLOR,
        textBtnCancel: null,
      });
      dispatch({
        type: TYPES.COLLECTIONS.CHANGE_COLOR.FAILED,
        payload: {
          collectionId,
        },
      });
    }
  };
}

/**
 * Change collection color immediately
 * @param {string} collectionId
 * @param {string} color
 */
export function changedCollectionColor(collectionId, color) {
  return async (dispatch) => {
    dispatch({
      type: TYPES.COLLECTIONS.CHANGE_COLOR.COMPLETE,
      payload: {
        collectionId,
        color,
      },
    });
  };
}

/**
 * Change collection description
 * @param {string} collectionId
 * @param {string} description
 */
export function changeCollectionDescription(collectionId, description) {
  return async (dispatch) => {
    dispatch({
      type: TYPES.COLLECTIONS.CHANGE_DESCRIPTION.START,
      payload: {
        collectionId,
      },
    });

    try {
      const result = await collectionsApi.setDescription(collectionId, description);

      if (result.success) {
        dispatch({
          type: TYPES.COLLECTIONS.CHANGE_DESCRIPTION.COMPLETE,
          payload: {
            collectionId,
            description,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: TYPES.COLLECTIONS.CHANGE_DESCRIPTION.FAILED,
        payload: {
          collectionId,
        },
      });
      Logger.error(new Error('Can not change collection description'), { error }, [
        'ChangeCollectionDescriptionFailed',
        'NoMessage',
      ]);
      showDialog({
        title: 'Error',
        text: localization.UNABLE_TO_CHANGE_COLLECTION_DESCRIPTION,
        textBtnCancel: null,
      });
    }
  };
}

/**
 * Change collection description immediately
 * @param {string} collectionId
 * @param {string} color
 */
export function changedCollectionDescription(collectionId, description) {
  return async (dispatch) => {
    dispatch({
      type: TYPES.COLLECTIONS.CHANGE_DESCRIPTION.COMPLETE,
      payload: {
        collectionId,
        description,
      },
    });
  };
}

/**
 * Sync folder
 * @param {string} collectionId
 */
export const syncFolder = createAsyncThunk(
  'collections/syncFolder',
  async (collectionId) => {
    try {
      await sdk.collections.syncFolder(collectionId);
      showDialog({
        title: localization.FOLDER_SYNC.syncHasStartedTitle,
        text: localization.FOLDER_SYNC.syncHasStartedText,
        textBtnCancel: null,
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      if (errorStatus === 409) {
        showDialog({
          title: localization.FOLDER_SYNC.syncAlreadyRunningErrorTitle,
          text: localization.FOLDER_SYNC.syncAlreadyRunningErrorText,
          textBtnCancel: null,
        });
      }
      Logger.error(new Error('Can not sync folder'), { error }, [
        'SyncFolderFailed',
      ]);
    }
  },
);

export const incrementCount = createAction('collections/incrementCount');
export const decrementCount = createAction('collections/decrementCount');

export const setActiveCollection = createAsyncThunk(
  'collections/setActiveCollection',
  async (collectionId, { rejectWithValue, dispatch, getState }) => {
    const currectActiveCollection = getState().collections.activeCollection;
    try {
      if (collectionId === null) {
        if (currectActiveCollection === null) return;
        dispatch({ type: 'collections/setActiveCollection', payload: { collection: null } });
        return;
      }

      const collection = await helpers.forceFindTagWithTagId(
        getState().collections.collections,
        getState().collections.search,
        collectionId,
      );

      // @TODO: receive from server `hasChild` by forceFindTagWithTagId
      // collection.hasChild = true;

      if (currectActiveCollection?._id === collection?._id) return;

      dispatch({ type: 'collections/setActiveCollection', payload: { collection } });

      return {
        collection,
      };
    } catch (e) {
      return rejectWithValue(e);
    } finally {}
  },
);
