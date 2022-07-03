import CONSTANTS from '@picsio/db/src/constants';

import TYPES from '../action-types';
import * as helpers from '../helpers/assets';

const defaultState = {
  isLoaded: true,
  uiBlocked: true,
  updateInProgress: false,
  inProgress: {
    title: false,
    description: false,
    keywords: false,
    assignees: false,
    collections: false,
    lightboards: false,
    marks: false,
    customField: false,
    customFields: [],
    share: false,
    modifiedFields: [],
    processing: false,
    watermarking: false,
  },
  items: [],
  watermarks: [],
  geo: [],
  tmpItemIDs: [], // needed when we choose any linked asset, which isn't in current collection.
  // we can't use "assets", because it will be rendered to catalogView.
  selectedItems: [],
  allowedActions: {},
  lastClicked: null,
  total: 0,
  full: false,
  error: null,
};

export default function AssetsReducer(state = defaultState, action) {
  const { type, payload, error } = action;

  switch (type) {
  /** Fetch  */
  case TYPES.ASSETS.FETCH.START: {
    return {
      ...state,
      isLoaded: false,
      error: null,
      uiBlocked: payload.blockUI,
      items: payload.blockUI ? [] : state.items,
      selectedItems: payload.blockUI ? [] : state.selectedItems,
      lastClicked: payload.blockUI ? null : state.lastClicked,
      geo: [...state.geo],
    };
  }
  case TYPES.ASSETS.FETCH.COMPLETE: {
    return {
      ...state,
      isLoaded: true,
      items: payload.isNewRoute
        ? [...helpers.extendAssets(payload.items)]
        : [...state.items, ...helpers.extendAssets(payload.items)],
      full: payload.full,
      total: payload.total,
      uiBlocked: false,
      geo: payload.geo ? [...payload.geo] : [],
    };
  }
  case TYPES.ASSETS.FETCH.FAILED: {
    return {
      ...state,
      isLoaded: true,
      error,
    };
  }

  /** Get tmp assets */
  case TYPES.ASSETS.FETCH_TMP.START: {
    return {
      ...state,
      isLoaded: false,
      tmpItemIDs: [],
      error: null,
    };
  }
  case TYPES.ASSETS.FETCH_TMP.COMPLETE: {
    const { ids, rolePermissions = null } = payload;
    let allowedActions = {};
    const items = [...state.items, ...helpers.extendAssets(payload.items)];
    // We don't need to check assets permissions on Proofing.
    if (rolePermissions) {
      allowedActions = helpers.getPermissions(
        items,
        ids,
        rolePermissions,
      );
    }

    return {
      ...state,
      isLoaded: true,
      items: [...items],
      allowedActions,
      tmpItemIDs: payload.ids,
    };
  }
  case TYPES.ASSETS.FETCH_TMP.FAILED: {
    return {
      ...state,
      isLoaded: true,
      error,
    };
  }

  /** Set tmp item */
  case TYPES.ASSETS.SET_TMP_ITEM: {
    return {
      ...state,
      tmpItemIDs: [...state.tmpItemIDs, payload.id],
    };
  }

  /** Get assets by ids */
  case TYPES.ASSETS.GET_BY_IDS.START: {
    return {
      ...state,
      error: null,
    };
  }
  case TYPES.ASSETS.GET_BY_IDS.COMPLETE: {
    return {
      ...state,
      items: [...state.items, ...helpers.extendAssets(payload.items)],
    };
  }
  case TYPES.ASSETS.GET_BY_IDS.FAILED: {
    return {
      ...state,
      error,
    };
  }

  /** Set thumbnails for assets */
  case TYPES.ASSETS.SET_THUMBNAILS: {
    const { thumbnails, isUsedS3Storage } = payload;
    return {
      ...state,
      items: helpers.setThumbnailUrls(
        state.items,
        thumbnails,
        isUsedS3Storage,
      ),
    };
  }

  /** Set custom thumbnail */
  case TYPES.ASSETS.SET_CUSTOM_THUMBNAIL: {
    const {
      id, revisionId, url, pages, imageSizes, thumbnail,
    } = payload;
    return {
      ...state,
      items: helpers.setCustomThumbnail(
        state.items,
        id,
        revisionId,
        url,
        pages,
        imageSizes,
        thumbnail,
      ),
    };
  }

  /** Add highlight to asset */
  case TYPES.ASSETS.ADD_HIGHLIGHT: {
    return {
      ...state,
      items: state.items.map((item) => {
        if (payload.ids.includes(item._id)) {
          const paramsForHighlight = [
            ...item.paramsForHighlight,
            payload.type,
          ];
          return {
            ...item,
            paramsForHighlight,
          };
        }
        return item;
      }),
    };
  }

  /** Remove highlight to asset */
  case TYPES.ASSETS.REMOVE_HIGHLIGHT: {
    return {
      ...state,
      items: state.items.map((item) => {
        if (payload.ids.includes(item._id)) {
          const paramsForHighlight = item.paramsForHighlight.filter(
            (param) => param !== payload.type,
          );
          return {
            ...item,
            paramsForHighlight,
          };
        }
        return item;
      }),
    };
  }

  /** Remove tmp item */
  case TYPES.ASSETS.REMOVE_TMP_ITEMS: {
    return {
      ...state,
      items: state.items.filter(
        (item) => !state.tmpItemIDs.includes(item._id),
      ),
      tmpItemIDs: [],
    };
  }

  /** Select */
  case TYPES.ASSETS.SELECT: {
    const {
      value, id, isRange, rolePermissions = null,
    } = payload;
    const selectedItemsIds = helpers.select(
      value,
      id,
      isRange,
      state.lastClicked,
      state.items,
      state.selectedItems,
    );

    let allowedActions = {};
    // We don't need to check assets permissions on Proofing.
    if (rolePermissions) {
      allowedActions = helpers.getPermissions(
        state.items,
        selectedItemsIds,
        rolePermissions,
      );
    }

    return {
      ...state,
      selectedItems: selectedItemsIds,
      allowedActions,
      lastClicked: value ? id : null,
    };
  }

  case TYPES.ASSETS.SELECT_MANY: {
    const { value, ids } = payload;
    return {
      ...state,
      selectedItems: helpers.selectMany(value, ids, state.selectedItems),
    };
  }

  /** Select all */
  case TYPES.ASSETS.SELECT_ALL.START: {
    return {
      ...state,
      uiBlocked: true,
    };
  }
  case TYPES.ASSETS.SELECT_ALL.COMPLETE: {
    const allowedActions = helpers.getPermissions(
      state.items,
      payload.selectedAssetsIds,
      payload.rolePermissions,
      payload.assetsBatchPermissions,
    );
    return {
      ...state,
      uiBlocked: false,
      selectedItems: payload.selectedAssetsIds,
      allowedActions,
    };
  }
  case TYPES.ASSETS.SELECT_ALL.FAILED: {
    return {
      ...state,
      uiBlocked: false,
      error,
    };
  }

  /** Deselect all */
  case TYPES.ASSETS.DESELECT_ALL: {
    return {
      ...state,
      selectedItems: state.selectedItems.length > 0 ? [] : state.selectedItems, // don't update field if not changed
      allowedActions: {},
      lastClicked: null,
    };
  }

  /** Reorder */
  case TYPES.ASSETS.REORDER: {
    return {
      ...state,
      items: payload.items,
    };
  }

  /** Add to collection */
  case TYPES.ASSETS.ADD_COLLECTION.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        collections: true,
      },
    };
  }
  case TYPES.ASSETS.ADD_COLLECTION.COMPLETE: {
    const {
      ids,
      collectionID,
      collectionPath,
      isMove,
      isTeamDrive,
      isMoveIntoNestedCollection,
      activeCollectionID,
    } = payload;
    const data = {
      items: state.items,
      assetIDs: ids,
      collectionID,
      collectionPath,
      isMove,
      isTeamDrive,
      isMoveIntoNestedCollection,
      activeCollectionID,
    };
    const items = helpers.addToCollection(data);
    const total = (isTeamDrive || isMove) && !isMoveIntoNestedCollection
      ? state.total - ids.length
      : state.total;
    return {
      ...state,
      selectedItems:
          payload.isMove && !payload.isMoveIntoNestedCollection
            ? []
            : state.selectedItems,
      items,
      total,
      full: total <= items.length,
      inProgress: {
        ...state.inProgress,
        collections: false,
      },
    };
  }
  case TYPES.ASSETS.ADD_COLLECTION.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        collections: false,
      },
    };
  }

  /** Remove from collection */
  case TYPES.ASSETS.REMOVE_COLLECTION.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        collections: true,
      },
    };
  }
  case TYPES.ASSETS.REMOVE_COLLECTION.COMPLETE: {
    const result = helpers.removeFromCollection(
      state.items,
      payload.collectionID,
      payload.selectedItems,
    );
    return {
      ...state,
      items: result.items,
      selectedItems: result.itemsRemoved > 0 ? [] : state.selectedItems,
      total: state.total - result.itemsRemoved,
      full: state.total - result.itemsRemoved !== 0 ? state.full : true,
      inProgress: {
        ...state.inProgress,
        collections: false,
      },
    };
  }
  case TYPES.ASSETS.REMOVE_COLLECTION.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        collections: false,
      },
      error,
    };
  }
  case TYPES.ASSETS.REMOVED_COLLECTION: {
    const result = helpers.removeFromCollection(
      state.items,
      payload.collectionID,
      payload.selectedIds,
      true,
    );
    return {
      ...state,
      items: result.items,
    };
  }

  /** Delete collection */
  case TYPES.ASSETS.DELETE_COLLECTION: {
    return {
      ...state,
      items: helpers.removeFromCollection(state.items, payload.id).items,
    };
  }

  /** Add to lightboard */
  case TYPES.ASSETS.ADD_LIGHTBOARD.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        lightboards: true,
      },
    };
  }
  case TYPES.ASSETS.ADD_LIGHTBOARD.COMPLETE: {
    const {
      assetIDs,
      lightboardID,
      lightboardPath,
      isMove,
      isTeamDrive,
      userId,
    } = payload;
    const data = {
      items: state.items,
      assetIDs,
      lightboardID,
      lightboardPath,
      isMove,
      isTeamDrive,
      userId,
    };
    const items = helpers.addToLightboard(data);
    const total = isMove ? state.total - assetIDs.length : state.total;
    return {
      ...state,
      items,
      selectedItems: payload.isMove ? [] : state.selectedItems,
      total,
      full: total <= items.length,
      inProgress: {
        ...state.inProgress,
        lightboards: false,
      },
    };
  }
  case TYPES.ASSETS.ADD_LIGHTBOARD.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        lightboards: false,
      },
    };
  }

  /** Remove from lightboard */
  case TYPES.ASSETS.REMOVE_LIGHTBOARD.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        lightboards: true,
      },
    };
  }
  case TYPES.ASSETS.REMOVE_LIGHTBOARD.COMPLETE: {
    const { items, itemsRemoved } = helpers.removeFromLightboard(
      state.items,
      payload.ids,
      payload.lightboardId,
    );
    const total = state.total - itemsRemoved;
    return {
      ...state,
      items,
      selectedItems: state.selectedItems.filter((id) => items.find((asset) => asset._id === id)),
      total,
      full: total <= items.length,
      inProgress: {
        ...state.inProgress,
        lightboards: false,
      },
    };
  }
  case TYPES.ASSETS.REMOVE_LIGHTBOARD.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        lightboards: false,
      },
    };
  }

  /** Add keyword */
  case TYPES.ASSETS.ATTACH_KEYWORD.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        keywords: true,
      },
    };
  }
  case TYPES.ASSETS.ATTACH_KEYWORD.COMPLETE: {
    return {
      ...state,
      items: helpers.attachKeyword(
        state.items,
        payload.keyword,
        payload.ids,
        payload.notify,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        keywords: false,
      },
    };
  }
  case TYPES.ASSETS.ATTACH_KEYWORD.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        keywords: false,
      },
      error,
    };
  }

  /** Remove keyword */
  case TYPES.ASSETS.DETACH_KEYWORD.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        keywords: true,
      },
    };
  }
  case TYPES.ASSETS.DETACH_KEYWORD.COMPLETE: {
    return {
      ...state,
      items: helpers.detachKeywords(
        state.items,
        payload.keywordsIds,
        payload.ids,
        payload.notify,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        keywords: false,
      },
    };
  }
  case TYPES.ASSETS.DETACH_KEYWORD.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        keywords: false,
      },
      error,
    };
  }

  /** Rename keyword */
  case TYPES.ASSETS.RENAME_KEYWORD: {
    return {
      ...state,
      items: helpers.renameKeyword(state.items, payload.id, payload.newName),
    };
  }

  /** Merge keywords */
  case TYPES.ASSETS.MERGE_KEYWORDS: {
    return {
      ...state,
      items: helpers.mergeKeywords(
        state.items,
        payload.keywordsIds,
        payload.targetKeyword,
        payload.ids,
        payload.notify,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        keywords: false,
      },
    };
  }

  /** Update lightboard */
  case TYPES.ASSETS.UPDATE_LIGHTBOARD: {
    return {
      ...state,
      items: helpers.updateLightboard(state.items, payload.id, payload.data),
    };
  }

  /** Delete lightboard */
  case TYPES.ASSETS.DELETE_LIGHTBOARD: {
    return {
      ...state,
      items: helpers.deleteLightboard(state.items, payload.id),
    };
  }

  /** Rename collection */
  case TYPES.ASSETS.RENAME_COLLECTION: {
    return {
      ...state,
      items: helpers.renameCollection(
        state.items,
        payload.id,
        payload.newName,
      ),
    };
  }

  /** Change collection path */
  case TYPES.ASSETS.CHANGE_PATH: {
    return {
      ...state,
      items: helpers.changePath(
        state.items,
        payload.oldPath,
        payload.newPath,
        payload.collectionName,
      ),
    };
  }

  /** Remove all keywords */
  case TYPES.ASSETS.REMOVE_ALL_KEYWORDS: {
    return {
      ...state,
      items: helpers.removeAllKeywords(state.items),
    };
  }

  /** Generate keywords */
  case TYPES.ASSETS.GENERATE_KEYWORDS.START: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.assetsIds,
        ['keywording'],
        ['running'],
      ),
      inProgress: {
        ...state.inProgress,
        keywords: true,
      },
    };
  }
  case TYPES.ASSETS.GENERATE_KEYWORDS.COMPLETE: {
    return {
      ...state,
      items: helpers.setKeywords(state.items, payload.keywordedAssets),
      inProgress: {
        ...state.inProgress,
        keywords: false,
      },
    };
  }
  case TYPES.ASSETS.GENERATE_KEYWORDS.FAILED: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.assetsIds,
        ['keywording'],
        ['failed'],
      ),
      inProgress: {
        ...state.inProgress,
        keywords: false,
      },
      error,
    };
  }

  /** Assign user */
  case TYPES.ASSETS.ASSIGN_USER.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        assignees: true,
      },
    };
  }
  case TYPES.ASSETS.ASSIGN_USER.COMPLETE: {
    return {
      ...state,
      items: helpers.assignUser(
        state.items,
        payload.assigneeId,
        payload.ids,
        payload.notify,
      ),
      inProgress: {
        ...state.inProgress,
        assignees: false,
      },
    };
  }
  case TYPES.ASSETS.ASSIGN_USER.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        assignees: false,
      },
      error,
    };
  }

  /** Unassign user */
  case TYPES.ASSETS.UNASSIGN_USER.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        assignees: true,
      },
    };
  }
  case TYPES.ASSETS.UNASSIGN_USER.COMPLETE: {
    return {
      ...state,
      items: helpers.unAssignUser(
        state.items,
        payload.assigneeId,
        payload.ids,
        payload.notify,
      ),
      inProgress: {
        ...state.inProgress,
        assignees: false,
      },
    };
  }
  case TYPES.ASSETS.UNASSIGN_USER.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        assignees: false,
      },
      error,
    };
  }

  /** Change flag */
  case TYPES.ASSETS.CHANGE_FLAG.START: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        payload.keys,
        payload.values,
        payload.eventType,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        marks: true,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_FLAG.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        payload.keys,
        payload.values,
        payload.eventType,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        marks: false,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_FLAG.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        marks: false,
      },
      error,
    };
  }

  /** Change stars */
  case TYPES.ASSETS.CHANGE_STARS.START: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        payload.keys,
        payload.values,
        payload.eventType,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        marks: true,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_STARS.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        payload.keys,
        payload.values,
        payload.eventType,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        marks: false,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_STARS: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        marks: false,
      },
      error,
    };
  }

  /** Change color */
  case TYPES.ASSETS.CHANGE_COLOR.START: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        payload.keys,
        payload.values,
        payload.eventType,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        marks: true,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_COLOR.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        payload.keys,
        payload.values,
        payload.eventType,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        marks: false,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_COLOR.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        marks: false,
      },
    };
  }

  /** Reset highlight */
  case TYPES.ASSETS.RESET_HIGHLIGHT: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        payload.keys,
        payload.values,
      ),
    };
  }

  /** Rename */
  case TYPES.ASSETS.RENAME.START: {
    return { ...state };
  }
  case TYPES.ASSETS.RENAME.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        [payload.id],
        ['name'],
        [payload.name],
      ),
    };
  }
  case TYPES.ASSETS.RENAME.FAILED: {
    return { ...state, error };
  }

  /** Change title */
  case TYPES.ASSETS.CHANGE_TITLE.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        title: true,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_TITLE.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        ['title'],
        [payload.title],
        null,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        title: false,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_TITLE.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        title: false,
      },
    };
  }

  /** Change description */
  case TYPES.ASSETS.CHANGE_DESCRIPTION.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        description: true,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_DESCRIPTION.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        ['description'],
        [payload.description],
        null,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        description: false,
      },
    };
  }
  case TYPES.ASSETS.CHANGE_DESCRIPTION.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        description: false,
      },
    };
  }

  /** Change custom field */
  case TYPES.ASSETS.CHANGE_CUSTOM_FIELD.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        customField: true,
        customFields: [
          ...state.inProgress.customFields,
          payload.title,
        ],
      },
    };
  }
  case TYPES.ASSETS.CHANGE_CUSTOM_FIELD.COMPLETE: {
    return {
      ...state,
      items: helpers.changeCustomField(
        state.items,
        payload.ids,
        payload.title,
        payload.value,
        payload.userId,
      ),
      inProgress: {
        ...state.inProgress,
        customField: false,
        customFields: state.inProgress.customFields.filter(
          (item) => item !== payload.title,
        ),
      },
    };
  }
  case TYPES.ASSETS.CHANGE_CUSTOM_FIELD.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        customField: false,
        customFields: state.inProgress.customFields.filter(
          (item) => item !== payload.title,
        ),
      },
      error,
    };
  }

  case TYPES.ASSETS.CHANGE_MULTIPLE_CUSTOM_FIELD.ATTACH: {
    return {
      ...state,
      items: helpers.changeMultipleCustomField(
        state.items,
        payload.ids,
        payload.title,
        payload.value,
        payload.userId,
        true,
      ),
      inProgress: {
        ...state.inProgress,
        customField: false,
        customFields: state.inProgress.customFields.filter(
          (item) => item !== payload.title,
        ),
      },
    };
  }
  case TYPES.ASSETS.CHANGE_MULTIPLE_CUSTOM_FIELD.DETACH: {
    return {
      ...state,
      items: helpers.changeMultipleCustomField(
        state.items,
        payload.ids,
        payload.title,
        payload.value,
        payload.userId,
        false,
      ),
      inProgress: {
        ...state.inProgress,
        customField: false,
        customFields: state.inProgress.customFields.filter(
          (item) => item !== payload.title,
        ),
      },
    };
  }

  /** Change trashed */
  case TYPES.ASSETS.CHANGE_TRASHED: {
    const { id, moveToTrash } = payload;
    return {
      ...state,
      items: state.items,
      selectedItems: moveToTrash
        ? state.selectedItems.filter((assetID) => assetID !== id)
        : state.selectedItems,
    };
  }

  case TYPES.ASSETS.SET_USER_ORIENTATION.START: {
    const { ids, value } = payload;
    const { rotation } = value;
    return {
      ...state,
      items: state.items.map((item) => {
        if (ids.includes(item._id)) {
          const editedItem = { ...item, userOrientation: value };
          if (
            rotation !== item.userOrientation.rotation
              && item.imageMediaMetadata
          ) {
            /** if rotation changed */
            editedItem.imageMediaMetadata = {
              rotation,
              height: item.imageMediaMetadata.width,
              width: item.imageMediaMetadata.height,
            };
          }
          return editedItem;
        }
        return item;
      }),
    };
  }

  case TYPES.ASSETS.SET_USER_ORIENTATION.COMPLETE: {
    return state;
  }

  case TYPES.ASSETS.SET_USER_ORIENTATION.FAILED: {
    return { ...state, error: payload.error };
  }

  /** set approvals data */
  case TYPES.ASSETS.UPDATE_APPROVE: {
    return {
      ...state,
      items: helpers.updateApprovals(
        state.items,
        payload.assetId,
        payload.data,
      ),
    };
  }

  /** Share/StopSharing asset */
  case TYPES.ASSETS.SHARE.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        share: true,
      },
    };
  }

  case TYPES.ASSETS.SHARE.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        [payload.assetId],
        ['singleSharingSettings'],
        [payload.data],
      ),
      inProgress: {
        ...state.inProgress,
        share: false,
      },
    };
  }
  case TYPES.ASSETS.SHARE.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        share: false,
      },
    };
  }

  /** Restrict assets */
  case TYPES.ASSETS.RESTRICT.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        restrict: true,
      },
    };
  }

  case TYPES.ASSETS.RESTRICT.COMPLETE: {
    const { ids, value } = payload;
    return {
      ...state,
      items: helpers.setField(
        state.items,
        ids,
        ['restrictSettings'],
        [value],
      ),
      inProgress: {
        ...state.inProgress,
        restrict: false,
      },
    };
  }
  case TYPES.ASSETS.RESTRICT.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        restrict: false,
      },
    };
  }

  /** Delete assets */
  case TYPES.ASSETS.DELETE_ASSETS.START: {
    const { ids, fieldName = CONSTANTS.TRASHING_STATUS_FIELD_NAME } = payload;
    return {
      ...state,
      selectedItems: state.selectedItems.filter((id) => !ids.includes(id)),
      items: helpers.setField(
        state.items,
        ids,
        [fieldName],
        [CONSTANTS.ASYNC_JOB_STATUS_WAITING],
      ),
    };
  }
  case TYPES.ASSETS.DELETE_ASSETS.COMPLETE: {
    const { ids, queued } = payload;
    const countRemoved = state.items.filter((asset) => ids.includes(asset._id)).length;
    const total = !queued ? state.total - countRemoved : state.total;
    const items = !queued
      ? state.items.filter((asset) => !ids.includes(asset._id))
      : helpers.setField(
        state.items,
        ids,
        [CONSTANTS.TRASHING_STATUS_FIELD_NAME],
        [CONSTANTS.ASYNC_JOB_STATUS_WAITING],
      );
    return {
      ...state,
      items,
      selectedItems: state.selectedItems.filter(
        (id) => !payload.ids.includes(id),
      ),
      geo: helpers.removeFromGeo(state.geo || [], ids),
      total,
      full: total <= items.length,
    };
  }
  case TYPES.ASSETS.DELETE_ASSETS.FAILED: {
    const { ids } = payload;
    return {
      ...state,
      items: helpers.setField(
        state.items,
        ids,
        [CONSTANTS.TRASHING_STATUS_FIELD_NAME],
        [CONSTANTS.ASYNC_JOB_STATUS_FAILED],
      ),
      error,
    };
  }

  /** Restore assets */
  case TYPES.ASSETS.RESTORE_ASSETS.START: {
    const { ids } = payload;
    return {
      ...state,
      selectedItems: state.selectedItems.filter((id) => !ids.includes(id)),
      items: helpers.setField(
        state.items,
        ids,
        [CONSTANTS.UNTRASHING_STATUS_FIELD_NAME],
        [CONSTANTS.ASYNC_JOB_STATUS_WAITING],
      ),
    };
  }
  case TYPES.ASSETS.RESTORE_ASSETS.COMPLETE: {
    const { ids } = payload;
    const items = state.items.filter((asset) => !ids.includes(asset._id));
    const total = state.total - ids.length;
    return {
      ...state,
      items,
      selectedItems: state.selectedItems.filter(
        (id) => !payload.ids.includes(id),
      ),
      geo: helpers.removeFromGeo(state.geo || [], ids),
      total,
      full: total <= items.length,
    };
  }
  case TYPES.ASSETS.RESTORE_ASSETS.FAILED: {
    const { ids } = payload;
    return {
      ...state,
      items: helpers.setField(
        state.items,
        ids,
        [CONSTANTS.UNTRASHING_STATUS_FIELD_NAME],
        [CONSTANTS.ASYNC_JOB_STATUS_FAILED],
      ),
      error,
    };
  }

  /** Moving assets */
  case TYPES.ASSETS.MOVING_ASSETS.START: {
    const { ids } = payload;
    return {
      ...state,
      items: helpers.setField(
        state.items,
        ids,
        ['moving'],
        [CONSTANTS.ASYNC_JOB_STATUS_WAITING],
      ),
    };
  }
  case TYPES.ASSETS.MOVING_ASSETS.COMPLETE: {
    const { ids } = payload;
    return {
      ...state,
      items: helpers.setField(
        state.items,
        ids,
        ['moving'],
        [CONSTANTS.ASYNC_JOB_STATUS_COMPLETE],
      ),
    };
  }
  case TYPES.ASSETS.MOVING_ASSETS.FAILED: {
    const { ids } = payload;
    return {
      ...state,
      items: helpers.setField(
        state.items,
        ids,
        ['moving'],
        [CONSTANTS.ASYNC_JOB_STATUS_FAILED],
      ),
    };
  }

  /** Add revision */
  case TYPES.ASSETS.ADD_REVISION.COMPLETE: {
    const {
      assetId, headRevisionId, thumbnailLink, imageMediaMetadata, userId,
    } = payload;
    return {
      ...state,
      items: helpers.addRevision(
        state.items,
        assetId,
        headRevisionId,
        imageMediaMetadata,
        thumbnailLink,
        userId,
      ),
    };
  }

  /** Change upload revision progress */
  case TYPES.ASSETS.CHANGE_UPLOAD_REVISION_PROGRESS: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        [payload.assetID],
        ['uploadRevisionProgress'],
        [payload.value],
      ),
    };
  }

  /** Update asset field */
  case TYPES.ASSETS.UPDATE_FIELDS: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        [payload.assetID],
        payload.fields,
        payload.values,
      ),
    };
  }

  case TYPES.ASSETS.REVERT_REVISION: {
    const {
      assetId, revisionIdToRevert, newRevisionId, userId,
    } = payload;
    return {
      ...state,
      items: helpers.revertRevision(
        state.items,
        assetId,
        revisionIdToRevert,
        newRevisionId,
        userId,
      ),
    };
  }

  /** Remove meta field modified by user from DB */
  case TYPES.ASSETS.REMOVE_MODIFIED_FIELD.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        modifiedFields: [
          ...state.inProgress.modifiedFields,
          payload.fieldName,
        ],
      },
    };
  }
  case TYPES.ASSETS.REMOVE_MODIFIED_FIELD.COMPLETE: {
    return {
      ...state,
      items: helpers.removeModifiedField(
        state.items,
        payload.ids,
        payload.fieldName,
      ),
      inProgress: {
        ...state.inProgress,
        modifiedFields: state.inProgress.modifiedFields.filter(
          (item) => item !== payload.fieldName,
        ),
      },
    };
  }
  case TYPES.ASSETS.REMOVE_MODIFIED_FIELD.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        modifiedFields: state.inProgress.modifiedFields.filter(
          (item) => item !== payload.fieldName,
        ),
      },
    };
  }

  /** Get assets pages */
  case TYPES.ASSETS.FETCH_PAGES.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        pages: true,
      },
    };
  }
  case TYPES.ASSETS.FETCH_PAGES.COMPLETE: {
    let items = [...state.items];
    items = items.map((asset) => {
      if (payload.pages[asset._id]) {
        const updatedAsset = { ...asset };
        if (payload.revisionId) {
          updatedAsset.pages[payload.revisionId] = payload.pages[asset._id];
        } else {
          updatedAsset.pages.head = payload.pages[asset._id];
          updatedAsset.pages.expiresAt = payload.pages[asset._id][0].expiresAt;
        }

        return updatedAsset;
      }

      return asset;
    });
    return {
      ...state,
      items: [...helpers.extendAssets(items)],
      inProgress: {
        ...state.inProgress,
        pages: false,
      },
    };
  }
  case TYPES.ASSETS.FETCH_PAGES.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        pages: false,
      },
      error,
    };
  }

  /** Get asset revisions thumbnails */
  case TYPES.ASSETS.FETCH_REVISIONS_THUMBNAILS.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        revisionsThumbnails: true,
      },
    };
  }
  case TYPES.ASSETS.FETCH_REVISIONS_THUMBNAILS.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        [payload.id],
        ['revisionsThumbnails'],
        [payload.revisionsThumbnails],
      ),
      inProgress: {
        ...state.inProgress,
        revisionsThumbnails: false,
      },
    };
  }
  case TYPES.ASSETS.FETCH_REVISIONS_THUMBNAILS.FAILED: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        revisionsThumbnails: false,
      },
      error,
    };
  }

  case 'archive/archiveAssets/fulfilled': {
    const { ids, reason, hide } = payload;

    if (!hide) {
      return {
        ...state,
        items: state.items.filter(({ _id }) => !ids.includes(_id)),
        selectedItems: [],
      };
    }
    return {
      ...state,
      items: state.items.map((item) => {
        const { _id } = item;

        if (ids.includes(_id)) {
          return { ...item, archived: true, archivedByReason: reason };
        }
        return item;
      }),
    };
  }

  case 'archive/unarchiveAssets/fulfilled': {
    const { ids, hide } = payload;

    if (hide) {
      return {
        ...state,
        items: state.items.filter(({ _id }) => !ids.includes(_id)),
        selectedItems: [],
      };
    }
    return {
      ...state,
      items: state.items.map((item) => {
        const { _id } = item;

        if (ids.includes(_id)) {
          return { ...item, archived: false };
        }
        return item;
      }),
    };
  }

  /** Remove meta field modified by user from DB */
  case TYPES.ASSETS.RERUN_PARSING.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        processing: true,
      },
    };
  }
  case TYPES.ASSETS.RERUN_PARSING.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        [payload.jobName],
        [CONSTANTS.ASYNC_JOB_STATUS_WAITING],
      ),
      inProgress: {
        ...state.inProgress,
        processing: false,
      },
    };
  }
  case TYPES.ASSETS.RERUN_PARSING.FAILED: {
    return {
      ...state,
      error,
      inProgress: {
        ...state.inProgress,
        processing: false,
      },
    };
  }

  case TYPES.ASSETS.FETCH_WATERMARKS: {
    return {
      ...state,
      watermarks: payload.watermarks,
    };
  }

  case TYPES.ASSETS.DELETE_WATERMARKS: {
    return {
      ...state,
      watermarks: state.watermarks.filter((item) => item._id !== payload.watermarkId),
      items: helpers.setField(
        state.items,
        state.items.filter(
          (item) => item.watermarkId === payload.watermarkId,
        )
          .map((item) => item._id),
        ['watermarkId'],
        [null],
      ),
    };
  }

  case TYPES.ASSETS.CHANGE_WATERMARK: {
    return {
      ...state,
      watermarks: helpers.setField(
        state.watermarks,
        payload.watermarkId,
        payload.keys,
        payload.values,
      ),
      items: helpers.setField(
        state.items,
        payload.itemIds,
        ['watermarkChanged'],
        ['true'],
      ),
    };
  }

  case TYPES.ASSETS.SET_DEFAULT_WATERMARK: {
    return {
      ...state,
      watermarks: state.watermarks.map((watermark) => {
        const { _id } = watermark;
        if (payload.watermarkId === _id) {
          return { ...watermark, isDefault: true };
        }
        return { ...watermark, isDefault: false };
      }),
    };
  }

  case TYPES.ASSETS.ATTACH_WATERMARK.START: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        watermarking: true,
      },
    };
  }

  case TYPES.ASSETS.ATTACH_WATERMARK.COMPLETE: {
    return {
      ...state,
      items: helpers.setField(
        state.items,
        payload.ids,
        ['watermarkId'],
        [payload.watermarkId],
      ),
      inProgress: {
        ...state.inProgress,
        watermarking: false,
      },
    };
  }

  case TYPES.ASSETS.ATTACH_WATERMARK.FAIL: {
    return {
      ...state,
      inProgress: {
        ...state.inProgress,
        watermarking: false,
      },
    };
  }

  case TYPES.ASSETS.ATTACH_COMMENT: {
    return {
      ...state,
      items: state.items.map((item) => {
        const { _id } = item;

        if (_id === payload.assetId) {
          const comments = item.comments ? [...item.comments, payload.comment] : [payload.comment];
          return { ...item, comments };
        }
        return item;
      }),
    };
  }

  default: {
    // Please note: we can migrate to slice gradually as below
    return state;
  }
  }
}
