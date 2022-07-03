import {
  DELETING_STATUS_FIELD_NAME,
  TRASHING_STATUS_FIELD_NAME,
  UNTRASHING_STATUS_FIELD_NAME,
  ASYNC_JOB_STATUS_WAITING,
  ASYNC_JOB_STATUS_RUNNING,
  // ASYNC_JOB_STATUS_COMPLETE,
} from '@picsio/db/src/constants';
import picsioConfig from '../../../../../../config';
import store from '../../../store';
import { normalizeUserAvatarSrc } from '../../../store/helpers/teammates';
import { checkUserAccess } from '../../../store/helpers/user';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';

const normalizeAsset = (asset) => {
  const { items: teammates } = store.getState().teammates;
  const {
    _id: userId, enableEditor, subscriptionFeatures = {}, team, role,
  } = store.getState().user;
  let rolePermissions = {};
  let policies = {};
  if (picsioConfig.isMainApp()) {
    policies = team.policies;
    rolePermissions = role.permissions;
  }

  let { permissions = {}, archived } = asset;
  permissions = { ...permissions, ...rolePermissions };

  archived = Boolean(archived);
  const isArchiveAllowed = checkUserAccess('subscriptions', 'archive');
  const isDownloadArchiveAllowed = isArchiveAllowed && checkUserAccess('permissions', 'downloadArchive');
  const isDeleteArchiveAllowed = isArchiveAllowed && checkUserAccess('permissions', 'deleteArchive');

  const extendedAsset = { ...asset, uploadRevisionProgress: null };

  /** filter lightboards by user ( ❗ don't show teammates lightboards) */
  extendedAsset.lightboards = (asset.lightboards || []).filter((lb) => lb.userId === userId);

  extendedAsset.archived = archived;
  if (asset.name) {
    extendedAsset.shortName = asset.name.substr(0, asset.name.lastIndexOf('.')) || asset.name;
  } else {
    extendedAsset.shortName = 'Unknown name';
  }

  extendedAsset.isShared = Boolean(
    picsioConfig.isMainApp() && asset.singleSharingSettings && asset.singleSharingSettings.isShared,
  );

  extendedAsset.isGoingToTrash = [ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING].includes(
    asset[TRASHING_STATUS_FIELD_NAME],
  );
  extendedAsset.isGoingToMove = [ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING].includes(
    asset.moving,
  );
  extendedAsset.isGoingToRestore = [ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING].includes(
    asset[UNTRASHING_STATUS_FIELD_NAME],
  );
  extendedAsset.isGoingToDelete = [ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING].includes(
    asset[DELETING_STATUS_FIELD_NAME],
  );

  extendedAsset.restrictSettings = asset.restrictSettings ? asset.restrictSettings : {};
  extendedAsset.isRestricted = utils.isAssetRestricted(extendedAsset.restrictSettings);
  extendedAsset.restrictedReason = extendedAsset.isRestricted
    && (extendedAsset.restrictSettings.reason
      || policies.restrictReason
      || (picsioConfig.isProofing()
        && window.websiteConfig.user.policies
        && window.websiteConfig.user.policies.restrictReason)
      || localization.RESTRICT.RESTRICTED_REASON);
  extendedAsset.restrictedMetadataEditable = picsioConfig.isMainApp()
    ? !extendedAsset.isRestricted
      || (extendedAsset.isRestricted && permissions.restrictedChangeMetadata)
    : true;
  extendedAsset.restrictedIsDownloadableOrShareable = picsioConfig.isMainApp()
    ? !extendedAsset.isRestricted
      || (extendedAsset.isRestricted && permissions.restrictedDownload)
    : true;
  extendedAsset.restrictedIsAttachableOrRemovable = picsioConfig.isMainApp()
    ? !extendedAsset.isRestricted
      || (extendedAsset.isRestricted && permissions.restrictedMoveOrDelete)
    : true;

  extendedAsset.isTrashed = Boolean(asset.trashed);

  extendedAsset.flagShow = Boolean(
    picsioConfig.isMainApp() || picsioConfig.access.flagShow,
  );
  extendedAsset.ratingShow = Boolean(
    picsioConfig.isMainApp() || picsioConfig.access.ratingShow,
  );
  extendedAsset.colorShow = Boolean(
    picsioConfig.isMainApp() || picsioConfig.access.colorShow,
  );
  extendedAsset.fileNameShow = Boolean(
    picsioConfig.isMainApp() || picsioConfig.access.fileNameShow,
  );
  extendedAsset.enableEditor = Boolean(
    enableEditor && !asset.isVideo && !asset.isAudio && !asset.isPdf && !asset.is3DModel,
  );

  extendedAsset.flagChangeable = Boolean(
    extendedAsset.isTrashed || archived
      ? false
      : picsioConfig.isMainApp()
        ? permissions.editAssetMarks
        : picsioConfig.access.flag,
  );

  extendedAsset.ratingChangeable = Boolean(
    extendedAsset.isTrashed || archived
      ? false
      : picsioConfig.isMainApp()
        ? permissions.editAssetMarks
        : picsioConfig.access.rating,
  );

  extendedAsset.colorChangeable = Boolean(
    extendedAsset.isTrashed || archived
      ? false
      : picsioConfig.isMainApp()
        ? permissions.editAssetMarks
        : picsioConfig.access.color,
  );

  extendedAsset.downloadFiles = Boolean(
    !extendedAsset.isTrashed
      && extendedAsset.restrictedIsDownloadableOrShareable
      && ((extendedAsset.isDownloadable
        && picsioConfig.isMainApp()
        && (archived
          ? permissions.downloadFiles && isDownloadArchiveAllowed
          : permissions.downloadFiles))
        || (extendedAsset.isDownloadable && picsioConfig.isProofing() && picsioConfig.access.downloadSingleFile)),
  );

  extendedAsset.removeFiles = Boolean(
    !extendedAsset.isTrashed
      && extendedAsset.restrictedIsAttachableOrRemovable
      && picsioConfig.isMainApp()
      && (archived
        ? isDeleteArchiveAllowed && role.permissions.deleteArchive
        : permissions.deleteAssets),
  );
  extendedAsset.uploadFiles = Boolean(
    !extendedAsset.isTrashed
      && !archived
      && picsioConfig.isMainApp()
      && permissions.upload
      && subscriptionFeatures.revisions
      && asset.canUploadRevisions,
  );
  extendedAsset.allowRemoveTags = Boolean(
    !extendedAsset.isTrashed
      && !archived
      && picsioConfig.isMainApp()
      && permissions.editAssetCollections,
  );
  extendedAsset.keywordsEditable = Boolean(
    !extendedAsset.isTrashed && picsioConfig.isMainApp() && permissions.editAssetKeywords,
  );
  extendedAsset.allowAssetSharing = Boolean(
    !extendedAsset.isTrashed
      && !archived
      && picsioConfig.isMainApp()
      && permissions.websites
      && extendedAsset.restrictedIsDownloadableOrShareable,
  );
  extendedAsset.assetSharing = subscriptionFeatures.assetSharing || false;
  extendedAsset.uploadRevisionProgress = picsioConfig.isMainApp() && asset.uploadRevisionProgress;

  extendedAsset.commentsShow = Boolean(
    (picsioConfig.isMainApp() && subscriptionFeatures.comments)
      || (picsioConfig.isProofing() && picsioConfig?.access?.commentShow),
  );

  extendedAsset.commentsEnable = Boolean(picsioConfig.isMainApp() && subscriptionFeatures.comments);

  extendedAsset.allowDuplicateAsset = Boolean(
    permissions.upload && !extendedAsset.inbox && !extendedAsset.isTrashed,
  );

  extendedAsset.allowDuplicateAsset = Boolean(
    permissions.upload && !extendedAsset.inbox && !extendedAsset.isTrashed,
  );

  extendedAsset.commentsEdit = Boolean(
    (picsioConfig.isMainApp() && subscriptionFeatures.comments)
    || (picsioConfig.isProofing() && picsioConfig?.access?.comment),
  );

  extendedAsset.revisionsShow = Boolean(
    (picsioConfig.isMainApp() && subscriptionFeatures.revisions)
    || (picsioConfig.isProofing() && picsioConfig?.access?.revisionsShow),
  );

  const assignees = asset.assignees || [];
  extendedAsset.assignees = assignees
    .map((user) => {
      const teammate = teammates.find((item) => item._id === user.assigneeId);
      if (teammate) {
        return {
          _id: teammate._id,
          displayName: teammate.displayName,
          email: teammate.email,
          avatar: normalizeUserAvatarSrc(
            teammate.avatarOriginal,
            'medium',
            true,
          ),
        };
      }
      return null;
    })
    .filter(Boolean);

  extendedAsset.comments = asset.comments || [];
  if (asset.watermarkId && picsioConfig.isMainApp()) {
    const watermark = store.getState().assets.watermarks.find((watermark) => watermark._id === asset.watermarkId);
    extendedAsset.watermark = watermark;
  }

  return extendedAsset;
};

export default normalizeAsset;
