import React from 'react';
import store from '../store';
import { navigate } from '../helpers/history';

const isUserOnS3 = () => store.getState().user.team.storageType === 's3';

export default {
  AdobeExtenstion: (url, onClick = () => {}) => (
    <span>
      Just a reminder that your plan allows you to <a className="picsioLink" href={url} onClick={onClick} target="_blank" rel="noreferrer">use Plugins</a> for Adobe products
    </span>
  ),
  AssetCommentAdded: (asset, initiator) => (
    <span>
      {initiator} added a comment to {asset}
    </span>
  ),
  AssetCommentAddedWithMention: (asset) => (
    <span>You were mentioned in a comment to an asset {asset}</span>
  ),
  AssetCommentDeleted: (asset, initiator) => (
    <span>
      {initiator} removed comment from {asset}
    </span>
  ),
  AssetCreated: (assets, collection, initiator) => (
    <span>
      {initiator} uploaded {assets} to {collection}
    </span>
  ),
  AssetCopied: (asset, collection, initiator) => (
    <span>
      {initiator} duplicated the asset that you uploaded {asset}
    </span>
  ),
  AssetRenamed: (asset, initiator) => (
    <span>
      {initiator} renamed asset {asset}
    </span>
  ),
  AssetRevisionApproved: (asset, initiator) => (
    <span>
      {initiator} <span className="positiveColor">approved</span> a revision of asset {asset}
    </span>
  ),
  AssetRevisionCreated: (asset, initiator) => (
    <span>
      {initiator} added a new revision of asset {asset}
    </span>
  ),
  AssetRevisionDisapproved: (asset, initiator) => (
    <span>
      {initiator} <span className="negativeColor">disapproved</span> a revision of asset {asset}
    </span>
  ),
  AssetRevisionReverted: (asset, initiator) => (
    <span>
      {initiator} has set the revision of the of asset {asset} as the main one.
    </span>
  ),
  AssetsAssigned: (assets, username, initiator) => (
    <span>
      {initiator} assigned {assets} to {username}
    </span>
  ),
  AssetsUnassigned: (assets, username, initiator) => (
    <span>
      {initiator} unassigned {assets} from {username}
    </span>
  ),
  AssetsTrashingComplete: (assets, initiator) => (
    <span>
      {initiator} moved {assets} to trash
    </span>
  ),
  AssetsUntrashingComplete: (assets, initiator) => (
    <span>
      {initiator} restored {assets}
    </span>
  ),
  AssetsDeletingComplete: (assets, initiator) => (
    <span>
      {initiator} deleted {assets}
    </span>
  ),
  AssetsAttachedToCollection: (assets, collection, initiator) => (
    <span>
      {initiator} attached {assets} to collection {collection}
    </span>
  ),
  AssetsDetachedFromCollection: (assets, collection, initiator) => (
    <span>
      {initiator} detached {assets} from collection {collection}
    </span>
  ),
  AssetsMovedToCollection: (assets, collection, initiator) => (
    <span>
      {initiator} moved {assets} to collection {collection}
    </span>
  ),
  AssetsDownloaded: (assets, initiator) => (
    <span>
      {initiator} downloaded {assets}
    </span>
  ),
  AssetsAttachedToLightboard: (assets, lightboard, initiator) => (
    <span>
      {initiator} attached {assets} to {lightboard}
    </span>
  ),
  AssetsColorChanged: (assets, color, initiator) => (
    <span>
      {initiator} labelled {assets} as {color}
    </span>
  ),
  AssetsFlagChanged: (assets, flagstatus, initiator) => (
    <span>
      {initiator} changed the flag status of {assets} to {flagstatus}
    </span>
  ),
  AssetsKeywordAttached: (assets, keywords, initiator) => (
    <span>
      {initiator} attached {keywords} to {assets}
    </span>
  ),
  AssetsKeywordDetached: (assets, keywords, initiator) => (
    <span>
      {initiator} detached {keywords} from {assets}
    </span>
  ),
  AssetsMetadataChanged: (assets, fields, initiator) => (
    <span>
      {initiator} changed metadata for {assets} {fields}
    </span>
  ),
  AssetsTitleChanged: (assets, value, initiator) => (
    <span>
      {initiator} changed the title of {assets} to {value}
    </span>
  ),
  AssetsDescriptionChanged: (assets, value, initiator) => (
    <span>
      {initiator} changed the description of {assets} to {value}
    </span>
  ),
  AssetsRatingChanged: (assets, starnumber, initiator) => (
    <span>
      {initiator} changed the star rating of {assets} to {starnumber}
    </span>
  ),
  AssetsContentingFailed: (assets) => <span>Content parsing for {assets} ran in to a problem</span>,
  AssetsKeywordingComplete: (assets, initiator) => (
    <span>
      {initiator} auto-generated keywords for {assets}
    </span>
  ),
  AssetsKeywordingFailed: (assets) => (
    <span>Auto-generation of keywords for {assets} ran into a problem</span>
  ),
  AssetsMetadatingFailed: (assets) => (
    <span>Metadata processing to {assets} ran into a problem</span>
  ),
  AssetsReplicatingFailed: (assets) => <span>Updates saving for {assets} ran into a problem</span>,
  AssetsThumbnailingFailed: (assets) => <span>Thumbnails to {assets} were not shown</span>,
  AssetsTranscodeVideoComplete: (asset, url) => (
    <span>
      Your video fragment {asset} is ready. Please download it through the{' '}
      <a className="picsioLink" href={url} target="_blank" rel="noreferrer">
        link
      </a>{' '}
      in the next 48 hours.
    </span>
  ),
  AssetsTranscodeVideoFailed: (asset) => (
    <span>
      We are not able to trim your video {asset} at the moment. Our support team will contact you
      once the issue is fixed.
    </span>
  ),
  AssetsArchived: (assets, initiator) => (
    <span>
      {initiator} archived {assets}
    </span>
  ),
  AssetsUnarchived: (assets, collection, initiator) => (
    <span>
      {initiator} unarchived {assets} to {collection} collection
    </span>
  ),
  CollectionCreated: (collection, initiator) => (
    <span>
      {initiator} created a new collection {collection} in Pics.io
    </span>
  ),
  CollectionDeleted: (collection, initiator) => (
    <span>
      {initiator} deleted collection {collection} with all assets and nested collections
    </span>
  ),
  CollectionMoved: (collection, newPath, oldPath, initiator) => (
    <span>
      {initiator} moved collection {collection} with all assets and nested collections from{' '}
      {oldPath} to
      {newPath}
    </span>
  ),
  CollectionRenamed: (collection, newCollection, initiator) => (
    <span>
      {initiator} renamed collection {collection} into {newCollection}
    </span>
  ),
  CollectionColorChanged: (collection, color, initiator) => (
    <span>
      {initiator} labelled {collection} as {color}
    </span>
  ),
  CollectionDescriptionChanged: (collection, value, initiator) => (
    <span>
      {initiator} changed the description of {collection} to {value}
    </span>
  ),
  CollectionArchived: (collection, initiator) => (
    <span>
      {initiator} archived the {collection} collection with all assets and nested collections
    </span>
  ),
  CollectionArchivedDeleted: (collection, initiator) => (
    <span>
      {initiator} deleted the {collection} collection with all assets and nested collections from
      archive
    </span>
  ),
  CollectionUnarchived: (collection, initiator) => (
    <span>
      {initiator} unarchived the {collection} collection with all assets and nested collections
    </span>
  ),
  InboxCreated: (inbox, initiator) => (
    <span>
      {initiator} created a new inbox {inbox} in Pics.io
    </span>
  ),
  InboxDeleted: (inbox, initiator) => (
    <span>
      {initiator} deleted inbox {inbox} with all assets
    </span>
  ),
  InboxRenamed: (inbox, newInbox, initiator) => (
    <span>
      {initiator} renamed inbox {inbox} into {newInbox}
    </span>
  ),
  InboxChanged: (inbox, changedParam, changedParamValue, initiator) => (
    <span>
      {initiator} set {changedParam} for inbox {inbox} to {changedParamValue}
    </span>
  ),
  InboxAssetsLimitExceeded: (inbox, isTrialUser = false, initiator) => (
    <span>
      Somebody tried to upload stuff to your {inbox} but your account has reached a 50,000 limit for
      {isTrialUser ? ' a trial period' : ' your plan'}.{' '}
      <span
        className="picsioLink"
        onClick={() => navigate('/billing?tab=overview')}
      >
        Upgrade your plan
      </span>{' '}
      to unblock the inbox.
    </span>
  ),
  KeywordCreated: (keyword, initiator) => (
    <span>
      {initiator} created a new keyword {keyword}
    </span>
  ),
  KeywordDeleted: (keyword, initiator) => (
    <span>
      {initiator} deleted keyword {keyword} from Pics.io
    </span>
  ),
  KeywordRenamed: (keyword, newKeyword, initiator) => (
    <span>
      {initiator} renamed keyword {keyword} into {newKeyword}
    </span>
  ),
  KeywordsDictionaryApplied: (initiator) => (
    <span>{initiator} uploaded controlled vocabulary for keywords</span>
  ),
  InvitationAccepted: (teamLink, initiator) => (
    <span>
      {initiator} joined {teamLink}
    </span>
  ),
  InvitationPending: (teamLink, invitedUser) => (
    <span>
      {invitedUser} has not accepted invitation to join {teamLink} yet
    </span>
  ),
  InvitationRejected: (teamLink, initiator) => (
    <span>
      {initiator} rejected invitation to join {teamLink}
    </span>
  ),
  InvitationSent: (teamLink, invitedUser, initiator) => (
    <span>
      {initiator} invited {invitedUser} to join {teamLink}
    </span>
  ),
  InvitationSentToMe: (teamLink) => (
    <span>Welcome to {teamLink} in Pics.io! Make yourself at home</span>
  ),
  RequestCreated: (teamLink) => (
    <span>
      The new user signed up through your company's registration page. Please go to {teamLink} to
      configure his access.
    </span>
  ),
  SyncGdToPicsioFail: (initiator) => (
    <Choose>
      <When condition={isUserOnS3()}>
        <span>{initiator} Sync from Amazon S3 Bucket to Pics.io failed</span>
      </When>
      <Otherwise>
        <span>{initiator} Sync from Google Drive to Pics.io failed</span>
      </Otherwise>
    </Choose>
  ),
  SyncGdToPicsioStart: (initiator) => (
    <Choose>
      <When condition={isUserOnS3()}>
        <span>{initiator} started sync operation from Amazon S3 Bucket</span>
      </When>
      <Otherwise>
        <span>{initiator} started sync operation from Google Drive</span>
      </Otherwise>
    </Choose>
  ),
  SyncGdToPicsioSuccess: (initiator) => (
    <Choose>
      <When condition={isUserOnS3()}>
        <span>{initiator} Sync from Amazon S3 Bucket to Pics.io was successfully completed</span>
      </When>
      <Otherwise>
        <span>{initiator} Sync from Google Drive to Pics.io was successfully completed</span>
      </Otherwise>
    </Choose>
  ),
  SyncPicsioToGdFail: (initiator) => (
    <Choose>
      <When condition={isUserOnS3()}>
        <span>{initiator} Sync from Pics.io to Amazon S3 Bucket failed</span>
      </When>
      <Otherwise>
        <span>{initiator} Sync from Pics.io to Google Drive failed</span>
      </Otherwise>
    </Choose>
  ),
  SyncPicsioToGdStart: (initiator) => (
    <Choose>
      <When condition={isUserOnS3()}>
        <span>{initiator} started sync operation to Amazon S3 Bucket</span>
      </When>
      <Otherwise>
        <span>{initiator} started sync operation to Google Drive</span>
      </Otherwise>
    </Choose>
  ),
  SyncPicsioToGdSuccess: (initiator) => (
    <Choose>
      <When condition={isUserOnS3()}>
        <span>{initiator} Sync from Pics.io to Amazon S3 Bucket was successfully completed</span>
      </When>
      <Otherwise>
        <span>{initiator} Sync from Pics.io to Google Drive was successfully completed</span>
      </Otherwise>
    </Choose>
  ),
  SyncSucceedFullSync: (initiator) => (
    <Choose>
      <When condition={isUserOnS3()}>
        <span>{initiator} Sync between Amazon S3 Bucket to Pics.io was successfully completed</span>
      </When>
      <Otherwise>
        <span>{initiator} Sync between Google Drive and Pics.io was successfully completed</span>
      </Otherwise>
    </Choose>
  ),
  SyncFailFullSync: (initiator) => (
    <Choose>
      <When condition={isUserOnS3()}>
        <span>{initiator} Sync between Amazon S3 Bucket and Pics.io failed</span>
      </When>
      <Otherwise>
        <span>{initiator} Sync between Google Drive and Pics.io failed</span>
      </Otherwise>
    </Choose>
  ),
  UserCreditsRunOut: (initiator) => (
    <span>{initiator} Your Pics.io account has run out of credits</span>
  ),
  UserFreeKeywordsRunOut: (initiator) => (
    <span>{initiator} You've run out of free auto-keywords for 1,000 assets in Pics.io</span>
  ),
  UserRemovedFromTeam: (teamLink, user, initiator) => (
    <span>
      {initiator} removed {user} from {teamLink}
    </span>
  ),
  UserRemovedFromTeamByHimself: (teamLink, initiator) => (
    <span>
      {initiator} has left {teamLink}
    </span>
  ),
  UserRoleChanged: (oldRole, newRole, initiator, teammate) => (
    <span>
      {initiator} changed {teammate} role from {oldRole} to {newRole}
    </span>
  ),
  UserTrialExpires: (initiator) => <span>{initiator} Your trial period expires today</span>,
  UserTrialExpiresInFiveDays: (initiator) => (
    <span>{initiator} Your trial period expires in 2 days</span>
  ),
  UserTrialExpiresInTwoDays: (initiator) => (
    <span>{initiator} Your trial period expires in 5 days</span>
  ),
  UserSupportConsentCreated: (initiator) => (
    <span>{initiator} granted support access to the account</span>
  ),
  UserWorkingFolderChanged: (folder, initiator) => (
    <span>
      {initiator} changed working folder to {folder}
    </span>
  ),
  WebsiteCreated: (website, collection, initiator) => (
    <span>
      {initiator} created a {website} from collection {collection}
    </span>
  ),
  WebsiteDeleted: (collection, initiator) => (
    <span>
      {initiator} removed website from collection {collection}
    </span>
  ),
  LowDiskSpace: (initiator) => <span>{initiator} Disk space is running out soon</span>,
};
