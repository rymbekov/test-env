/* istanbul ignore file */
import AssetCreated from './AssetCreated';
import AssetRenamed from './AssetRenamed';
import AssetCommentAdded from './AssetCommentAdded';
import AssetCommentDeleted from './AssetCommentDeleted';
import AssetCopied from './AssetCopied';
import AssetRevisionApproved from './AssetRevisionApproved';
import AssetRevisionDisapproved from './AssetRevisionDisapproved';
import AssetRevisionReverted from './AssetRevisionReverted';
import AssetsAssigned from './AssetsAssigned';
import AssetRevisionCreated from './AssetRevisionCreated';
import AssetsTrashingComplete from './AssetsTrashingComplete';
import AssetsUntrashingComplete from './AssetsUntrashingComplete';
import AssetsDeletingComplete from './AssetsDeletingComplete';
import AssetsTranscodeVideoComplete from './AssetsTranscodeVideoComplete';
import AssetsTranscodeVideoFailed from './AssetsTranscodeVideoFailed';
import AssetsArchived from './AssetsArchived';
import AssetsUnarchived from './AssetsUnarchived';
import CollectionCreated from './CollectionCreated';
import CollectionDeleted from './CollectionDeleted';
import CollectionArchived from './CollectionArchived';
import CollectionArchivedDeleted from './CollectionArchivedDeleted';
import CollectionUnarchived from './CollectionUnarchived';
import WebsiteCreated from './WebsiteCreated';
import InvitationSent from './InvitationSent';
import InvitationAccepted from './InvitationAccepted';
import InvitationPending from './InvitationPending';
import InvitationRejected from './InvitationRejected';
import SyncPicsioToGdSuccess from './SyncPicsioToGdSuccess';
import SyncPicsioToGdFail from './SyncPicsioToGdFail';
import SyncGdToPicsioSuccess from './SyncGdToPicsioSuccess';
import SyncGdToPicsioFail from './SyncGdToPicsioFail';
import SyncFailFullSync from './SyncFailFullSync';
import SyncSucceedFullSync from './SyncSucceedFullSync';
import SystemMessage from './SystemMessage';
import UserCreditsRunOut from './UserCreditsRunOut';
import UserFreeKeywordsRunOut from './UserFreeKeywordsRunOut';
import UserTrialExpires from './UserTrialExpires';
import UserTrialExpiresInFiveDays from './UserTrialExpiresInFiveDays';
import UserTrialExpiresInTwoDays from './UserTrialExpiresInTwoDays';
import UserWorkingFolderChanged from './UserWorkingFolderChanged';
import RequestCreated from './RequestCreated';
import InboxAssetCreated from './InboxAssetCreated';
import InboxCreated from './InboxCreated';
import InboxDeleted from './InboxDeleted';
import InboxAssetsLimitExceeded from './InboxAssetsLimitExceeded';
import LowDiskSpace from './LowDiskSpace';
import AdobeExtenstion from './AdobeExtenstion';

export default {
  'asset.comment.added': AssetCommentAdded,
  'asset.comment.deleted': AssetCommentDeleted,
  'asset.copied': AssetCopied,
  'asset.created': AssetCreated,
  'asset.renamed': AssetRenamed,
  'asset.revision.approved': AssetRevisionApproved,
  'asset.revision.created': AssetRevisionCreated,
  'asset.revision.disapproved': AssetRevisionDisapproved,
  'asset.revision.reverted': AssetRevisionReverted,
  'assets.archive_generation.failed': '',
  'assets.assigned': AssetsAssigned,
  'assets.trashing.complete': AssetsTrashingComplete,
  'assets.untrashing.complete': AssetsUntrashingComplete,
  'assets.deleting.complete': AssetsDeletingComplete,
  'assets.transcode_video.complete': AssetsTranscodeVideoComplete,
  'assets.transcode_video.failed': AssetsTranscodeVideoFailed,
  'assets.archived': AssetsArchived,
  'assets.unarchived': AssetsUnarchived,
  'collection.created': CollectionCreated,
  'collection.deleted': CollectionDeleted,
  'collection.archived': CollectionArchived,
  'collection.archived.deleted': CollectionArchivedDeleted,
  'collection.unarchived': CollectionUnarchived,
  'invitation.accepted': InvitationAccepted,
  'invitation.pending': InvitationPending,
  'invitation.rejected': InvitationRejected,
  'invitation.sent': InvitationSent,
  'sync.failed.gd-to-picsio': SyncGdToPicsioFail,
  'sync.failed.picsio-to-gd': SyncPicsioToGdFail,
  'sync.succeed.gd-to-picsio': SyncGdToPicsioSuccess,
  'sync.succeed.picsio-to-gd': SyncPicsioToGdSuccess,
  'sync.failed.FullSync': SyncFailFullSync,
  'sync.succeed.FullSync': SyncSucceedFullSync,
  'system.message': SystemMessage,
  'user.low_disk_space': LowDiskSpace,
  'user.working_folder.changed': UserWorkingFolderChanged,
  'user.credits_run_out': UserCreditsRunOut,
  'user.free_keywords_run_out': UserFreeKeywordsRunOut,
  'user.trial.expires': UserTrialExpires,
  'user.trial.expires_in_five_days': UserTrialExpiresInFiveDays,
  'user.trial.expires_in_two_days': UserTrialExpiresInTwoDays,
  'website.created': WebsiteCreated,
  'request.created': RequestCreated,
  'inbox.asset.created': InboxAssetCreated,
  'inbox.created': InboxCreated,
  'inbox.deleted': InboxDeleted,
  'inbox.assetsLimitExceeded': InboxAssetsLimitExceeded,
  'asset.adobe_uploaded': AdobeExtenstion,
};
