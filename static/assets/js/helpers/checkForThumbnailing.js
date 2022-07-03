import {
	ASYNC_JOB_STATUS_WAITING,
	ASYNC_JOB_STATUS_RUNNING,
} from '@picsio/db/src/constants';

const fileExtensionsWithDirectThumbs = [/^jpg$/i, /^jpeg$/i, /^png$/i, /^bmp$/i];

/**
 * Check for thumbnailing
 * @param {string} data.storageType
 * @param {string} data.fileExtension
 * @param {boolean} data.thumbnailing
 * @param {boolean?} data.thumbnail
 * @returns {boolean}
 */
export default function checkForThumbnailing(data) {
  let isThumnailingNeeded = false;
  if (!data) return isThumnailingNeeded;

  if (
    data.storageType === 's3' &&
    fileExtensionsWithDirectThumbs.some((regexp => regexp.test(data.fileExtension)))
  ) {
    isThumnailingNeeded =
      [ASYNC_JOB_STATUS_RUNNING, ASYNC_JOB_STATUS_WAITING].includes(data.thumbnailing) &&
      !data.thumbnail;
  } else {
    isThumnailingNeeded = [ASYNC_JOB_STATUS_RUNNING, ASYNC_JOB_STATUS_WAITING].includes(
      data.thumbnailing
    );
  }
  return isThumnailingNeeded;
}
