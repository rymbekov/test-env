import PermissionsChecker from '@picsio/db/src/helpers/PermissionsChecker';
import { permissions as PERMISSIONS } from '@picsio/db/src/constants';
import localization from '../../shared/strings';
import store from '../../store';
import { findCollection } from '../../store/helpers/collections';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import { showDialog } from '../dialog';

/**
 * Find already added files
 * @param {Object} addedFiles
 * @param {Object[]} filesToAdd
 * @returns {Object[]} duplicated file names
 */
export function findDuplicatedFilesLocal(addedFiles, filesToAdd) {
  const result = [];

  filesToAdd.forEach((item) => {
    if (addedFiles[item.path]) {
      const index = addedFiles[item.path].findIndex((file) => file.name === item.name);
      if (index !== -1) {
        result.push({ size: item.file.size, name: item.path + item.name });
      }
    }
  });

  return result;
}
/**
 * Make items for state
 * @param {Object[]} files
 * @param {string?} deepPath - if file inside dropped/choosen folder
 * @param {Object} collectionsTree
 * @param {Array} lightboards
 * @returns {Object[]}
 */
export function normalizeFiles(files, deepPath, collectionsTree, lightboards) {
  const { lightboardId, tagId } = store.getState().router.location.query;
	const collection = tagId ? findCollection(collectionsTree, 'my', { _id: tagId }) : undefined;
	const lightboard = lightboardId ? lightboards.find(lb => lb._id === lightboardId) : undefined;
	const rootCollectionName = store.getState().collections.collections.my.name;
  return [...files].reduce((result, file) => {
    if (!file.size) {
      /** if zero file size or file size is unknown */
      result.corruptedFiles.push(file);
    } else {
      let path = '';
      if (collection) {
        if (collection.path === 'root') {
          path = `${collection.name}/${deepPath || ''}`;
        } else {
          path = `${rootCollectionName}${collection.path}${collection.name}/${deepPath || ''}`;
        }
      }
      if (lightboard) path = `Lightboards/${lightboard.path.substring(1)}/`;
      result.normalizedFiles.push({
        file,
        collection,
        lightboard,
        deepPath: collection ? deepPath : undefined,
        name: file.name,
        path,
      });
    }
    return result;
  }, { normalizedFiles: [], corruptedFiles: [] });
}

/**
 * Normalize files
 * @param {Array|Object} files
 * @param {Object} collectionsTree
 * @param {Array} lightboards
 * @returns {Array}
 */
export function normalizeDroppedFiles(files, collectionsTree, lightboards) {
  const result = { normalizedFiles: [], corruptedFiles: [] };
  if (Array.isArray(files)) {
    files.forEach((item) => {
      const { normalizedFiles, corruptedFiles } = normalizeDroppedFiles(
        item, collectionsTree, lightboards,
      );
      result.normalizedFiles.push(...normalizedFiles);
      result.corruptedFiles.push(...corruptedFiles);
    });
  } else {
    const { normalizedFiles, corruptedFiles } = normalizeFiles(
      [files.file], files.collectionPath, collectionsTree, lightboards,
    );
    result.normalizedFiles.push(...normalizedFiles);
    result.corruptedFiles.push(...corruptedFiles);
  }
  return result;
}

/**
 * Get files from dropped items
 * @param {Object} item
 * @param {string} path
 * @returns {Promise}
 */
export async function getFilesFromEntry(item, path) {
  path = path || '';
  /** don't handle hidden files and folders */
  if (item.name.startsWith('.')) return [];

  if (item.isFile) {
    // Get file
    return await new Promise((resolve, reject) => {
      item.file((file) => resolve({ file, collectionPath: path }), (error) => reject({ error }));
    });
  }
  if (item.isDirectory) {
    // Get directory contents
    const dirReader = item.createReader();
    const entries = await readEntries(dirReader);
    const promises = await entries.map((entry) => getFilesFromEntry(entry, `${path + item.name}/`));
    return await Promise.all(promises);
  }
}

async function readEntries(reader) {
  let result = [];
  await new Promise((resolve) => {
    const read = (entries) => {
      if (entries.length) {
        result = [...result, ...entries];
        reader.readEntries(read);
      } else {
        resolve();
      }
    };
    reader.readEntries(read);
  });
  return result;
}

/**
 * Restore file in groups
 * @param {Object} groups
 * @param {string} groupPath
 * @param {number} itemID
 * @param {File} file
 * @returns {Promise}
 */
export async function restoreFile(groups, groupPath, itemID, file) {
  groups = { ...groups };
  const group = groups[groupPath];
  const item = group.find((item) => item.id === itemID);
  const restore = () => {
    item.file = file;
    item.name = file.name;
    item.shortSize = utils.bytesToSize(file.size);

    const totalSize = utils.bytesToSize(calculateTotalSize(groups));
    return { groups, totalSize };
  };

  if (item.name !== file.name) {
    return new Promise((resolve) => {
      Logger.log('UI', 'ImportWrongFileChoosenDialog');
      showDialog({
        title: localization.IMPORT.wrongFileChoosen.title,
        text: localization.IMPORT.wrongFileChoosen.text,
        textBtnOk: localization.IMPORT.wrongFileChoosen.btnOk,
        textBtnCancel: localization.IMPORT.wrongFileChoosen.btnCancel,
        onOk: () => {
          Logger.log('User', 'ImportWrongFileChoosenDialogOk');
          resolve(restore());
        },
        onCancel: () => {
          Logger.log('User', 'ImportWrongFileChoosenDialogCancel');
          resolve();
        },
      });
    });
  }
  return restore();
}

/**
 * Parse Google drive response
 * @param {Object} data
 * @param {Object[]} selectedKeywords
 * @param {Object[]} selectedUsers
 */
export function parseGoogleResponse(data, selectedKeywords, selectedUsers) {
  const defaults = {
    flag: 'unflagged',
    rating: 0,
    color: 'nocolor',
    trashed: false,
    title: '',
    description: '',
    selectedTile: false,
    storageCreatedAt: new Date().toISOString(),
    tags: [],
    lightboards: [],
    keywords: [],
    userOrientation: {
      rotation: 0,
      flipX: false,
      flipY: false,
    },
  };

  const descriptor = {};
  // set createdAt based on Google Drive data
  data.createdTime && (descriptor.storageCreatedAt = data.createdTime);

  // always update mongo id and storageId
  data._id && (descriptor._id = data._id);
  data.googleId && (descriptor.storageId = data.googleId);

  // google drive url fields
  let tmp = data.title || data.name;
  tmp && (descriptor.name = tmp);

  tmp = data.downloadUrl || data.url;
  tmp && (descriptor.url = tmp);

  data.md5Checksum && (descriptor.md5Checksum = data.md5Checksum);
  data.fileSize && (descriptor.fileSize = data.fileSize);
  data.fileExtension && (descriptor.fileExtension = data.fileExtension);
  data.thumbnailing && (descriptor.thumbnailing = data.thumbnailing);
  data.keywords && (descriptor.keywords = data.keywords);

  if (data.imageMediaMetadata) {
    if (data.imageMediaMetadata.rotation === 1 || data.imageMediaMetadata.rotation === 3) {
      descriptor.imageMediaMetadata = {
        rotation: data.imageMediaMetadata.rotation,
        height: data.imageMediaMetadata.width,
        width: data.imageMediaMetadata.height,
      };
    } else {
      descriptor.imageMediaMetadata = {
        rotation: data.imageMediaMetadata.rotation,
        height: data.imageMediaMetadata.height,
        width: data.imageMediaMetadata.width,
      };
    }
  }
  data.tags && (descriptor.tags = data.tags);
  data.lightboards && (descriptor.lightboards = data.lightboards);

  descriptor.keywords = selectedKeywords.map((keyword) => keyword._id);

  if (selectedUsers.length > 0) {
    descriptor.assignees = selectedUsers.map((user) => ({
      /* assignedAt: new Date().toISOString(), // must be created on the server */
      assigneeId: user._id,
    }));
  }

  data.mimeType && (descriptor.mimeType = data.mimeType);

  // to create 'customThumbnail' prop, based on "headRevisionId"
  data.headRevisionId && (descriptor.headRevisionId = data.headRevisionId);

  return { ...defaults, ...descriptor };
}

/**
 * Show dialog when try to add files and queue exists
 */
export function showBusyDialog() {
  Logger.log('UI', 'ImportBusyDialog');
  showDialog({
    title: localization.DIALOGS.UPLOAD_QUEUE_BUSY.TITLE,
    text: localization.DIALOGS.UPLOAD_QUEUE_BUSY.TEXT,
    textBtnCancel: localization.DIALOGS.btnOk,
    textBtnOk: null,
  });
}

/**
 * Calculate total files size in groups
 * @param {Array} groups
 * @returns {number}
 */
export function calculateTotalSize(groups) {
  return Object.keys(groups).reduce((total, groupPath) => total + groups[groupPath].reduce((total, item) => total + (item.file ? item.file.size : 0), 0), 0);
}

/**
 * Check upload permission to certain collection
 * @param {Object} role
 * @param {string} collectionPath
 * @returns {boolean}
 */
export function checkPermissionToUpload(role, collectionPath) {
  const { upload } = PERMISSIONS;
  const permissionsChecker = new PermissionsChecker(role);
  return permissionsChecker.checkPermissionByPath(upload, collectionPath);
}
