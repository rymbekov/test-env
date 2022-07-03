import { bindActionCreators } from 'redux';
import Q from 'q';
import pluralize from 'pluralize';
import * as utils from '../shared/utils';
import Logger from '../services/Logger';
import getDownloadUrl from './getDownloadUrl';
import picsioConfig from '../../../../config';
import UiBlocker from '../services/UiBlocker';
import store from '../store';
import * as actions from '../store/actions/downloadList';
import * as DownloadApi from '../api/downloadList';
import localization from '../shared/strings';
import * as api from '../api';
import { showDialog, showErrorDialog } from '../components/dialog';
import renderDownloadDialog from '../components/DownloadDialog/renderDownloadDialog';

const downloadListActions = bindActionCreators({ ...actions }, store.dispatch);

const LIMIT_ASSETS_COUNT = 300;

/**
 * Find already added to downloadList files
 * @param {array} addedFiles
 * @param {array} filesToAdd
 * @returns {Object[]} duplicated file names
 */
export function findDuplicates(addedFiles, filesToAdd) {
  return filesToAdd.reduce((acc, item) => {
    const index = addedFiles.findIndex((file) => file._id === item._id);
    if (index !== -1) {
      acc.push({ _id: item._id, name: item.name });
    }
    return acc;
  }, []);
}

/**
 * Show download dialog
 * @param {string[]?} ids - assets ids to download
 */
export function showDownloadDialog(ids) {
  const assetsStore = store.getState().assets;
  const { items: assetsDownloadingNow } = store.getState().downloadList;
  const { items } = assetsStore;
  let assetsIds = ids;
  /** if no assetsIds - get selected assets from store */
  if (assetsIds === undefined) assetsIds = assetsStore.selectedItems;

  /** check files count */
  if (assetsIds.length > LIMIT_ASSETS_COUNT) {
    Logger.log('UI', 'TooManyFilesForDownloadDialog', `${assetsIds.length}`);
    const { TITLE, TEXT } = localization.DIALOGS.DOWNLOAD_ASSETS_QUANTITY_LIMITATIONS;
    showDialog({
      title: TITLE,
      text: TEXT,
      textBtnCancel: null,
    });
    return;
  }

  let assets = assetsIds.map((_id) => {
    const asset = items.find((item) => item._id === _id);
    if (asset) {
      return { ...asset };
    }
    return { _id };
  });

  /** Find downloadable duplicates */
  const duplicates = findDuplicates(assetsDownloadingNow, assets);
  if (duplicates.length > 0) {
    /** Show warning */
    Logger.log('UI', 'DownloadableDublicatesDownloadDialog', `${duplicates.length}`);
    let text = `The following ${duplicates.length} ${pluralize(
      'file',
      duplicates.length,
      false,
    )} are already added for downloading: <ul>${duplicates
      .map((file) => `<li>${file.name}</li>`)
      .join('')}</ul>`;
    if (duplicates.length > 1) text += '<p>Press OK to skip these files and proceed with downloading</p>';

    showDialog({
      title: `${pluralize('file', duplicates.length, false)} already added`,
      text,
      textBtnCancel: null,
      textBtnOk: 'Ok',
    });
    /** Remove duplicates */
    assets = assets.reduce((acc, asset) => {
      if (!duplicates.find((duplicate) => duplicate._id === asset._id)) acc.push(asset);
      return acc;
    }, []);

    /** If all is duplicates - exit */
    if (assets.length < 1) return;
  }

  renderDownloadDialog(assets, { loadedItems: assetsStore.items });
}

/**
 * download collection
 * @param {string} collectionId - collectionId to download
 */
export async function downloadCollection(collectionId, rolePermissions, archived = false) {
  try {
    UiBlocker.block(localization.SPINNERS.CHECKING_DOWNLOAD_PERMISSIONS);
    const result = await DownloadApi.getCollectionAssets(collectionId, archived);
    const assets = result.images || [];

    /** collection is empty: show dialog nothing to download */
    if (!assets.length) {
      UiBlocker.unblock();
      Logger.log('UI', 'DownloadCollectionEmptyDialog');
      const { TITLE, TEXT } = localization.DIALOGS.DOWNLOAD_COLLECTION_EMPTY;
      showDialog({
        title: TITLE,
        text: TEXT,
        textBtnCancel: null,
      });

      return;
    }

    /** check for restricted assets and user permissions */
    const restrictedAssets = [];
    const assetsNotAllowedForDownload = [];
    const assetsAllowedForDownload = [];
    assets.forEach((asset) => {
      if (
        rolePermissions.restrictedDownload === false
        && asset.restrictSettings
        && utils.isAssetRestricted(asset.restrictSettings)
      ) {
        restrictedAssets.push(asset);
      } else if (!asset.permissions.downloadFiles) {
        assetsNotAllowedForDownload.push(asset);
      } else {
        assetsAllowedForDownload.push(asset);
      }
    });

    UiBlocker.unblock();

    /** if nothing to download */
    if (!assetsAllowedForDownload.length) {
      Logger.log('UI', 'DownloadCollectionRestrictedDialog');
      const { TITLE, TEXT } = localization.DIALOGS.DOWNLOAD_COLLECTION_RESTRICTED;
      showDialog({
        title: TITLE,
        text: TEXT,
        textBtnCancel: null,
      });
      return;
    }

    const doDownload = () => {
      /** check files count */
      if (assetsAllowedForDownload.length > LIMIT_ASSETS_COUNT) {
        Logger.log('UI', 'TooManyFilesForDownloadDialog', `${assetsAllowedForDownload.length}`);
        const { TITLE, TEXT } = localization.DIALOGS.DOWNLOAD_ASSETS_QUANTITY_LIMITATIONS;
        showDialog({
          title: TITLE,
          text: TEXT,
          textBtnCancel: null,
        });
        return;
      }

      assetsAllowedForDownload[0].collectionId = collectionId;
      renderDownloadDialog(assetsAllowedForDownload, { collectionId, loadedItems: [] });
    };

    if (restrictedAssets.length || assetsNotAllowedForDownload.length) {
      Logger.log('UI', 'DownloadCollectionLimitedDialog', {
        restrictedAssets: restrictedAssets.length,
        notAllowed: assetsNotAllowedForDownload.length,
      });
      const {
        TITLE,
        TEXT,
        OK_TEXT,
        CANCEL_TEXT,
      } = localization.DIALOGS.DOWNLOAD_COLLECTION_LIMITED;
      showDialog({
        title: TITLE,
        text: TEXT,
        textBtnOk: OK_TEXT,
        textBtnCancel: CANCEL_TEXT,
        onOk() {
          Logger.log('User', 'DownloadCollectionLimitedDialogOk');
          doDownload();
        },
        onClose() {
          Logger.log('User', 'DownloadCollectionLimitedDialogCancel');
        },
      });

      return;
    }

    doDownload();
  } catch (error) {
    UiBlocker.unblock();
  }
}

/**
 * Download file by url
 * @param {String} url
 * @param {String?} responseType
 * @returns {Object} { promise: Promise, cancel: Function }
 *   @param {Promise} promise - Promise that returns file (blob by default)
 *   @param {Function} cancel - function to cancel download
 * }
 */
export function downloadFile(url, responseType = 'blob') {
  const xhr = new XMLHttpRequest();
  let cancelled = false;

  function cancel() {
    cancelled = true;
    xhr.abort();
  }

  const promise = (() => Q.Promise((resolve, reject, notify) => {
    let numberOfAttempts = 1;

    const handleError = (err) => {
      const connection = utils.getNavigatorConnectionInfo();
      const errorMessageForUser = 'Failed to download. Check your internet connection.';
      Logger.error(new Error('Can not download file from GD'), { error: err }, [
        'DownloadFileFromGDFailed',
        { errorMessage: (err && err.message) || 'NoMessage', userDialogueMessage: errorMessageForUser, connection },
      ]);
      showErrorDialog(errorMessageForUser);
      reject('Failed to download document. Check your internet connection.');
    };

    const handleAbort = () => {
      if (cancelled) return;

      if (numberOfAttempts > 3) {
        handleError(`Can not download File from GD, request aborted ${numberOfAttempts} times`);
        return;
      }
      numberOfAttempts += 1;
      /** exponential backoff */
      setTimeout(doRequest, numberOfAttempts * 500);
    };

    const handleProgress = (event) => {
      if (event.lengthComputable) {
        notify({ loaded: event.loaded, total: event.total, xhr });
      }
    };

    const handleLoad = (resp) => {
      if (resp.currentTarget.status === 200) {
        const file = resp.currentTarget.response;
        resolve(file);
      } else {
        reject(resp.currentTarget.status);
      }
    };

    function doRequest() {
      xhr.open('GET', url, true);
      xhr.responseType = responseType;

      xhr.onload = handleLoad;
      xhr.onerror = handleError;
      xhr.onabort = handleAbort;
      xhr.onprogress = handleProgress;
      xhr.send();
    }
    doRequest();
  }))();

  return { promise, cancel };
}

/** Download by Google Storage */
export function downloadByGS(downloadUrl, pollInterval = 5000) {
  let cancelled = false;
  const promise = Q.Promise(async (resolve, reject, notify) => {
    async function doDownload(count = 0) {
      if (cancelled) return null;

      count++;
      let res;
      try {
        res = await api.get(downloadUrl);
      } catch (error) {
        reject(error);
        return;
      }

      const { url, status } = res;

      if (url) {
        resolve(url);
        return;
      }
      if (status) notify(status);

      if (count > 360) {
        reject(`No download url after ${count} tries...`);
        return;
      }
      setTimeout(() => doDownload(count), pollInterval);
    }
    await doDownload();
  });

  const cancel = () => (cancelled = true);

  return { promise, cancel };
}

/**
 * Download file by id and revisionId
 * @param  {String} id - asset id
 * @param  {String} name - filename to save file with.
 * @param  {String?} revisionId - asset revision id
 * @returns {Blob}
 */
export async function downloadAsset(id, name, revisionId) {
  /** Get download url */
  const url = await getDownloadUrl({ assetId: id, revisionId });

  if (url.startsWith(picsioConfig.services.zipper.DOWNLOAD_BY_GS_URL)) {
    return downloadByGS(url).promise;
  }

  const blob = await downloadFile(url).promise;
  /** save file */
  utils.saveFile(blob, name);
  return blob;
}

export async function downloadAssetWithWatermark(data, storageType, assets) {
  let urls;
  try {
    UiBlocker.block('Preparing');
    urls = await DownloadApi.getZipUrls(data, storageType);
  } catch (err) {
    showErrorDialog(localization.DOWNLOADDIALOG.errorCantCreateArchive);
  }
  UiBlocker.unblock();

  if (urls) {
    const pollUrl = urls.zipUrl.replace(/\.zip$/, '.json');

    if (data.isArchive) {
      downloadListActions.addToDownloadList([
        {
          name: urls.zipUrl.replace(/(.*|\/)\//, ''),
          mimeType: 'application/zip',
          url: urls.zipUrl,
          pollUrl,
        },
      ]);
    } else {
      const listFiles = assets.map((asset) => ({
        _id: asset._id,
        name: urls.fileUrls[asset._id].replace(/(.*|\/)\//, ''),
        mimeType: 'original',
        url: urls.fileUrls[asset._id],
        pollUrl,
      }));

      downloadListActions.addToDownloadList(listFiles);
    }
  }
}
