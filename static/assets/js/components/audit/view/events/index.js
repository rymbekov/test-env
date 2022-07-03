import AssetCommentAdded from './AssetCommentAdded';
import AssetCommentDeleted from './AssetCommentDeleted';
import AssetCreated from './AssetCreated';
import AssetCopied from './AssetCopied';
import AssetRenamed from './AssetRenamed';
import AssetRevisionApproved from './AssetRevisionApproved';
import AssetRevisionCreated from './AssetRevisionCreated';
import AssetRevisionDisapproved from './AssetRevisionDisapproved';
import AssetRevisionReverted from './AssetRevisionReverted';
import AssetsTrashingComplete from './AssetsTrashingComplete';
import AssetsUntrashingComplete from './AssetsUntrashingComplete';
import AssetsDeletingComplete from './AssetsDeletingComplete';
import AssetsAttachedToCollection from './AssetsAttachedToCollection';
import AssetsDetachedFromCollection from './AssetsDetachedFromCollection';
import AssetsMovedToCollection from './AssetsMovedToCollection';
import AssetsKeywordAttached from './AssetsKeywordAttached';
import AssetsKeywordDetached from './AssetsKeywordDetached';
import AssetsMetadataChanged from './AssetsMetadataChanged';
import AssetsArchived from './AssetsArchived';
import AssetsUnarchived from './AssetsUnarchived';
import CollectionCreated from './CollectionCreated';
import CollectionDeleted from './CollectionDeleted';
import CollectionMoved from './CollectionMoved';
import CollectionColorChanged from './CollectionColorChanged';
import CollectionDescriptionChanged from './CollectionDescriptionChanged';
import CollectionArchived from './CollectionArchived';
import CollectionArchivedDeleted from './CollectionArchivedDeleted';
import CollectionUnarchived from './CollectionUnarchived';
import WebsiteCreated from './WebsiteCreated';
import WebsiteDeleted from './WebsiteDeleted';
import InvitationSent from './InvitationSent';
import InvitationAccepted from './InvitationAccepted';
import InvitationRejected from './InvitationRejected';
import UserRoleChanged from './UserRoleChanged';
import UserRemovedFromTeam from './UserRemovedFromTeam';
import UserRemovedFromTeamByHimself from './UserRemovedFromTeamByHimself';
import AssetsDownloaded from './AssetsDownloaded';
import AssetsTitleChanged from './AssetsTitleChanged';
import AssetsDescriptionChanged from './AssetsDescriptionChanged';
import AssetsRatingChanged from './AssetsRatingChanged';
import AssetsFlagChanged from './AssetsFlagChanged';
import AssetsColorChanged from './AssetsColorChanged';
import AssetsAssigned from './AssetsAssigned';
import AssetsUnassigned from './AssetsUnassigned';
import SyncPicsioToGdStart from './SyncPicsioToGdStart';
import SyncPicsioToGdSuccess from './SyncPicsioToGdSuccess';
import SyncPicsioToGdFail from './SyncPicsioToGdFail';
import SyncGdToPicsioStart from './SyncGdToPicsioStart';
import SyncGdToPicsioSuccess from './SyncGdToPicsioSuccess';
import SyncGdToPicsioFail from './SyncGdToPicsioFail';
import SyncFailFullSync from './SyncFailFullSync';
import SyncSucceedFullSync from './SyncSucceedFullSync';
import AssetsReplicatingFailed from './AssetsReplicatingFailed';
import AssetsMetadatingFailed from './AssetsMetadatingFailed';
import AssetsContentingFailed from './AssetsContentingFailed';
import AssetsKeywordingFailed from './AssetsKeywordingFailed';
import AssetsKeywordingComplete from './AssetsKeywordingComplete';
import AssetsThumbnailingFailed from './AssetsThumbnailingFailed';
import UserWorkingFolderChanged from './UserWorkingFolderChanged';
import UsersTrialExpires from './UsersTrialExpires';
import UsersTrialExpiresIn2Days from './UsersTrialExpiresIn2Days';
import UsersTrialExpiresIn5Days from './UsersTrialExpiresIn5Days';
import UserSupportConsentCreated from './UserSupportConsentCreated';
import InboxCreated from './InboxCreated';
import InboxDeleted from './InboxDeleted';
import InboxRenamed from './InboxRenamed';
import InboxChanged from './InboxChanged';
import InboxAssetCreated from './InboxAssetCreated';

export default {
  'asset.comment.added': AssetCommentAdded,
  'asset.comment.deleted': AssetCommentDeleted,
  'asset.created': AssetCreated,
  'asset.copied': AssetCopied,
  'asset.renamed': AssetRenamed,
  'asset.revision.approved': AssetRevisionApproved,
  'asset.revision.created': AssetRevisionCreated,
  'asset.revision.disapproved': AssetRevisionDisapproved,
  'asset.revision.reverted': AssetRevisionReverted,
  'assets.trashing.complete': AssetsTrashingComplete,
  'assets.untrashing.complete': AssetsUntrashingComplete,
  'assets.deleting.complete': AssetsDeletingComplete,
  'assets.attached_to_collection': AssetsAttachedToCollection,
  'assets.detached_from_collection': AssetsDetachedFromCollection,
  'assets.moved_to_collection': AssetsMovedToCollection,
  'assets.downloaded': AssetsDownloaded,
  'assets.title.changed': AssetsTitleChanged,
  'assets.description.changed': AssetsDescriptionChanged,
  'assets.rating.changed': AssetsRatingChanged,
  'assets.flag.changed': AssetsFlagChanged,
  'assets.color.changed': AssetsColorChanged,
  'assets.assigned': AssetsAssigned,
  'assets.unassigned': AssetsUnassigned,
  'assets.replicating.failed': AssetsReplicatingFailed,
  'assets.metadating.failed': AssetsMetadatingFailed,
  'assets.contenting.failed': AssetsContentingFailed,
  'assets.keywording.failed': AssetsKeywordingFailed,
  'assets.keywording.complete': AssetsKeywordingComplete,
  'assets.keyword_attached': AssetsKeywordAttached,
  'assets.keyword_detached': AssetsKeywordDetached,
  'assets.metadata.changed': AssetsMetadataChanged,
  'assets.thumbnailing.failed': AssetsThumbnailingFailed,
  'assets.archived': AssetsArchived,
  'assets.unarchived': AssetsUnarchived,
  'collection.created': CollectionCreated,
  'collection.deleted': CollectionDeleted,
  'collection.moved': CollectionMoved,
  'collection.color.changed': CollectionColorChanged,
  'collection.description.changed': CollectionDescriptionChanged,
  'collection.archived': CollectionArchived,
  'collection.archived.deleted': CollectionArchivedDeleted,
  'collection.unarchived': CollectionUnarchived,
  'invitation.sent': InvitationSent,
  'invitation.accepted': InvitationAccepted,
  'invitation.rejected': InvitationRejected,
  'sync.started.picsio-to-gd': SyncPicsioToGdStart,
  'sync.succeed.picsio-to-gd': SyncPicsioToGdSuccess,
  'sync.failed.picsio-to-gd': SyncPicsioToGdFail,
  'sync.started.gd-to-picsio': SyncGdToPicsioStart,
  'sync.succeed.gd-to-picsio': SyncGdToPicsioSuccess,
  'sync.failed.gd-to-picsio': SyncGdToPicsioFail,
  'sync.failed.FullSync': SyncFailFullSync,
  'sync.succeed.FullSync': SyncSucceedFullSync,
  'user.role.changed': UserRoleChanged,
  'user.removed_from_team': UserRemovedFromTeam,
  'user.removed_from_team_by_himself': UserRemovedFromTeamByHimself,
  'user.working_folder.changed': UserWorkingFolderChanged,
  'user.trial.expires': UsersTrialExpires,
  'user.trial.expires_in_two_days': UsersTrialExpiresIn2Days,
  'user.trial.expires_in_five_days': UsersTrialExpiresIn5Days,
  'user.support_consent.created': UserSupportConsentCreated,
  'website.created': WebsiteCreated,
  'website.deleted': WebsiteDeleted,
  'inbox.created': InboxCreated,
  'inbox.deleted': InboxDeleted,
  'inbox.renamed': InboxRenamed,
  'inbox.changed': InboxChanged,
  'inbox.asset.created': InboxAssetCreated,
};
