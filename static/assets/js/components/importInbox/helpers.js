import picsioUtils from '@picsio/utils';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import picsioConfig from '../../../../../config';
import { showDialog } from '../dialog';

const SIZE_40GB = 40 * 1024 * 1024 * 1024;

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
 * Find files > 2gb files
 * @param {Object[]} filesToAdd
 * @returns {Object[]} duplicated file names
 */
export function findLargeFiles(filesToAdd) {
  const result = [];

  filesToAdd.forEach((item) => {
    if (item.file.size > SIZE_40GB) {
      result.push({ size: item.file.size, name: item.path + item.name });
    }
  });

  return result;
}

/**
 * Make items for state
 * @param {Object[]} files
 * @param {Object} inbox
 * @returns {Object}
 */
export function normalizeFiles(files, inbox) {
  return [...files].reduce((result, file) => {
    if (!file.size) {
      /** if zero file size or file size is unknown */
      result.corruptedFiles.push(file);
    } else {
      result.normalizedFiles.push({
        file,
        inbox,
        name: file.name,
        path: `Inboxes/${inbox.name}`,
      });
    }
    return result;
  }, { normalizedFiles: [], corruptedFiles: [] });
}

/**
 * Upload files
 */
export function uploadFile(file, additionalFields, onUploadProgress = () => {}) {
  const contentType = picsioUtils.lookupMimeType(file.name.split('.').pop()) || 'application/octet-stream';

  const inboxApiUrl = window.inbox.uploadUrl || picsioConfig.getInboxApiBaseUrl();
  const url = `${inboxApiUrl}/upload/${window.inbox._id}?title=${encodeURIComponent(file.name)}&contentLength=${
    file.size
  }&contentType=${encodeURIComponent(contentType)}`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('additionalFields', JSON.stringify(additionalFields));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = ({ loaded, total }) => onUploadProgress({ percentage: (loaded / total) * 100, xhr });
    xhr.onload = (res) => {
      if (res.target.status === 200) {
        resolve();
      } else {
        reject({ error: res.target });
      }
    };
    xhr.onabort = reject;
    xhr.onerror = reject;
    xhr.open('PUT', url, true);
    xhr.timeout = 1000 * 60 * 120; // 2h
    xhr.send(formData);
  });
}

/**
 * Normalize files
 * @param {Array|Object} files
 * @param {Object} inbox
 * @returns {Array}
 */
export function normalizeDroppedFiles(files, inbox) {
  const result = { normalizedFiles: [], corruptedFiles: [] };
  if (Array.isArray(files)) {
    files.forEach((item) => {
      const { normalizedFiles, corruptedFiles } = normalizeDroppedFiles(item, inbox);
      result.normalizedFiles.push(...normalizedFiles);
      result.corruptedFiles.push(...corruptedFiles);
    });
  } else {
    const { normalizedFiles, corruptedFiles } = normalizeFiles([files.file], inbox);
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
      item.file(
        (file) => resolve({ file, collectionPath: path }),
        (error) => reject({ error }),
      );
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
