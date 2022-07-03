import * as syncApi from '../../api/syncs';
import localization from '../../shared/strings';
import store from '../index';
import Logger from '../../services/Logger';
import { showDialog } from '../../components/dialog';

export const eventsWithThumbnails = [
  'asset.comment.added',
  'asset.comment.deleted',
  'asset.created',
  'assets.trashed',
  'asset.renamed',
  'asset.copied',
  'assets.untrashing.complete',
  'asset.revision.approved',
  'asset.revision.created',
  'asset.revision.disapproved',
  'asset.revision.reverted',
  'assets.assigned',
  'inbox.asset.created',
];

/**
 * Make notification read
 * @param {Object[]} items
 * @param {Object[]} newComments
 * @param {Object[]} newRevisions
 * @param {string[]} ids
 * @returns {Object} items
 */
export const setNotificationRead = (items, newComments, newRevisions, ids) => {
  const updatedItems = [];
  const updatedNewComments = { ...newComments };
  const updatedNewRevisions = { ...newRevisions };
  items.forEach(item => {
    if (ids.includes(item._id)) {
      updatedItems.push({ ...item, read: true });
      if (item.type === 'asset.comment.added') {
        const assetId = item.data?.asset?._id;
        if (updatedNewComments[assetId]) {
          updatedNewComments[assetId] = updatedNewComments[assetId].filter(i => i !== item._id);
        }
      }
      if (item.type === 'asset.revision.created') {
        const assetId = item.data?.asset?._id;
        if (updatedNewRevisions[assetId]) {
          updatedNewRevisions[assetId] = updatedNewRevisions[assetId].filter(i => i !== item._id);
        }
      }
    } else {
      updatedItems.push(item)
    }
  });
  return { updatedItems, updatedNewComments, updatedNewRevisions };
};

/**
 * Set notification asset thumnail loading
 * @param {Object[]} items
 * @param {string} id
 * @param {string} key
 * @param {string} value
 * @returns {Object} items
 */
export const setThumbnailsField = (items, ids, keyName, value) => {
  return items.map((item) => {
    let itemToModify = null;
    if (item.data) {
      const storageId =
        (item.data.asset && (item.data.asset.storageId || item.data.asset.googleId)) ||
        (item.data.assets && item.data.assets.length && (item.data.assets[0].storageId || item.data.assets[0].googleId));

      itemToModify = eventsWithThumbnails.includes(item.type) ? ids.includes(storageId) : undefined;
    }
    return itemToModify ? { ...item, thumbnail: { [keyName]: value } } : item;
  });
};

/**
 * Set notifications asset thumnail
 * @param {Object[]} items
 * @param {Object[]} thumbnails
 * @returns {Object} items
 */
export const setThumbnails = (items, thumbnails) => {
  return items.map((item, index) => {
    let thumbnail = null;
    if (item.data) {
      let _id;
      // this check needs when we merge events and we need to set thumb of the first asset
      if (index === 0 && thumbnails.length === 1 && item.data.assets) {
        if (item.data.assets.some((asset) => asset._id === thumbnails[0]._id)) {
          _id = thumbnails[0]._id;
        }
      } else {
        _id =
          (item.data.asset && item.data.asset._id) || (item.data.assets && item.data.assets.length && item.data.assets[0]._id);
      }

      thumbnail = eventsWithThumbnails.includes(item.type)
        ? thumbnails.find((thumb) => (thumb._id === _id ? thumb : false))
        : undefined;
    }
    return thumbnail
      ? {
          ...item,
          thumbnail: { url: thumbnail.thumbnailLink, isLoading: false, trashed: thumbnail.trashed },
        }
      : item;
  });
};

/**
 * Add notification
 * @param {Object[]} items
 * @param {Object} notification
 * @returns {Object} items
 */
export const addNotification = (items, notification) => {
  let newItems = items;
  newItems = [notification, ...newItems];
  return newItems;
};

/**
 * Merge notification
 * @param {Object[]} items
 * @param {string} mergedNotification
 * @returns {Object} items
 */
export const mergeNotification = (items, mergedNotification) => {
  let newItems = items;
  newItems.splice(0, 1, mergedNotification);
  newItems = [...newItems];
  return newItems;
};

export const showDestructiveSyncErrorDialog = (code, websites) => {
  if (code === 'WebsitesExistSyncError') {
    let html = '';
    if (websites && websites.length) {
      const websiteToOrderedListHtml = (website) => {
        return `<li>${website.path.replace(
          '/root',
          store.getState().collections.collections.my.name || 'My team library'
        )}</li>`;
      };
      html = `<ol>${websites.map(websiteToOrderedListHtml).join('')}</ol>`;
    }
    Logger.log('UI', 'SyncWebsitesDetectedDialogShow');
    showDialog({
      title: localization.SYNC.textTitleSyncCancelled,
      textBtnCancel: null,
      onClose: () => {
        Logger.log('User', 'SyncWebsitesDetectedDialogCancel');
      },
      onOk: () => {
        Logger.log('User', 'SyncWebsitesDetectedDialogOk');
      },
      onCancel: () => {},
      text: localization.SYNC.textTextSyncDestructiveWebsitesTemplate(html),
    });
  }

  if (code === 'DestructiveSyncError') {
    Logger.log('UI', 'SyncDestructiveDialogShow');
    showDialog({
      title: localization.SYNC.textTitleSyncCancelled,
      textBtnOk: localization.DIALOGS.btnOk,
      textBtnCancel: localization.DIALOGS.btnCancel,
      onClose: () => {
        Logger.log('User', 'SyncDestructiveDialogCancel');
      },
      onOk: () => {
        Logger.log('User', 'SyncDestructiveDialogOk');
        syncApi.runSync(true)
      },
      onCancel: () => {
        Logger.log('User', 'SyncDestructiveDialogCancel');
      },
      text: localization.SYNC.textTextSyncCancelledTemplate,
    });
  }
};
