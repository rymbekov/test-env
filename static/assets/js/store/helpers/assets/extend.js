import picsioConfig from '../../../../../../config';
import picsioUtils from '@picsio/utils';
import {
  ASYNC_JOB_STATUS_WAITING,
  ASYNC_JOB_STATUS_RUNNING,
} from '@picsio/db/src/constants';

const ASSET_DEFAULT_UO = {
  rotation: 0,
  flipX: false,
  flipY: false,
};

const pixelImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/**
 * @param {Object[]} assets
 * @returns {Object[]} - extendedAssets
 */
export default function (assets) {
  const { SPECIFIC_FORMATS, EDITABLE_MIME_TYPES, CONVERTIBLE_EXTENSIONS } = picsioConfig.formats;

  return assets.map((asset) => {
    const extendedAsset = { ...asset, uploadRevisionProgress: null };
    /** @type {string} */
    const fileExtension = asset.fileExtension ? asset.fileExtension.toLowerCase() : '';
    /** @type {string|undefined} */
    const mimeType = asset.mimeType || picsioUtils.lookupMimeType(fileExtension);
    /** @type {boolean} */
    const isSpecificGoogleFormat = mimeType ? !!SPECIFIC_FORMATS[mimeType] : false;

    /**
     * @type {string}
     */
    extendedAsset.storageId = asset.storageId || asset.googleId;
    extendedAsset.storageType = asset.storageType || 'gd';

    /** mimeType
     * @type {string|undefined}
     */
    extendedAsset.mimeType = mimeType;
    /** isVideo
     * @type {boolean}
     */
    extendedAsset.isVideo = mimeType ? !!mimeType.match(/video/) || !!asset.customVideo : false;
    /** isSupportedVideo
     * @type {boolean}
     */
    extendedAsset.isSupportedVideo =
      extendedAsset.isVideo &&
      (!!asset.customVideo ||
        extendedAsset.storageType === 'gd' ||
        asset.mimeType === 'video/mp4' ||
        [ASYNC_JOB_STATUS_RUNNING, ASYNC_JOB_STATUS_WAITING].includes(asset.transcoding));
    /** isAudio
     * @type {boolean}
     */
    extendedAsset.isAudio = mimeType ? !!mimeType.match(/audio/) : false;
    /** isPdf
     * @type {boolean}
     */
    extendedAsset.isPdf = mimeType ? mimeType === 'application/pdf' : false;
    /** is3DModel
     * @type {boolean}
     */
    extendedAsset.is3DModel = asset.fileExtension
      ? asset.fileExtension.toLowerCase() === 'obj'
      : false;
    /** canHaveRevisions
     * @type {boolean}
     */
    extendedAsset.canHaveRevisions = isSpecificGoogleFormat
      ? SPECIFIC_FORMATS[mimeType].revisions
      : true;
    /** canUploadRevisions
     * @type {boolean}
     */
    extendedAsset.canUploadRevisions = !isSpecificGoogleFormat;
    /** isSupportedForDownload
     * @type {boolean}
     */
    extendedAsset.isSupportedForDownload = extendedAsset.isDownloadable = isSpecificGoogleFormat
      ? SPECIFIC_FORMATS[mimeType].isDownloadable
      : true;
    /** isEditableInPicsioEditor
     * @type {boolean}
     */
    extendedAsset.isEditableInPicsioEditor = mimeType
      ? EDITABLE_MIME_TYPES.includes(mimeType)
      : false;
    /** isConvertibleFormat
     * @type {boolean}
     */
    extendedAsset.isConvertibleFormat = CONVERTIBLE_EXTENSIONS.includes(fileExtension);
    /** isGoogleDriveDocument
     * @type {boolean}
     */
    extendedAsset.isGoogleDriveDocument = mimeType
      ? /vnd\.google-apps/.test(mimeType) ||
        mimeType.startsWith('application/vnd.openxmlformats-officedocument.')
      : false;

    /** for highlight elements who changed by another user (received by socket)
     * @type {string[]}
     */
    extendedAsset.paramsForHighlight = [];

    /** change dimensions by imageMediaMetadata.rotation */
    const changeUserOrientation = [90, 270];

    /* no need to change dimensions, GoogleDrive returns correct dimensions
		 * [2020.10.05] need to be removed later
		const changeRotation = [1, 3];
		const metadataRotation = asset.imageMediaMetadata ? asset.imageMediaMetadata.rotation : 0;
		if (changeRotation.includes(metadataRotation)) {
			extendedAsset.imageMediaMetadata = {
				rotation: metadataRotation,
				width: asset.imageMediaMetadata.height,
				height: asset.imageMediaMetadata.width,
			};
		}
		*/

    /** if userOrientation is undefined - set default properties */
    // if (!extendedAsset.userOrientation) extendedAsset.userOrientation = Object.clone(ASSET_DEFAULT_UO, true);
    if (!extendedAsset.userOrientation) extendedAsset.userOrientation = { ...ASSET_DEFAULT_UO };

    /** change dimensions by userOrientation.rotation */
    const { rotation } = extendedAsset.userOrientation;
    if (extendedAsset.imageMediaMetadata && changeUserOrientation.includes(rotation)) {
      const { width } = extendedAsset.imageMediaMetadata;
      extendedAsset.imageMediaMetadata.width = extendedAsset.imageMediaMetadata.height;
      extendedAsset.imageMediaMetadata.height = width;
    }

    /** sort pages if exists, the "Symbols" page should be last */
    if (extendedAsset.pages) {
      Object.keys(extendedAsset.pages).forEach((revisionName) => {
        if (Array.isArray(extendedAsset.pages[revisionName])) {
          const pagesArrays = extendedAsset.pages[revisionName].reduce(
            (pagesArrays, page) => {
              if (!page.url.endsWith('response-content-disposition=inline')) {
                page.url = pixelImage;
              }
              if (page.name === 'Symbols') {
                pagesArrays[1] = [...pagesArrays[1], page];
              } else {
                pagesArrays[0] = [...pagesArrays[0], page];
              }
              return pagesArrays;
            },
            [[], []]
          );

          extendedAsset.pages[revisionName] = [...pagesArrays[0], ...pagesArrays[1]];
        }
      });
    }

    /** check access */
    extendedAsset.hasAccess = picsioConfig.isMainApp() ? checkAccess(extendedAsset) : true;

    /** check if file is empty */
    extendedAsset.isEmpty = !!(asset.fileSize && asset.fileSize === '0');

    extendedAsset.restrictSettings = asset.restrictSettings ? asset.restrictSettings : {};

    return extendedAsset;
  });
}

/**
 * Check access to the asset
 * if asset has no collections and has lightboard(s) every permission is falsy -> Access Denied
 * @returns {Boolean}
 */
function checkAccess({ tags, permissions, lightboards }) {
  const hasCollections = Boolean(tags && tags.length > 0);
  if (hasCollections) return true;

  const hasLightboards = Boolean(lightboards && lightboards.length > 0);
  const hasAnyPermissions =
    Object.keys(permissions)
      .map((key) => permissions[key])
      .filter(Boolean).length > 0;

  if (hasLightboards && !hasAnyPermissions) return false;

  return true;
}
