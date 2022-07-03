import pull from 'lodash.pull';
import union from 'lodash.union';
import uniq from 'lodash.uniq';
import remove from 'lodash.remove';
import * as ApiImport from '../../../api/import';
import ResolveDuplicatesDialog from '../../../components/resolveDuplicatesDialog';
import * as utils from '../../../shared/utils';
import UiBlocker from '../../../services/UiBlocker';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import {
  setGoogleThumbnailUrls,
  setCustomThumbnail as _setCustomThumbnail,
  getCustomThumbnailUrls,
  getGoogleThubnailUrls,
  setS3ThumbnailUrls,
} from './thumbnails';
import _extendAssets from './extend';
import { isRoutePreview, getSearchProps } from '../../../helpers/history';
import { showDialog } from '../../../components/dialog';
import sdk from '../../../sdk';

export const extendAssets = _extendAssets;
export const setCustomThumbnail = _setCustomThumbnail;

export const setThumbnailUrls = (assets, thumbnails, isUsedS3Storage) => {
  if (isUsedS3Storage) {
    return setS3ThumbnailUrls(assets, thumbnails);
  }
  return setGoogleThumbnailUrls(assets, thumbnails);
};

function addHighlight(asset, name) {
  asset.paramsForHighlight = [...asset.paramsForHighlight, name];
}

/**
 * Select model or range
 * @param {boolean} value
 * @param {string} id
 * @param {boolean} isRange
 * @param {string} lastClicked
 * @param {array} items
 * @param {string[]} selectedItems
 * @returns {string[]} - new selected items
 */
export function select(value, id, isRange, lastClicked, items, selectedItems) {
  if (value) {
    if (isRange && lastClicked) {
      const range = [
        items.findIndex((item) => item._id === lastClicked),
        items.findIndex((item) => item._id === id),
      ].sort((a, b) => a - b);
      range[1] += 1;
      const sliced = items.slice(...range);
      /** return value */
      return uniq([...selectedItems, ...sliced.map((item) => item._id)]);
    }
    /** return value */
    return [...selectedItems, id];
  }
  /** return value */
  return selectedItems.filter((item) => item !== id);
}

function updateModifiedMetaFields(modifiedMetaFields = [], fieldName, value, userId) {
  const existsField = modifiedMetaFields.find((field) => field.name === fieldName);
  if (existsField) {
    existsField.userId = userId;
    existsField.updatedAt = new Date();
  } else {
    const newField = {
      name: utils.capitalizeFirstLetter(fieldName),
      userId,
      updatedAt: new Date(),
    };
    if (value) newField.value = newField;

    modifiedMetaFields.push(newField);
  }

  return modifiedMetaFields;
}

/**
 * Select assets
 * @param {boolean} value
 * @param {array} ids
 * @param {string[]} selectedItems
 * @returns {string[]} - new selected items
 */
export function selectMany(value, ids, selectedItems) {
  if (value) {
    return union(selectedItems, ids);
  }
  return pull(selectedItems, ...ids);
}

/**
 * Set field to asset
 * @param {Object[]} items - assets
 * @param {string[]} assetsIds
 * @param {string[]} keys
 * @param {*[]} values
 * @param {string?} eventType - for add highlight to UI
 * @param {string} userId
 * @returns {Object[]} newItems
 */
export function setField(items, assetsIds, keys, values, eventType, userId) {
  let hasChanges = false;
  const newItems = items.map((item) => {
    if (assetsIds.includes(item._id)) {
      hasChanges = true;
      const newItem = { ...item };
      keys.forEach((key, index) => {
        if (utils.isObject(values[index]) && utils.isObject(newItem[key])) {
          newItem[key] = { ...newItem[key], ...values[index] };

          // don't add modifiedMetaFields when asset.metadating.complete
          // metadater in not an user
          if (userId) {
            newItem.modifiedMetaFields = updateModifiedMetaFields(
              newItem.modifiedMetaFields,
              key,
              values[index],
              userId,
            );
          }
        } else {
          newItem[key] = values[index];
          // don't add modifiedMetaFields when asset.metadating.complete
          // metadater in not an user
          if (userId) {
            newItem.modifiedMetaFields = updateModifiedMetaFields(
              newItem.modifiedMetaFields,
              key,
              values[index],
              userId,
            );
          }
        }
      });
      if (eventType) addHighlight(newItem, eventType);
      return newItem;
    }
    return item;
  });

  return hasChanges ? newItems : items;
}

/**
 * @param {Object[]} items
 * @param {string[]} assetsIds
 * @param {string} key - custom field title
 * @param {string} value - new custom field value
 * @param {string} userId
 * @returns {Object[]} new items
 */
export function changeCustomField(items, assetsIds, key, value, userId) {
  return items.map((asset) => {
    if (assetsIds.includes(asset._id)) {
      const newMeta = {
        ...(asset.meta || {}),
        [key]: value,
      };
      return {
        ...asset,
        modifiedMetaFields: updateModifiedMetaFields(asset.modifiedMetaFields, key, value, userId),
        meta: newMeta,
      };
    }
    return asset;
  });
}

/**
 * @param {Object[]} items
 * @param {string[]} assetsIds
 * @param {string} key - custom field title
 * @param {string} value - new custom field value
 * @param {string} userId
 * @returns {Object[]} new items
 */
export function changeMultipleCustomField(items, assetsIds, key, value, userId, isAttach) {
  return items.map((asset) => {
    if (assetsIds.includes(asset._id)) {
      const currentMeta = asset.meta || {};
      let newValue = value;
      const newMeta = {
        ...(asset.meta || {}),
      };

      if (isAttach) {
        if (currentMeta[key]) {
          /** for some reason value may be 'true', or something else */
          const currentValue = typeof asset.meta[key] === 'string' ? asset.meta[key].split(',') : [];
          if (!currentValue.includes(value)) {
            currentValue.push(value);
            newValue = currentValue.toString();
            newMeta[key] = newValue;
          }
        } else {
          newMeta[key] = value;
        }
      } else if (currentMeta[key]) {
        /** for some reason value may be 'true', or something else */
        let currentValue = typeof asset.meta[key] === 'string' ? asset.meta[key].split(',') : [];
        if (currentValue.includes(value)) {
          currentValue = currentValue.filter((item) => item !== value);
          newValue = currentValue.toString();
          if (newValue) {
            newMeta[key] = newValue;
          } else {
            delete newMeta[key];
          }
        }
      }
      return {
        ...asset,
        modifiedMetaFields: updateModifiedMetaFields(asset.modifiedMetaFields, key, value, userId),
        meta: newMeta,
      };
    }
    return asset;
  });
}

/**
 * @param {Object[]} items
 * @param {string} assetId
 * @param {Object} data - approval data
 */
export function updateApprovals(items, assetId, data) {
  return items.map((asset) => {
    if (asset._id === assetId) {
      const approvals = (asset.approvals || []).map((item) => ({ ...item }));
      approvals.push(data);
      return {
        ...asset,
        approvals,
      };
    }
    return asset;
  });
}

/**
 * Add keywords to assets
 * @param {Object[]} items
 * @param {Object[]} keywordedAssets
 * @returns {Object[]} newItems
 */
export function setKeywords(items, keywordedAssets) {
  return items.map((asset) => {
    const assetWithNewKeywords = keywordedAssets.find((ka) => ka._id === asset._id);
    if (assetWithNewKeywords) {
      const keywords = [...(asset.keywords || [])];
      assetWithNewKeywords.keywords.forEach((newKeyword) => {
        const isKeywordAlreadyOnTheAsset = Boolean(
          keywords.find((keyword) => keyword._id === newKeyword._id),
        );
        if (!isKeywordAlreadyOnTheAsset) keywords.push(newKeyword);
      });
      return {
        ...asset,
        keywords,
        keywording: 'complete',
      };
    }
    return asset;
  });
}

/**
 * Rename keyword inside assets
 * @param {Object[]} items
 * @param {string} keywordId
 * @param {string} newName
 * @returns {Object[]} newItems
 */
export function renameKeyword(items, keywordId, newName) {
  return items.map((asset) => {
    const index = (asset.keywords || []).findIndex((keyword) => keyword._id === keywordId);

    if (index > -1) {
      const cloned = asset.keywords.map((keyword) => ({ ...keyword }));
      cloned[index].path = cloned[index].path[0] + newName;
      return {
        ...asset,
        keywords: cloned,
      };
    }
    return asset;
  });
}

/**
 * Rename collection inside assets
 * @param {Object[]} items
 * @param {string} id - collection id
 * @param {string} newName - new collection name
 * @returns {Object[]} newItems
 */
export function renameCollection(items, id, newName) {
  return items.map((asset) => {
    const cloned = asset.tags.map((collection) => ({ ...collection }));
    const index = cloned.findIndex((item) => item._id === id);

    if (index > -1) {
      /** if asset contains renamed collection */
      /** @type {string[]} */
      const pathArray = cloned[index].path.split('/');
      pathArray[pathArray.length - 1] = newName;
      cloned[index].path = pathArray.join('/');

      return {
        ...asset,
        tags: cloned,
      };
    }
    return asset;
  });
}

/**
 * Remove ids from geo
 * @param {object[]} geo
 * @param {string[]} ids - asset ids to remove
 * @returns {object[]} - new geo
 */
export function removeFromGeo(geo, ids) {
  return geo
    .map((item) => {
      /** if single marker AND its id in ids */
      if (item.properties._id && ids.includes(item.properties._id)) {
        return null; // remove marker from geo
      }
      /** if cluster AND it's slider */
      if (item.properties.cluster && item.ids) {
        /** if need to remove one or more ids from cluster */
        if (item.ids.some((id) => ids.includes(id))) {
          const newItemIds = item.ids.filter((id) => !ids.includes(id));

          if (newItemIds === 0) return null; // remove cluster from geo
          return {
            ...item,
            ids: newItemIds,
            properties: {
              ...item.properties,
              point_count: newItemIds.length,
            },
          };
        }
      }
      return item; // do nothing
    })
    .filter(Boolean);
}

/**
 * Add assets to collection
 * @param {Object[]} items - store items
 * @param {string[]} assetIDs - assets ids to modify
 * @param {string} collectionID
 * @param {string} collectionPath - collection path
 * @param {Boolean} isMove
 * @param {Boolean} isMoveIntoNestedCollection
 * @param {string} activeCollectionID - tagId from search query
 * @returns {Object[]} new store items
 */
export function addToCollection({
  items,
  assetIDs,
  collectionID,
  collectionPath,
  isMove = false,
  isTeamDrive,
  isMoveIntoNestedCollection = false,
  activeCollectionID,
}) {
  const isPreview = isRoutePreview();
  return items
    .map((asset) => {
      if (assetIDs.includes(asset._id)) {
        /** if need to change collections property */
        if (
          asset.tags
          && asset.tags.some((collection) => collection._id === collectionID)
          && !isMove
        ) {
          /** if collection already added AND no need to remove another collections */
          return asset;
        }
        if (isTeamDrive || isMove) {
          if (
            (!isPreview
              && isTeamDrive
              && activeCollectionID !== collectionID
              && !isMoveIntoNestedCollection)
            || (!isPreview && isMove && !isMoveIntoNestedCollection)
          ) {
            /** in team drive asset moved to another collection - remove from view */
            return null;
          }
          return {
            ...asset,
            tags: [{ _id: collectionID, path: collectionPath }],
            lightboards: [],
          };
        }
        const collections = (asset.tags || []).map((collection) => ({ ...collection }));
        return {
          ...asset,
          tags: [...collections, { _id: collectionID, path: collectionPath }],
        };
      }
      return asset;
    })
    .filter(Boolean);
}

/**
 * Delete collection inside assets
 * @param {Object[]} items
 * @param {string} collectionID
 * @param {string[]?} selectedIDs
 * @param {boolean} withoutReload
 * @returns {Object} { items, itemsRemoved }
 */
export function removeFromCollection(items, collectionID, selectedIDs = [], withoutReload) {
  // if current active collection is the romoving collection
  // then remove catalogItems from dom which has the same tag
  if (!withoutReload && getSearchProps().tagId === collectionID) {
    return {
      items: items.filter((asset) => !selectedIDs.includes(asset._id)),
      itemsRemoved: selectedIDs.length,
    };
  }
  const newItems = items.map((asset) => {
    if (selectedIDs.includes(asset._id)) {
      const collections = asset.tags.map((collection) => ({ ...collection }));
      remove(collections, (collection) => collection._id === collectionID);
      return {
        ...asset,
        tags: collections,
      };
    }
    return asset;
  });

  return {
    items: newItems,
    itemsRemoved: 0,
  };
}

/**
 * Add assets to lightboard
 * @param {Object[]} items - store items
 * @param {string[]} assetIDs - assets ids to modify
 * @param {string} lightboardID
 * @param {string} lightboardPath
 * @param {Boolean} isMove
 * @returns {Object[]} new store items
 */
export function addToLightboard({
  items,
  assetIDs,
  lightboardID,
  lightboardPath,
  isMove = false,
  isTeamDrive,
  userId,
}) {
  return items
    .map((asset) => {
      if (assetIDs.includes(asset._id)) {
        /** if need to change lightboards property */
        if (
          asset.lightboards
          && asset.lightboards.some((lightboard) => lightboard._id === lightboardID)
        ) {
          /** if lightboard already added */
          return asset;
        }
        const newLightboard = {
          userId,
          _id: lightboardID,
          path: lightboardPath,
        };
        if (isTeamDrive || isMove) {
          if (getSearchProps().lightboardId !== lightboardID) {
            /** in team drive asset moved to another collection - remove from view */
            return null;
          }
          return {
            ...asset,
            tags: [],
            lightboards: [newLightboard],
          };
        }
        const lightboards = (asset.lightboards || []).map((lightboard) => ({ ...lightboard }));
        return {
          ...asset,
          lightboards: [...lightboards, newLightboard],
        };
      }
      return asset;
    })
    .filter(Boolean);
}

/**
 * @param {Object[]} items
 * @param {string[]} ids - assets ids
 * @param {string} lightboardID
 * @returns {Object} - {items: new items, itemsRemoved: count removed items}
 */
export function removeFromLightboard(items, ids, lightboardID) {
  // if current active lightboard is the romoving lightboard
  // then remove catalogItems from dom which has the same lightboard
  if (getSearchProps().lightboardId === lightboardID) {
    return {
      items: items.filter((asset) => !ids.includes(asset._id)),
      itemsRemoved: ids.length,
    };
  }
  const newItems = items
    .map((asset) => {
      if (ids.includes(asset._id)) {
        /** if need to change lightboards property */
        const lightboards = (asset.lightboards || []).map((lb) => ({ ...lb }));
        const index = lightboards.findIndex((lb) => lb._id === lightboardID);

        if (index > -1) {
          lightboards.splice(index, 1);

          /** asset removed */
          if (asset.tags && asset.tags.length === 0 && lightboards.length === 0) return null;

          return {
            ...asset,
            lightboards,
          };
        }
        return asset;
      }
      return asset;
    })
    .filter(Boolean);

  return {
    items: newItems,
    itemsRemoved: items.length - newItems.length,
  };
}

/**
 * Update lightboard
 * @param {Object[]} items
 * @param {string} id - lightboard id
 * @param {Object} data - lightboard data
 * @returns {Object[]}
 */
export function updateLightboard(items, id, data) {
  return items.map((asset) => {
    const lightboards = (asset.lightboards || []).map((lb) => ({ ...lb }));
    const index = lightboards.findIndex((lb) => lb._id === id);
    if (index > -1) {
      lightboards[index] = Object.assign(lightboards[index], data);
      return {
        ...asset,
        lightboards,
      };
    }
    return asset;
  });
}

/**
 * Delete lightboard
 * @param {Object[]} items
 * @param {string} id - lightboard id
 * @returns {Object[]} new items
 */
export function deleteLightboard(items, id) {
  return items.map((asset) => {
    const lightboards = (asset.lightboards || []).map((lb) => ({ ...lb }));
    const index = lightboards.findIndex((lb) => lb._id === id);

    if (index > -1) {
      lightboards.splice(index, 1);
      return {
        ...asset,
        lightboards,
      };
    }
    return asset;
  });
}

/**
 * Remove all keywords from assets
 * @param {Object[]} items
 * @returns {Object[]} newItems
 */
export function removeAllKeywords(items) {
  return items.map((asset) => ({
    ...asset,
    keywords: [],
  }));
}

/**
 * Handle add revision
 * @param {Object[]} items
 * @param {string} assetID
 * @param {string} headRevisionId
 * @param {string} thumbnailUrl
 * @returns {Object[]} newItems
 */
export function addRevision(
  items,
  assetID,
  headRevisionId,
  imageMediaMetadata,
  thumbnailUrl = null,
  userId,
) {
  return items.map((asset) => {
    if (asset._id === assetID) {
      if (asset.customThumbnail) {
        const newCustomThumbnail = { ...asset.customThumbnail };
        newCustomThumbnail[headRevisionId] = thumbnailUrl;
        newCustomThumbnail.head = thumbnailUrl;
        return {
          ...asset,
          thumbnailing: 'waiting',
          thumbnail: thumbnailUrl ? getCustomThumbnailUrls(thumbnailUrl) : asset.thumbnail,
          customThumbnail: newCustomThumbnail,
          updatedAt: new Date(),
        };
      }
      const mediaMetadata = imageMediaMetadata || asset.imageMediaMetadata;
      const editedAsset = {
        ...asset,
        imageMediaMetadata: mediaMetadata,
      };

      // add a new revision to store
      if (!Array.isArray(editedAsset.revisions)) editedAsset.revisions = [];
      editedAsset.revisions.push({ revisionId: headRevisionId, userId });

      if (!asset.is3DModel && !asset.isAudio && thumbnailUrl) {
        editedAsset.thumbnail = getGoogleThubnailUrls(thumbnailUrl, mediaMetadata);
      }
      return editedAsset;
    }
    return asset;
  });
}

/**
 * Assign user to selected assets
 * @param {Object[]} items
 * @param {string} assigneeId
 * @param {array} ids
 * @param {boolean?} notifyAboutEvent
 * @returns {Object[]} newItems
 */
export function assignUser(items, assigneeId, ids, notifyAboutEvent) {
  return items.map((asset) => {
    if (ids.includes(asset._id)) {
      const newAsset = { ...asset };
      const assignees = (asset.assignees || []).map((user) => ({ ...user }));
      assignees.push({ assigneeId });
      newAsset.assignees = assignees;
      if (notifyAboutEvent) addHighlight(newAsset, 'assign');
      return newAsset;
    }
    return asset;
  });
}

/**
 * Unassign user to selected assets
 * @param {Object[]} items
 * @param {string} assigneeId
 * @param {array} ids
 * @param {boolean?} notifyAboutEvent
 * @returns {Object[]} newItems
 */
export function unAssignUser(items, assigneeId, ids, notifyAboutEvent) {
  return items.map((asset) => {
    if (ids.includes(asset._id)) {
      const newAsset = { ...asset };
      const assignees = (asset.assignees || []).map((user) => ({ ...user }));
      remove(assignees, (assignee) => assignee.assigneeId === assigneeId);
      newAsset.assignees = assignees;
      if (notifyAboutEvent) addHighlight(newAsset, 'assign');
      return newAsset;
    }
    return asset;
  });
}

/**
 * Add keyword to selected assets
 * @param {Object[]} items
 * @param {Object} keyword
 * @param {array} ids
 * @param {boolean?} notifyAboutEvent
 * @param {string} userId
 * @returns {Object[]} newItems
 */
export function attachKeyword(items, keyword, ids, notifyAboutEvent, userId) {
  const newItems = [...items];
  const selected = newItems.filter((item) => ids.includes(item._id));
  const assetsWithoutKeyword = selected.filter((asset) => {
    const keywords = (asset.keywords || []).map((keywordItem) => ({ ...keywordItem }));
    return !keywords.find(
      (kw) => kw.path.split('→').pop() === keyword.path.split('→').pop().trim()
        && kw._id !== keyword._id,
    );
  });
  assetsWithoutKeyword.forEach((asset) => {
    const keywords = (asset.keywords || []).map((keywordItem) => ({ ...keywordItem }));
    keywords.push(keyword);
    asset.keywords = keywords;
    asset.modifiedMetaFields = updateModifiedMetaFields(
      asset.modifiedMetaFields,
      'Keywords',
      null,
      userId,
    );
    if (notifyAboutEvent) addHighlight(asset, 'keyword');
  });

  return newItems;
}

/**
 * Remove keyword from selected assets
 * @param {Object[]} items
 * @param {string[]} keywordsIds
 * @param {array} ids
 * @param {boolean?} notifyAboutEvent
 * @param {string} userId
 * @returns {Object[]} newItems
 */
export function detachKeywords(items, keywordsIds, ids, notifyAboutEvent, userId) {
  let hasChanges = false;
  const newItems = items.map((item) => {
    if (ids.includes(item._id)) {
      const newItem = { ...item };
      if (newItem.keywords?.length) {
        hasChanges = true;
        newItem.keywords = newItem.keywords.filter((kw) => !keywordsIds.includes(kw._id));
      }
      newItem.modifiedMetaFields = updateModifiedMetaFields(
        newItem.modifiedMetaFields,
        'Keywords',
        null,
        userId,
      );
      if (notifyAboutEvent) addHighlight(newItem, 'keyword');
      return newItem;
    }
    return item;
  });

  return hasChanges ? newItems : items;
}

/**
 * Merge keywords from selected assets
 * @param {Object[]} items
 * @param {string[]} keywordsIds
 * @param {Object} newKeyword
 * @param {array} ids
 * @param {boolean?} notifyAboutEvent
 * @param {string} userId
 * @returns {Object[]} newItems
 */
export function mergeKeywords(items, keywordsIds, newKeyword, ids, notifyAboutEvent, userId) {
  let hasChanges = false;
  const newItems = items.map((item) => {
    if (ids.includes(item._id)) {
      const newItem = { ...item };
      if (newItem.keywords?.length) {
        hasChanges = true;
        // remove merged keywords
        newItem.keywords = newItem.keywords.filter((kw) => !keywordsIds.includes(kw._id));

        // add new keyword from merged keywords
        const isKeywordExists = newItem.keywords.find((kw) => newKeyword._id === kw._id);
        if (!isKeywordExists) {
          newItem.keywords.push(newKeyword);
        }
      }
      newItem.modifiedMetaFields = updateModifiedMetaFields(
        newItem.modifiedMetaFields,
        'Keywords',
        null,
        userId,
      );
      if (notifyAboutEvent) addHighlight(newItem, 'keyword');
      return newItem;
    }
    return item;
  });

  return hasChanges ? newItems : items;
}

/**
 * Change collection path inside assets
 * @param {Object[]} items
 * @param {string} oldPath - old path
 * @param {string} newPath - new path
 * @returns {Object[]} newItems
 */
export function changePath(items, oldPath, newPath, collectionName) {
  return items.map((asset) => {
    const isAssetContainOldPath = asset.tags.some((collection) => collection.path.startsWith(`/root${oldPath}${collectionName}`));

    if (isAssetContainOldPath) {
      const cloned = asset.tags.map((collection) => ({ ...collection }));
      cloned.forEach((collection) => {
        if (collection.path.startsWith(`/root${oldPath}${collectionName}`)) {
          collection.path = collection.path.replace(`/root${oldPath}`, `/root${newPath}`);
        }
      });
      return {
        ...asset,
        tags: cloned,
      };
    }
    return asset;
  });
}

/**
 * Revert asset revision
 * @param {Object[]} items
 * @param {string} assetId
 * @param {string} revisionIdToRevert
 * @param {string} newRevisionId
 * @returns {Object} items|newItems
 */
export function revertRevision(items, assetId, revisionIdToRevert, newRevisionId, userId) {
  /** if asset not found in the store - exit */
  if (!items.find((asset) => asset._id === assetId)) return items;

  return items.map((asset) => {
    if (asset._id !== assetId) return asset;

    const clonedAsset = { ...asset };
    if (asset.revisions) {
      clonedAsset.revisions = [...asset.revisions, { userId, revisionId: newRevisionId }];
    }
    if (asset.customThumbnail && asset.customThumbnail[revisionIdToRevert]) {
      const url = asset.customThumbnail[revisionIdToRevert];
      /** set custom thumbnail */
      clonedAsset.customThumbnail = {
        ...asset.customThumbnail,
        head: url,
        [newRevisionId]: url,
      };
      /** set thumbnail */
      clonedAsset.thumbnail = getCustomThumbnailUrls(url);
    }
    if (asset.pages && asset.pages[revisionIdToRevert]) {
      const newRevisionPages = asset.pages[revisionIdToRevert];
      /** set pages */
      clonedAsset.pages = {
        ...asset.pages,
        head: newRevisionPages,
        [newRevisionId]: newRevisionPages,
      };
    }

    clonedAsset.headRevisionId = newRevisionId;

    return clonedAsset;
  });
}

/**
 * Find duplicates on the server and resolve
 */
export async function findAndResolveDuplicates({ assets, collectionId, lightboardId }) {
  let duplicates;
  let filteredAssets;
  const assetNamesToRestore = assets.map((a) => a.name);

  UiBlocker.block();
  try {
    const { data } = await sdk.assets.detectDuplicates(
      assetNamesToRestore,
      collectionId,
      lightboardId,
    );
    duplicates = data;
    UiBlocker.unblock();
  } catch (error) {
    UiBlocker.unblock();
    throw error;
  }
  if (duplicates && duplicates.length) {
    /** Resolve duplicates */
    const dialog = new ResolveDuplicatesDialog();
    const resolvedAssets = await dialog.resolve(duplicates, assets, true, false);
    filteredAssets = resolvedAssets.filter((asset) => asset.action !== 'skipFile');
  }
  const resolvedAssets = filteredAssets || assets;

  /** fill actions */
  const actions = resolvedAssets.reduce((act, asset) => {
    if (asset.action === 'replaceFile') {
      act[asset._id] = {
        action: 'replace',
        assetIdToReplace: asset.duplicatedModel._id,
      };
    }
    if (asset.action === 'renameFile') {
      act[asset._id] = { action: 'rename' };
    }
    return act;
  }, {});

  return {
    assets: resolvedAssets,
    actions: Object.keys(actions).length ? actions : undefined,
  };
}

/**
 * Check download consent
 */
export async function checkDownloadConsent() {
  const isConsentNeeded = window.websiteConfig.actionConsentEnable;
  if (isConsentNeeded && !utils.getCookie(utils.getWebsiteCookieName('downloading'))) {
    Logger.log('UI', 'DownloadConsentDialog');
    return new Promise((resolve, reject) => {
      showDialog({
        title: localization.DIALOGS.DOWNLOAD_CONSENT.TITLE(window.websiteConfig.actionConsentTitle),
        text: localization.DIALOGS.DOWNLOAD_CONSENT.TEXT(window.websiteConfig.actionConsentMessage),
        checkbox: {
          label: localization.DIALOGS.DOWNLOAD_CONSENT.LABEL,
        },
        textBtnCancel: localization.DIALOGS.DOWNLOAD_CONSENT.CANCEL_TEXT,
        textBtnOk: localization.DIALOGS.DOWNLOAD_CONSENT.OK_TEXT,
        onOk: ({ checkbox }) => {
          Logger.log('User', 'DownloadConsentDialogConfirm');
          if (checkbox) {
            Logger.log('User', 'DownloadConsentDialogDontShowAgain');
            utils.setCookie(utils.getWebsiteCookieName('downloading'), true);
          }
          resolve();
        },
        onCancel: () => {
          Logger.log('User', 'DownloadConsentDialogReject');
          reject();
        },
      });
    });
  }
  return Promise.resolve();
}

/**
 * Remove meta field modified by user from DB
 * @param {Object[]} items
 * @param {array} ids
 * @param {string} fieldName
 * @returns {Object[]} newItems
 */
export function removeModifiedField(items, ids, fieldName) {
  let hasChanges = false;
  const newItems = items.map((item) => {
    if (ids.includes(item._id)) {
      const newItem = { ...item };
      let { modifiedMetaFields } = newItem;
      const field = modifiedMetaFields.find((mfField) => mfField.name === fieldName);
      if (field) {
        hasChanges = true;
        modifiedMetaFields = modifiedMetaFields.filter((mfField) => mfField.name !== fieldName);
        newItem.modifiedMetaFields = modifiedMetaFields;
      }
      return newItem;
    }
    return item;
  });
  return hasChanges ? newItems : items;
}

const isAssetDownloadable = (asset, rolePermissions) => {
  const isRestricted = utils.isAssetRestricted(asset.restrictSettings);
  const isRestrictedDownloadable = !isRestricted
    || (isRestricted && rolePermissions.restrictedDownload);
  const isArchived = asset.archived;

  if (isArchived && !rolePermissions.downloadArchive) {
    return false;
  }
  if (asset.isDownloadable && isRestrictedDownloadable) {
    return true;
  }
  return false;
};

const isAssetRemovable = (asset, rolePermissions) => {
  const isArchived = asset.archived;
  const isRestricted = utils.isAssetRestricted(asset.restrictSettings);

  if (isArchived && !rolePermissions.deleteArchive) {
    return false;
  }
  if (!isRestricted || (isRestricted && rolePermissions.restrictedMoveOrDelete)) {
    return true;
  }
  return false;
};

export function getPermissions(
  items,
  selectedItemsIds,
  rolePermissions,
  assetsBatchPermissions = null, // permissions from server (when selected > 50 assets)
) {
  const selectedItems = items.filter((asset) => selectedItemsIds.includes(asset._id));

  if (selectedItems.length) {
    const isDownloadable = selectedItems.every((asset) => isAssetDownloadable(asset, rolePermissions));
    const isRemovable = selectedItems.every((asset) => isAssetRemovable(asset, rolePermissions));
    const assetsPermissions = assetsBatchPermissions
      || utils.mergePermissions(selectedItems.map((n) => n.permissions));

    let canBeCompared = false;
    if (selectedItems.length === 2) {
      canBeCompared = utils.canBeCompared(selectedItems);
    }
    return {
      canBeCompared,
      isDownloadable,
      isRemovable,
      ...rolePermissions,
      ...assetsPermissions,
    };
  }
  return {};
}
