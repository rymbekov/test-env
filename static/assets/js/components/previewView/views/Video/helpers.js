import ua from '../../../../ua';
import * as utils from '../../../../shared/utils';
import * as Api from '../../../../api/assets';
import Logger from '../../../../services/Logger';
import localization from '../../../../shared/strings';
import picsioConfig from '../../../../../../../config';
import store from '../../../../store';
import Toast from '../../../Toast';
import { showErrorDialog } from '../../../dialog';

export const QUALITIES_IN_PROGRESS = 'qualitiesInProgress';
export const MEDIA_ERRORS = {
  unknown: {
    text: 'Unknown error',
    name: 'UNKNOWN_ERROR',
  },
  1: {
    text: 'The fetching of the associated resource was aborted by the user\'s request',
    name: 'MEDIA_ERR_ABORTED',
  },
  2: {
    text: 'Some kind of network error occurred which prevented the media from being successfully fetched, despite having previously been available',
    name: 'MEDIA_ERR_NETWORK',
  },
  3: {
    text: 'Despite having previously been determined to be usable, an error occurred while trying to decode the media resource, resulting in an error',
    name: 'MEDIA_ERR_DECODE',
  },
  4: {
    text: 'The associated resource or media provider object (such as a MediaStream) has been found to be unsuitable',
    name: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
  },
};

/**
 * Make screenshot from video
 * @param {object} params
 * @param {string} params.src - video source
 * @param {number} params.time - time in sec
 * @param {HTMLVideoElement?} params.$video
 * @param {number?} params.width
 * @param {number?} params.height
 * @param {string?} params.type
 * @param {number?} params.quality
 * @param {string?} params.mimeType
 * @returns {Promise} - promise returns screenshot by type in params
 */
export function makeVideoScreenshot({
  src,
  time,
  $video,
  width,
  height,
  type = 'dataUrl',
  quality = 0.92,
  mimeType = 'image/jpeg',
}) {
  return new Promise((resolve) => {
    let $player = $video ? $video.cloneNode(true) : document.createElement.$video;
    $player.src = src;

    async function handleCanPlay() {
      $player.removeEventListener('canplay', handleCanPlay);

      width = width || $player.videoWidth;
      height = height || $player.videoHeight;

      let $canvas = document.createElement('canvas');
      $canvas.width = width;
      $canvas.height = height;

      let ctx = $canvas.getContext('2d');
      ctx.drawImage($player, 0, 0, width, height);

      let result;
      if (type === 'dataUrl') {
        result = $canvas.toDataURL('image/jpeg', quality);
      }
      if (type === 'blob') {
        result = await new Promise((resolve) => {
          $canvas.toBlob(
            (blob) => {
              let $image = new Image();
              $image.addEventListener('load', () => {
                $image = undefined;
                resolve(blob);
              });
              $image.src = window.URL.createObjectURL(blob);
            },
            mimeType,
            quality,
          );
        });
      }

      $canvas = undefined;
      ctx = undefined;
      $player = undefined;

      resolve(result);
    }

    function changeTime() {
      $player.removeEventListener('canplay', changeTime);
      $player.addEventListener('canplay', handleCanPlay);
      $player.currentTime = time;
    }

    $player.addEventListener('canplay', changeTime);
  });
}

/**
 * Check if screenshot is supported by browser
 * @returns {boolean}
 */
export function isScreenshotSupported() {
  if (ua.browser.family === 'Safari' || ua.os.isIOS()) {
    const title = localization.VIDEO.safariErrorTitle;
    const text = !ua.os.isIOS() ? localization.VIDEO.safariErrorTxt : localization.VIDEO.iosErrorTxt;
    showErrorDialog(text, title);
    return false;
  }
  return true;
}

/**
 * Build screenshot name
 * @param {string} assetName - asset name
 * @param {number} time - time in sec
 * @returns {string}
 */
export function makeScreenshotName(assetName, time) {
  const nameArray = assetName.split('.');
  nameArray.pop();
  const assetNameWithoutExtension = nameArray.join('.');

  return `screen-${assetNameWithoutExtension}[${utils.parseTime(time).replace(':', '-')}].jpg`;
}

/**
 * Upload custom thumbnail
 * @param {string} assetId
 * @param {Blob} blob
 * @returns {string} - thumbnail url
 */
export async function uploadThumbail(assetId, blob) {
  try {
    const url = await Api.addThumbnail(assetId, blob);
    Toast(localization.VIDEO.warningThumbnailGenerating);
    return url;
  } catch (err) {
    showErrorDialog(localization.VIDEO.errorCreatingThumbnail);
    Logger.error(new Error('Error upload video custom thumbnail'), { error: err }, [
      'UploadVideoCustomThumbnailFailed',
      (err && err.message) || 'NoMessage',
    ]);
  }
}

function normalizeQualities(qualities) {
  const list = Array.from(qualities).reduce((list, item) => {
    const quality = Number(item.quality);

    if (!Number.isNaN(quality)) list.push({ ...item, quality });

    return list;
  }, []);
  list.sort((a, b) => (a.quality < b.quality ? 1 : a.quality > b.quality ? -1 : 0));

  return list;
}

/**
 * Get qualities list from the proxy
 * @param {String} assetId
 * @param {String} revisionId
 * @returns {Promise}
 */
export async function getVideoQualities(assetId, revisionId) {
  try {
    const userId = picsioConfig.isMainApp() ? store.getState().user.team._id : window.websiteConfig.userId;
    const qualities = await Api.getVideoQualities(userId, assetId, revisionId);

    if (!Array.isArray(qualities)) throw QUALITIES_IN_PROGRESS;

    return normalizeQualities(qualities);
  } catch (err) {
    if (err !== QUALITIES_IN_PROGRESS) {
      const error = new Error(`Proxy error: ${(err.response && err.response.data) || err.status}`);
      /** this error is processed later */
      Logger.warn(error, { error: err });
    }
    throw err;
  }
}

/**
 * Get AND Remove current time for asset (saved in LocalStorage)
 * @param {String} assetId
 * @returns Number|undefined
 */
export function getSavedCurrentTime(assetId) {
  /** @type Array */
  const savedTime = utils.LocalStorage.get('picsio.savedVideoCurrentTime') || [];
  const recordIndex = savedTime.findIndex((record) => record.assetId === assetId);

  if (recordIndex === -1) return undefined;

  return savedTime[recordIndex].currentTime;
}

/**
 * Save video current time to LocalStorage
 * @param {String} assetId
 * @param {Number} currentTime - video current time in seconds
 */
export function saveVideoCurrentTime(assetId, currentTime) {
  /** @type Array */
  const savedTime = utils.LocalStorage.get('picsio.savedVideoCurrentTime') || [];
  let newSavedTime = [...savedTime.filter((t) => t.assetId !== assetId)];

  if (currentTime > 1) newSavedTime.push({ assetId, currentTime });

  /** max length 500 */
  if (newSavedTime.length > 500) newSavedTime = newSavedTime.slice(-500);

  utils.LocalStorage.set('picsio.savedVideoCurrentTime', newSavedTime);
}
