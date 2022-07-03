import Q from 'q';
import qlimit from 'qlimit';
import remove from 'lodash.remove';
import dayjs from 'dayjs';
import { bindActionCreators } from 'redux';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { Share } from '@capacitor/share';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import { downloadFile, downloadByGS } from '../../helpers/fileDownloader';
import * as Api from '../../api/downloadList';
import picsioConfig from '../../../../../config';
import ua from '../../ua';

import store from '../index';
import Logger from '../../services/Logger';
import getDownloadUrl from '../../helpers/getDownloadUrl';
import UiBlocker from '../../services/UiBlocker';
import Toast from '../../components/Toast';
import TYPES from '../action-types';
import { showErrorDialog, showDialog } from '../../components/dialog';
import { navigate } from '../../helpers/history';

import FileService from '../../services/MobileFileService';

const defaultLimits = ((ua.isMobileApp() && ua.getPlatform() === 'ios') || ua.os.isIOS()) ? 1 : 6;
const limitToStorage = qlimit(defaultLimits);
const limitToXHR = qlimit(defaultLimits);
const limitToDownload = qlimit(1);
const tmpItems = [];
const successfullyDownloadedItems = [];

const isCanceled = (asset) => !tmpItems.includes(asset);
const isDownloadOriginalAsset = (asset) => asset.url === null;
const isWatermarkedAsset = (asset) => !!asset.watermark;

/**
 * Remove from download list
 * @param {number[]} clientIds
 */
export function removeFromDownloadList(clientIds) {
  return (dispatch) => {
    let cids = clientIds;
    if (!Array.isArray(clientIds)) cids = [cids];

    utils.LocalStorage.set('picsioDownloadingProgress', [
      ...utils.LocalStorage.get('picsioDownloadingProgress').filter(
        (item) => !cids.includes(item.cid),
      ),
    ]);

    remove(tmpItems, (item) => cids.includes(item.cid));

    dispatch({
      type: TYPES.DOWNLOAD_LIST.REMOVE,
      payload: { cids },
    });
  };
}

/**
 * Update item
 * @param {number} cid
 * @param {string} key
 * @param {*} value
 * @param {XMLHttpRequest?} xhr
 */
export function updateDownloadListItem(cid, key, value, xhr) {
  return (dispatch) => {
    dispatch({
      type: TYPES.DOWNLOAD_LIST.UPDATE,
      payload: {
        cid, key, value, xhr,
      },
    });
  };
}

/** Upldate list total
 * @param {number} count
 * @param {number} size
 */
export function updateTotalDownloadList(count = 0, size = 0) {
  return (dispatch) => {
    dispatch({
      type: TYPES.DOWNLOAD_LIST.RESET_TOTAL,
      payload: { count, size },
    });
  };
}

/** Reset list total */
export function resetTotalDownloadList() {
  return (dispatch) => {
    dispatch({
      type: TYPES.DOWNLOAD_LIST.RESET_TOTAL,
    });
  };
}

const downloadListActions = bindActionCreators(
  {
    removeFromDownloadList,
    updateDownloadListItem,
    updateTotalDownloadList,
    resetTotalDownloadList,
  },
  store.dispatch,
);

/**
 * @param {string} url - download url
 * @returns {boolean}
 */
const isArchiveFromZipper = (url) => (url.includes('zips.') || url.includes('zipstage')) && url.endsWith('.zip');

const saveToDevice = async (assetId, assetName, data) => {
  const reader = new FileReader();
  reader.readAsDataURL(data);
  reader.onloadend = async () => {
    const base64String = reader.result;
    try {
      await Filesystem.appendFile({
        path: assetName,
        data: base64String,
        directory: Directory.Documents,
      });
      Logger.log('UI', 'MobileAppAssetSaved', { id: assetId });
    } catch (error) {
      Logger.error(
        new Error('Mobile app unable to append file'),
        { error, assetId, fileSize: utils.bytesToSize(data.size) },
        ['MobileAppAppendFileError', (error && error.message) || 'NoMessage'],
      );
    }
  };
};

/**
 * Save file
 * @param {Blob|string} data
 * @param {Object} asset
 */
function saveFile(data, asset) {
  const assetName = asset.name;
  return limitToDownload(() => Q.Promise(async (resolve) => {
    if (isCanceled(asset)) {
      resolve();
      return;
    }

    if (ua.browser.family === 'Safari') {
      /**
         * ! hardcode for Safari !
         * download multiple files at the same time
         */
      await Q.delay(500);
    }

    if (ua.isMobileApp() && data instanceof Blob) {
      Logger.info(
        `Mobile app downloading assetId [${asset._id}] with size [${utils.bytesToSize(
          data.size,
        )}] `,
      );
      Logger.log('UI', 'MobileAppSavingAsset', {
        id: asset._id,
        size: utils.bytesToSize(data.size),
      });
      const isFilesystemAvailable = Capacitor.isPluginAvailable('Filesystem');

      if (isFilesystemAvailable) {
        const isAppIos = ua.getPlatform() === 'ios';
        const isAppAndroid = ua.getPlatform() === 'android';
        const fileService = new FileService();

        const directory = '';
        if (isAppIos || isAppAndroid) {
          const info = await Device.getInfo();
          const { diskFree } = info; // on Android I get diskFree = 0
          const blobSize = data.size;

          if ((diskFree && diskFree * 2 > blobSize) || !diskFree) {
            UiBlocker.block('Preparing file for sharing...', {
              classList: ['mobileDownloadSpinner'],
            });
            await fileService.writeFile(directory, assetName, data, 6);
            UiBlocker.unblock();

            const readFileResult = await fileService.readFile(directory, assetName);
            const { fileUri } = readFileResult;

            if (fileUri) {
              try {
                await Share.share({
                  title: assetName,
                  text: 'Share or save this file',
                  url: fileUri,
                  dialogTitle: 'Share or save this file',
                });
                Logger.log('UI', 'MobileAppAssetShared');
              } catch (err) {
                if (isAppAndroid) {
                  await saveToDevice(asset._id, assetName, data);
                }
                Logger.log('UI', 'MobileAppAssetNotShared');
              }

              try {
                await fileService.deleteFile(fileUri);
              } catch (err) {
                Logger.log('UI', 'MobileAppAssetNotShared');
              }
            } else {
              Logger.log('UI', 'MobileAppAssetNotShared');
              try {
                await fileService.deleteFile(fileUri);
              } catch (err) {
                Logger.log('UI', 'MobileAppAssetNotShared');
              }
            }
          } else {
            Logger.log('UI', 'MobileAppAlertNotEnoughFreeSpace');
            alert('There is not enough free space on your device for this operation.');
          }
          // if remove isAppAndroid above, Android can download file directly
        } else {
          // await fileService.writeFile(directory, assetName, data, 6);
          await saveToDevice(asset._id, assetName, data);
        }
      } else {
        Logger.error(new Error('Mobile app Filesystem is not allowed'), {}, [
          'MobileAppNotAllowedFilesystem',
          'Mobile app Filesystem is not allowed by some reason',
        ]);
      }
    } else if (
      typeof data === 'string'
        && ((!picsioConfig.isMainApp() && !picsioConfig.isProofing()) || isArchiveFromZipper(data))
    ) {
      /** on Proofing template and zip's from ziper we don't need download to Blob */
      let $link = document.createElement('a');
      $link.href = data;

      /** click on the link */
      try {
        $link.dispatchEvent(new MouseEvent('click'));
      } catch (e) {
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(
          'click',
          true,
          true,
          window,
          0,
          0,
          0,
          80,
          20,
          false,
          false,
          false,
          false,
          0,
          null,
        );
        $link.dispatchEvent(evt);
      }
      $link = undefined;
    } else {
      utils.saveFile(data, assetName);
    }

    successfullyDownloadedItems.push(tmpItems.find((a) => a.cid === asset.cid));
    downloadListActions.removeFromDownloadList(asset.cid);

    /** if all assets downloaded or all with errors */
    if (!tmpItems.length || tmpItems.every((a) => a.error)) {
      /** Send notification only for original downloaded files */
      const assetsForNotification = successfullyDownloadedItems.filter((a) => isDownloadOriginalAsset(a));
      if (assetsForNotification.length) {
        Api.sendDownloadedNotification(successfullyDownloadedItems);
      }
      successfullyDownloadedItems.length = 0;
      downloadListActions.resetTotalDownloadList();

      if (ua.isMobileApp()) Toast(localization.DOWNLOAD_PANEL.textDownloadingComplete);
    }

    resolve();
  }))();
}

/**
 * Poll and download file from zipper service
 * @param {Object} asset
 * @param {number?} loopCount
 */
function pollFileFromZipper(asset, loopCount = 360) {
  limitToXHR(() => {
    if (isCanceled(asset)) return Q.resolve();

    return Q.Promise((resolvePoll) => {
      const xhr = new XMLHttpRequest();
      const handleResponse = (e) => {
        let resp;
        try {
          resp = JSON.parse(e.currentTarget.responseText);
        } catch (err) {
          resp = {
            ready: false,
            status: 'Converting',
          };
        }

        setTimeout(async () => {
          if (resp.ready) {
            downloadListActions.updateDownloadListItem(asset.cid, 'status', null);
            try {
              saveFile(asset.url, asset);
            } catch (err) {
              tmpItems.find((n) => n.cid === asset.cid).error = true;
              downloadListActions.updateDownloadListItem(asset.cid, 'error', true);
            }
            resolvePoll();
          } else {
            if (loopCount === 0) {
              tmpItems.find((n) => n.cid === asset.cid).error = true;
              downloadListActions.updateDownloadListItem(asset.cid, 'error', true, xhr);
              resolvePoll();
              return;
            }
            downloadListActions.updateDownloadListItem(asset.cid, 'status', resp.status, xhr);
            pollFileFromZipper(asset, loopCount - 1);
            resolvePoll();
          }
        }, 5000);
      };
      xhr.overrideMimeType('application/json');
      xhr.open('GET', asset.pollUrl, true);
      xhr.onerror = handleResponse;
      xhr.onload = handleResponse;
      xhr.send();
    });
  })();
}

/**
 * Download original file from storage
 * @param {Object} asset
 */
function pollStorageFile(asset) {
  limitToStorage(async () => {
    if (isCanceled(asset)) return;

    let url;
    let error;
    /** get url for downloading */
    try {
      url = await getDownloadUrl({ assetId: asset._id, resolution: asset.resolution });
    } catch (err) {
      error = err;

      const connection = utils.getNavigatorConnectionInfo();
      Logger.error(
        new Error('Can not get download url for asset'),
        { error: err, assetId: asset._id },
        ['GetDownloadUrlFailed', { errorMessage: (err && err.message) || 'NoMessage', connection }],
      );
    }

    const errorMessageForUser = localization.DOWNLOADDIALOG.errorDownloading;
    if (url) {
      /** download file */
      try {
        let blobOrUrl;
        if (url.startsWith(picsioConfig.services.zipper.DOWNLOAD_BY_GS_URL)) {
          const { promise, cancel } = downloadByGS(url);
          downloadListActions.updateDownloadListItem(asset.cid, 'cancel', cancel);
          blobOrUrl = await promise.progress(() => {
            downloadListActions.updateDownloadListItem(asset.cid, 'status', 'Processing...');
          });
        } else if (picsioConfig.isMainApp() || picsioConfig.isProofing()) {
          const { promise, cancel } = downloadFile(url);

          /** add cancel download function to asset in the store */
          downloadListActions.updateDownloadListItem(asset.cid, 'cancel', cancel);

          blobOrUrl = await promise.progress((data) => {
            downloadListActions.updateDownloadListItem(
              asset.cid,
              'progress',
              data.loaded / asset.fileSize,
            );
          });
        } else {
          blobOrUrl = url;
        }
        saveFile(blobOrUrl, asset);
        return;
      } catch (err) {
        const connection = utils.getNavigatorConnectionInfo();
        Logger.error(
          new Error('Can not download file from storage'),
          { error: err, assetId: asset._id },
          ['DownloadFileFailed', { errorMessage: (err && err.message) || 'NoMessage', userDialogueMessage: errorMessageForUser, connection }],
        );
      }
    }
    /** show dialog if file isn't downloaded */
    downloadListActions.updateDownloadListItem(asset.cid, 'error', true);

    if (error) {
      const subcode = utils.getDataFromResponceError(error, 'subcode');
      const { ERROR_DOWNLOAD_ASSET } = localization.DIALOGS;

      if (subcode === 'MissingCanDownloadGoogleDriveCapabilityError') {
        /** show "Missing capability" error dialog if file isn't downloaded */

        const hideDialog = showDialog({
          title: ERROR_DOWNLOAD_ASSET.TITLE,
          children: ERROR_DOWNLOAD_ASSET.TEXT(() => {
            navigate('/storage');
            hideDialog();
          }),
          textBtnCancel: null,
        });
        return;
      }
    }
    /** show standard error dialog if file isn't downloaded */
    showErrorDialog(errorMessageForUser);
  })();
}

/**
 * Add to download list
 * @param {Object[]} assets
 */
export function addToDownloadList(assets) {
  return (dispatch) => {
    const items = assets.map((asset, index) => ({
      ...asset,
      // cid: Date.now() + index,
      cid: dayjs() + index,
      progress: isDownloadOriginalAsset(asset) ? 0 : undefined,
    }));

    utils.LocalStorage.set('picsioDownloadingProgress', [
      ...(utils.LocalStorage.get('picsioDownloadingProgress') || []),
      ...items.filter((n) => !n.isSkeleton),
    ]);

    dispatch({
      type: TYPES.DOWNLOAD_LIST.ADD,
      payload: { items },
    });

    items.forEach((asset) => {
      if (!asset.isSkeleton) {
        if (isDownloadOriginalAsset(asset)) pollStorageFile(asset);
        else if (isWatermarkedAsset(asset)) pollFileFromZipper(asset);
        else pollFileFromZipper(asset);

        tmpItems.push(asset);
      }
    });
  };
}
