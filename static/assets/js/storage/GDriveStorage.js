// eslint-disable-next-line max-classes-per-file
import Q from 'q';
import picsioUtils from '@picsio/utils';
import { getWorkingFolderId } from '../store/helpers/user';
import GDriveUploader from './GDriveUploader';

// FIX extending Error constructor
// https://github.com/babel/babel/issues/4485
// https://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node/33877501#33877501
const ExtendableBuiltin = (window.ExtendableBuiltin = (cls) => {
  const ExtendableBuiltin = () => {
    cls.apply(this, arguments);
  };
  ExtendableBuiltin.prototype = Object.create(cls.prototype);
  Object.setPrototypeOf(ExtendableBuiltin, cls);

  return ExtendableBuiltin;
});

export class WorkingFolderTrashedError extends ExtendableBuiltin(Error) {}
export class WorkingFolderNotExistsError extends ExtendableBuiltin(Error) {}

export default {
  /*  Upload files to GDrive
		@params object - serialized importImageDescriptor
		@return promise
	*/
  uploadFile(file, params = {}) {
    return Q.Promise(async (resolve, reject, progress) => {
      // if file id specified we will upload new revision to this fileId
      // in this case no need to specify parents
      try {
        const { fileId, folderIds, assetIdToReplace } = params;

        const onComplete = (res) => {
          const object = JSON.parse(res);
          resolve(object);
        };
        const fileMimeType = picsioUtils.lookupMimeType(file.name.split('.').pop());

        const config = {
          file,
          onComplete,
          onError: reject,
          onProgress: (loaded, total, xhr) => progress({ percentage: (loaded / total) * 100, xhr }),
          contentType: fileMimeType,
          fileId, // pass an fileId to upload revision
        };
        // if new file created (no fileId), then also set parent folders
        if (!fileId && !assetIdToReplace) {
          config.parents = folderIds || [getWorkingFolderId()]
        }
        if (assetIdToReplace) {
          config.assetIdToReplace = assetIdToReplace;
        }

        const uploader = new GDriveUploader(config);
        await uploader.upload();
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Google Drive provides URL that may be modiufied to serve different thumb sizes
   * @param {String} thumbnailUrl - URL to thumbnail
   * @param {String} resizeSuffix - Specifix suffix used by Google Drive to specify image sizes. Example 'w310' or 's1500'
   */
  getResizedThumbnailUrl(thumbnailUrl, resizeSuffix) {
    if (!thumbnailUrl) return;
    if (!resizeSuffix) return thumbnailUrl;
    return thumbnailUrl.replace(/(.*=)(s\d+)(&.*|$)/, `$1${resizeSuffix}$3`);
  },

  /**
   * Is mimeType editable in Google Drive
   */
  editableInGoogleDrive(mimeType) {
    return /vnd\.google\-apps/.test(mimeType);
  },
};
