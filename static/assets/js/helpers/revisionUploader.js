import uniqBy from 'lodash.uniqby';
import { bindActionCreators } from 'redux';
import store from '../store';
import { changeUploadRevisionProgress, addRevision, updateFields } from '../store/actions/assets';
import GDriveStorage from '../storage/GDriveStorage';
import S3Storage from '../storage/S3Storage';
import Logger from '../services/Logger';
import localization from '../shared/strings';
import { handleErrors } from './errorHandler';
import showRevisionFieldsDialog from './showRevisionFieldsDialog';
import showAssetsLimitExceededDialog from './showAssetsLimitExceededDialog';
import * as Api from '../api/import';
import * as utils from '../shared/utils';

/** Store */
import Toast from '../components/Toast';
import { isRoutePreview } from './history';

const assetsActions = bindActionCreators(
  { changeUploadRevisionProgress, addRevision, updateFields },
  store.dispatch,
);

export default async function (file, asset, progress) {
  if (!file) {
    console.error('file is undefined');
    return;
  }

  const { permissions } = asset;

  const modelExtension = asset.fileExtension.toUpperCase();
  const fileExtension = file.name.split('.').pop().toUpperCase();

  if (modelExtension !== fileExtension) {
    const message = localization.IMPORT.textErrorRevisionUploadType(modelExtension);
    window.dispatchEvent(
      new CustomEvent('softError', {
        detail: {
          data: { message },
        },
      }),
    );
    return;
  }

  const { team, subscriptionFeatures } = store.getState().user;
  const { assetsLimit, assetsCount } = subscriptionFeatures;
  if (assetsCount > assetsLimit) {
    return showAssetsLimitExceededDialog();
  }

  const { policies } = team;
  let requiredFields = {};
  if (policies) {
    requiredFields = {
      comments: policies.commentsRequired,
      titleAndDescription: policies.titleAndDescriptionRequired,
      keywords: policies.keywordsRequired,
      assignees: policies.assigneesRequired,
      flag: policies.flagRequired,
      rating: policies.ratingRequired,
      color: policies.colorRequired,
    };
  }

  let showDialog = false;
  for (const field in requiredFields) {
    if (requiredFields[field] === true) {
      showDialog = true;
    }
  }

  if (showDialog) {
    return await new Promise((resolve) => {
      Logger.log('UI', 'UploadRevisionRequiredFieldsDialog');
      showRevisionFieldsDialog({
        requiredFields,
        permissions,
        onCancel: resolve,
        onOk: async (additionalFields) => {
          await upload(file, asset, progress, additionalFields);
          resolve();
        },
      });
    });
  }
  const additionalFields = {
    comment: '',
    title: '',
    description: '',
    keywordsIds: [],
    assigneeIds: [],
    flag: null,
    color: null,
    rating: null,
    selectedCustomFields: [],
  };
  await upload(file, asset, progress, additionalFields);
}

/**
 * Prepare fields to asset update
 * @param {Object} asset - asset
 * @param {Object} additionalFields - filled fields from dialog
 */
function prepareFields(additionalFields, asset) {
  const fields = ['metadating'];
  const values = ['waiting'];

  if (additionalFields.title) {
    fields.push('title');
    values.push(additionalFields.title);
  }
  if (additionalFields.description) {
    fields.push('description');
    values.push(additionalFields.description);
  }
  if (additionalFields.color) {
    fields.push('color');
    values.push(additionalFields.color);
  }
  if (additionalFields.rating) {
    fields.push('rating');
    values.push(additionalFields.rating);
  }
  if (additionalFields.flag) {
    fields.push('flag');
    values.push(additionalFields.flag);
  }
  if (additionalFields.keywordsIds.length) {
    const currentAssetKeywords = asset.keywords;
    const keywordsStore = store.getState().keywords;
    const keywords = keywordsStore.all.filter((keyword) => additionalFields.keywordsIds.includes(keyword._id));
    const uniqKeywords = uniqBy([...currentAssetKeywords, ...keywords], '_id');
    fields.push('keywords');
    values.push(uniqKeywords);
  }
  if (additionalFields.assigneeIds.length) {
    const assignees = additionalFields.assigneeIds.map((id) => ({ assigneeId: id }));
    fields.push('assignees');
    values.push(assignees);
  }

  return { fields, values };
}

/**
 * Upload new revision for asset
 * @param {File} file
 * @param {Object} asset - asset
 * @param {Function?} progress - on progress
 * @param {string?} comment - comment for revision
 * @param {string[]?} keywords - keywords ids
 * @param {string[]?} assignees - { assigneeId: string }
 * @param {Object} additionalFields - filled fields from dialog
 */
async function upload(file, asset, progress, additionalFields) {
  let storageAsset;
  const assetID = asset._id;
  function onUploadProgress({ percentage }) {
    if (progress) {
      /** custom progress */
      progress(percentage);
    }
    /** show default progress */
    const previewID = window.location.pathname.split('/').pop();
    const isPreview = isRoutePreview();

    assetsActions.changeUploadRevisionProgress(assetID, parseInt(percentage, 10));

    if (isPreview && assetID === previewID) {
      window.dispatchEvent(
        new CustomEvent('preview:uploading:progress', {
          detail: { percantage: parseInt(percentage, 10), ElParent: '#button-revisionUpload' },
        }),
      );
    }
  }

  try {
    assetsActions.changeUploadRevisionProgress(assetID, 0);
    if (asset.storageType === 's3') {
      storageAsset = await S3Storage.uploadFile({ file, id: assetID, onUploadProgress });
    } else {
      storageAsset = await GDriveStorage.uploadFile(file, { fileId: asset._id }).progress(
        onUploadProgress,
      );
    }
  } catch (error) {
    handleErrors([error], async () => await upload(file, asset, progress, additionalFields));
    const connection = utils.getNavigatorConnectionInfo();
    Logger.error(new Error('RevisionUploader: Can not upload revision'), { error }, [
      'RevisionUploadToGDFailed',
      { errorMessage: (error && error.message) || error.message || 'NoMessage', connection },
    ]);

    assetsActions.changeUploadRevisionProgress(assetID, null);
    return { success: false, error };
  }

  const { headRevisionId, fileSize, imageMediaMetadata } = storageAsset;
  const { width, height, rotation } = imageMediaMetadata || {};
  const assetData = {
    revisionId: headRevisionId,
    fileSize,
    width,
    height,
    rotation,
  };

  try {
    await Api.createRevision(asset._id, { assetData, additionalFields });

    assetsActions.addRevision({
      assetId: asset._id,
      headRevisionId: storageAsset.headRevisionId,
      imageMediaMetadata,
    });

    const { fields, values } = prepareFields(additionalFields, asset);
    assetsActions.updateFields(asset._id, fields, values);
  } catch (error) {
    const errorMessage = utils.getDataFromResponceError(error, 'msg');
    const errorCode = utils.getDataFromResponceError(error, 'code');
    const err = {
      code: 403,
      reason: 'cantSaveToDB',
      message: `${errorCode}: ${errorMessage}`,
    };

    handleErrors([err], async () => await upload(file, asset, progress, additionalFields));

    const connection = utils.getNavigatorConnectionInfo();
    Logger.error(
      new Error('RevisionUploader: can not save uploaded revision to the server'),
      { error },
      [
        'RevisionSaveToServerFailed',
        {
          errorMessage: (error && error.message) || err.message,
          connection,
        },
      ],
    );
    assetsActions.changeUploadRevisionProgress(assetID, null);
    return { success: false, error };
  }

  Toast('Revision has been uploaded', { audit: true });
  window.dispatchEvent(new Event('revision:added'));

  assetsActions.changeUploadRevisionProgress(assetID, null);
  return { success: true, error: undefined };
}
