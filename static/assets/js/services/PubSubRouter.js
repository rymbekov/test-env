import events from '@picsio/events';
import CONSTANTS from '@picsio/db/src/constants';
import uniq from 'lodash.uniq';
import _find from 'lodash/find';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _replace from 'lodash/replace';

import { bindActionCreators } from 'redux';
import picsioConfig from '../../../../config';
import localization from '../shared/strings';
import Logger from './Logger';

import store from '../store';
import * as actions from '../store/actions/notifications';
import * as _collectionsActions from '../store/actions/collections';
import * as _assetsActions from '../store/actions/assets';
import * as _keywordsActions from '../store/actions/keywords';
import * as _customFieldsActions from '../store/actions/customFields';
import * as _inboxesActions from '../store/inboxes/actions';
import { isHaveTeammatePermission } from '../store/helpers/user';
import { showDestructiveSyncErrorDialog } from '../store/helpers/notifications';
import * as pathHelper from '../helpers/paths';

import * as collectionsApi from '../api/collections';
import {
  findCollection,
  findCollections,
  getParent,
  getAllowedCollections,
  getAllowedCollectionsWithPermissions,
} from '../store/helpers/collections';
import getSessionId from '../helpers/getSessionId';
import checkUserEventSubscription from '../helpers/checkUserEventSubscription';

import _archiveActions from '../store/actions/archive';
import { findCollectionById } from '../store/actions/helpers/archive';
import Toast from '../components/Toast';
import { showDialog } from '../components/dialog';
import {
  back, getPreviewId, navigateToRoot, setSearchRoute,
} from '../helpers/history';

const eventItems = [
  'collection.created',
  'collection.deleted',
  'collection.renamed',
  'collection.moved',
  'collection.color.changed',
  'collection.description.changed',
  'collection.archived',
  'collection.archived.deleted',
  'collection.unarchived',
  'website.created',
  'website.deleted',
  'invitation.sent',
  'invitation.accepted',
  'invitation.rejected',
  'invitation.pending',
  'assets.trashing.waiting',
  'assets.trashing.complete',
  'assets.moving.waiting',
  'assets.moving.complete',
  'assets.deleting.waiting',
  'assets.deleting.complete',
  'assets.untrashing.waiting',
  'assets.untrashing.complete',
  'assets.untrashing.failed',
  'assets.assigned',
  'assets.unassigned',
  'assets.archived',
  'assets.unarchived',
  'assets.archived.deleted',
  'asset.revision.approved',
  'asset.revision.disapproved',
  'asset.created',
  'asset.renamed',
  'asset.comment.added',
  'asset.comment.deleted',
  'asset.comment.reaction.changed',
  'asset.copied',
  'asset.revision.created',
  'asset.revision.reverted',
  'assets.color.changed',
  'assets.flag.changed',
  'assets.rating.changed',
  'assets.attached_to_collection',
  'assets.detached_from_collection',
  'assets.keyword_attached',
  'assets.keyword_detached',
  'asset.metadating.complete',
  'asset.replicating.complete',
  'asset.contenting.complete',
  'asset.thumbnailing.complete',
  'assets.metadating.failed',
  'assets.replicating.failed',
  'assets.keywording.complete',
  'assets.keywording.failed',
  'assets.contenting.failed',
  'assets.thumbnailing.failed',
  'assets.removed_modified_meta_field',
  'keywords.created',
  'keyword.renamed',
  'keywords.deleted',
  'keywords.dictionary_applied',
  'sync.started.FullSync',
  'sync.failed.FullSync',
  'sync.succeed.FullSync',
  'sync.succeed.IncrementalSync',
  'user.free_keywords_run_out',
  'user.working_folder.changed',
  'system.message',
  'customfield.created',
  'customfield.deleted',
  'command.reload_app',
  'user.jobs_statuses',
  'inbox.created',
  'inbox.renamed',
  'inbox.deleted',
  'inbox.changed',
  'inbox.asset.created',
  'inbox.assetsLimitExceeded',
  'asset.adobe_uploaded',
];
const SEPARATOR = '→';

const notificationsActions = bindActionCreators(actions, store.dispatch);
const collectionsActions = bindActionCreators(_collectionsActions, store.dispatch);
const assetsActions = bindActionCreators(_assetsActions, store.dispatch);
const keywordsActions = bindActionCreators(_keywordsActions, store.dispatch);
const customFieldsActions = bindActionCreators(_customFieldsActions, store.dispatch);
const inboxesActions = bindActionCreators(_inboxesActions, store.dispatch);
const archiveActions = bindActionCreators(_archiveActions, store.dispatch);

const notificationCenterTypes = events.getNotificationCenterTypes();
const getIds = (event) => event.data.assets.map((item) => item._id);

const addChangedTagsIdsAfterSync = (data) => {
  const { sync } = data;
  if (sync && sync.stats && sync.stats.assetsCreatedIn) {
    const ids = sync.stats.assetsCreatedIn.length
      ? sync.stats.assetsCreatedIn
      : [];
    if (ids.length) notificationsActions.addChangedTagsIds(ids);
  }
};

const addChangedTagsIds = (data, otherIds = []) => {
  const collectionIds = data.assets.reduce((ids, asset) => {
    if (asset.tags && asset.tags.length) {
      ids.push(...asset.tags.map((t) => t._id));
    }
    return ids;
  }, []);
  const ids = uniq(collectionIds);

  notificationsActions.addChangedTagsIds([...ids, ...otherIds]);
};

const addActiveChangedIds = (collections, activeCollection, normalized = true) => {
  if (activeCollection) {
    const regexp = new RegExp(`^${activeCollection.path}${activeCollection.name}/`);
    const update = collections.find((i) => {
      if (!normalized) {
        const withoutRoot = _replace(i.path, '/root', '');
        const lastSlashIndex = withoutRoot.lastIndexOf('/');
        const path = withoutRoot.slice(0, lastSlashIndex + 1);

        return path.match(regexp);
      }
      return i.path.match(regexp);
    });

    if (update) {
      notificationsActions.addChangedTagsIds([activeCollection._id]);
    }
  }
};

export default async function PubSubRouter(socket) {
  const { user } = store.getState();
  const userId = user._id;

  if (picsioConfig.isMainApp()) {
    // permissions
    const { integrations } = user;

    const manageTeamEvents = ['invitation.rejected', 'invitation.pending'];
    const manageBillingEvents = ['user.free_keywords_run_out'];
    const manageStorageEvents = ['user.low_disk_space'];
    // TODO: needs to test it
    const isHasAccessManageTeamEvents = !isHaveTeammatePermission('manageTeam');
    const isHasAccessManageBillingEvents = !isHaveTeammatePermission(
      'manageBilling',
    );

    // Events for notification center
    notificationCenterTypes.forEach((item) => {
      socket.on(item, async (event) => {
        const isUserUnsubscribed = checkUserEventSubscription(
          userId,
          event,
          integrations,
          'notificationCenter',
        );

        if (event.type === 'system.message') {
          if (event.data.reloadApp) {
            Logger.log('UI', 'AppReloadAlert');
            Toast('New version is available!<br />Please reload the app to ensure it works correctly.', {
              autoClose: false,
              closeButton: false,
              btnOkValue: 'Refresh',
              onOk: () => {
                Logger.log('User', 'AppReloadAlertRefresh');
                window.location.reload();
              },
            });
          }
          notificationsActions.add(event);
          return;
        }

        if (isUserUnsubscribed) return;

        if (
          manageTeamEvents.includes(event.type)
          && isHasAccessManageTeamEvents
        ) {
          notificationsActions.add(event);
          return;
        }
        if (
          manageTeamEvents.includes(event.type)
          && !isHasAccessManageTeamEvents
        ) {
          return;
        }
        if (
          manageBillingEvents.includes(event.type)
          && isHasAccessManageBillingEvents
        ) {
          notificationsActions.add(event);
          return;
        }
        if (manageStorageEvents.includes(event.type)) {
          notificationsActions.add(event);
          return;
        }
        if (
          manageBillingEvents.includes(event.type)
          && !isHasAccessManageBillingEvents
        ) {
          return;
        }

        const isInitiator = userId === (event.initiator && event.initiator._id);
        const handleAnyway = [
          'asset.adobe_uploaded',
          'inbox.asset.created',
          'inbox.assetsLimitExceeded',
          'sync.succeed.FullSync',
        ].includes(event.type);

        if ((handleAnyway || !isInitiator) && !isUserUnsubscribed) {
          notificationsActions.add(event);
        }
      });
    });
  }

  // Events for real time update
  eventItems.forEach((item) => {
    socket.on(item, async (event) => {
      const { tagId } = store.getState().router.location.query;
      const handleAnyway = [
        'assets.attached_to_collection',
        'collection.created',
        'asset.created',
        'assets.trashing.complete',
        'assets.moving.complete',
        'assets.untrashing.complete',
        'assets.deleting.complete',
        'keywords.created',
        'inbox.asset.created',
        'assets.keywording.complete',
        'sync.succeed.FullSync',
        'sync.failed.FullSync',
        'assets.archived.deleted',
      ].includes(event.type);
      const isInitiator = userId === (event.initiator && event.initiator._id);
      const initiatorId = (event.initiator && event.initiator._id) || 'unknown';

      try {
        if (handleAnyway || !isInitiator) {
          switch (item) {
          case 'collection.created': {
            const collectionsStore = store.getState().collections;
            // Checks if parrent collection is opened and only then push new collection
            const newCollection = { ...event.data.collection };
            const pathArr = newCollection.path.split('/');
            if (pathArr[1] === 'root') pathArr.splice(1, 1);

              const newCollectionName = pathArr.pop(); // eslint-disable-line
            const parentName = pathArr.pop();
            const parentPath = `${pathArr.join('/')}/`;

            let parentCollection = null;
            /** if parent is root collection */
            if (parentPath === '/' && !parentName) {
              parentCollection = collectionsStore.collections.my;
            } else {
              /** @type {Object[]} */
              const parentLvl = findCollections(
                collectionsStore.collections,
                null,
                { path: parentPath },
              );
              if (parentLvl && parentLvl.length > 0) {
                parentCollection = parentLvl.find(
                  (c) => c.path === parentPath && c.name === parentName,
                );
              }
            }

            if (
              (parentCollection && parentCollection.isOpen)
                /** children already fetched */
                || (parentCollection && parentCollection.isFetching === false)
                /** new collection is first child */
                || (parentCollection && parentCollection.hasChild === false)
            ) {
              const collection = await collectionsApi.getCollection(
                newCollection._id,
              );
              collection.path += collection.name;
              collection.addedByTeammate = true; // needs to highlight new collection
              delete collection.name;
              collection.permissions = { ...parentCollection.permissions };

              collectionsActions.pushCollections([collection]);
              collectionsActions.getChildren(collection._id);
            }
            break;
          }

          case 'collection.deleted': {
            const collectionsStore = store.getState().collections;
            const collectionId = event.data.collection._id;
            const collection = findCollection(
              collectionsStore.collections,
              'my',
              {
                _id: collectionId,
              },
            );
            if (collection) {
              collectionsActions.collectionRemoving(collectionId);
              if (tagId === collectionId) {
                const alertText = `${event.initiator.displayName} has just deleted "${event.data.collection.name}" collection.`;
                Logger.log(
                  'UI',
                  'CollectionAlreadyDeletedDialog',
                  collectionId,
                );
                showDialog({
                  title: 'Error',
                  text: alertText,
                  textBtnOk: 'Ok',
                  textBtnCancel: null,
                  onOk: () => navigateToRoot(),
                  onCancel: () => navigateToRoot(),
                });
              }
            }
            break;
          }

          case 'collection.renamed': {
            collectionsActions.renamedCollection(event.data.collection);
            break;
          }

          case 'collection.color.changed': {
            collectionsActions.changedCollectionColor(
              event.data.collection._id,
              event.data.collection.color,
            );
            break;
          }

          case 'collection.description.changed': {
            collectionsActions.changedCollectionDescription(
              event.data.collection._id,
              event.data.collection.description,
            );
            break;
          }

          case 'collection.archived': {
            const { data, initiator } = event;

            const { collections, archive } = store.getState();
            const { archived } = store.getState().router.location.query;
            const collectionsWithPermissions = await getAllowedCollectionsWithPermissions(data.collections);
            const archivedCollections = _filter(collectionsWithPermissions, { archived: true });

            const add = (markAsChanged = false) => {
              if (markAsChanged) {
                const activeCollection = !archived
                  ? findCollection(collections.collections, 'my', { _id: collections.activeCollection?._id })
                  : findCollectionById(archive.collections, archive.activeCollectionId);

                addActiveChangedIds(collectionsWithPermissions, activeCollection);
              }
              collectionsActions.decrementCount(data.assetsTotalCount);
              archiveActions.addCollections({
                ...data, collections: collectionsWithPermissions, user, isTeammate: true,
              });
            };

            if (!archived) {
              // for main tree
              const { _id: rootCollectionId } = collections.collections.my;
              const currentCollection = _find(archivedCollections, { _id: collections.activeCollection?._id });

              if (currentCollection) {
                const { _id: collectionId, name } = currentCollection;
                const navigate = () => {
                  add();
                  setSearchRoute({ tagId: rootCollectionId });
                };

                Logger.log('UI', 'ShowDialogTeammateArchivedCollection', collectionId);
                collectionsActions.collectionRemoving(collectionId);

                showDialog({
                  title: localization.DIALOGS.TEAMMATE_ARCHIVED_COLLECTION.TITLE,
                  text: localization.DIALOGS.TEAMMATE_ARCHIVED_COLLECTION.TEXT(initiator.displayName, name),
                  onOk: navigate,
                  onCancel: navigate,
                  onClose: navigate,
                });
              } else {
                add(true);
              }
            } else {
              // for archive tree
              add(true);
            }
            break;
          }

          case 'collection.unarchived': {
            const { initiator, data } = event;
            const { collections, archive } = store.getState();
            const { archived } = store.getState().router.location.query;
            const collectionsWithPermissions = await getAllowedCollectionsWithPermissions(data.collections);
            const parentsWithPermissions = await getAllowedCollectionsWithPermissions(data.parents);
            const collectionIds = _map(collectionsWithPermissions, '_id');

            const remove = (markAsChanged = false) => {
              if (markAsChanged) {
                const activeCollection = !archived
                  ? findCollection(collections.collections, 'my', { _id: collections.activeCollection?._id })
                  : findCollectionById(archive.collections, archive.activeCollectionId);

                addActiveChangedIds(collectionsWithPermissions, activeCollection);
              }
              collectionsActions.incrementCount(data.assetsTotalCount);
              archiveActions.deleteCollections({
                ...data, collections: collectionsWithPermissions, parents: parentsWithPermissions, user, isTeammate: true,
              });
            };

            if (archived) {
              // for archive tree
              const rootCollectionId = archive.collections[0]._id;
              const currentCollection = _find(data.collections, { _id: archive.activeCollectionId });

              if (currentCollection) {
                const { _id: collectionId, name } = currentCollection;
                const navigate = () => {
                  remove();
                  archiveActions.setActiveCollectionId(rootCollectionId);
                  setSearchRoute({ tagId: rootCollectionId, archived: true });
                };

                Logger.log('UI', 'ShowDialogTeammateUnarchivedCollection', collectionId);
                archiveActions.addToDeleted(collectionId);

                showDialog({
                  title: localization.DIALOGS.TEAMMATE_UNARCHIVED_COLLECTION.TITLE,
                  text: localization.DIALOGS.TEAMMATE_UNARCHIVED_COLLECTION.TEXT(initiator.displayName, name),
                  onOk: navigate,
                  onCancel: navigate,
                  onClose: navigate,
                });
              } else {
                remove(true);
              }
            } else {
              // for main tree
              remove(true);
            }
            notificationsActions.addChangedTagsIds(collectionIds);
            break;
          }

          case 'collection.archived.deleted': {
            const { data, initiator } = event;
            const { archive } = store.getState();
            const allowedCollections = getAllowedCollections(data.collections, user);
            const currentCollection = _find(allowedCollections, { _id: archive.activeCollectionId });
            const ids = _map(allowedCollections, '_id');

            const remove = (markAsChanged = false) => {
              if (markAsChanged) {
                const activeCollection = findCollectionById(archive.collections, archive.activeCollectionId);
                addActiveChangedIds(allowedCollections, activeCollection, false);
              }
              archiveActions.deleteCollectionsById({ ids, isTeammate: true });
            };

            if (currentCollection) {
              const { _id } = currentCollection;
              const collectionName = pathHelper.getCollectionName(currentCollection.path);
              const rootCollectionId = archive.collections[0]._id;

              const navigate = () => {
                remove();
                archiveActions.setActiveCollectionId(rootCollectionId);
                setSearchRoute({ tagId: rootCollectionId, archived: true });
              };

              Logger.log('UI', 'ShowDialogTeammateDeletedArchivedCollection', _id);
              showDialog({
                title: localization.DIALOGS.TEAMMATE_DELETED_ARCHIVED_COLLECTION.TITLE,
                text: localization.DIALOGS.TEAMMATE_DELETED_ARCHIVED_COLLECTION.TEXT(initiator.displayName, collectionName),
                onOk: navigate,
                onCancel: navigate,
                onClose: navigate,
              });
            } else {
              remove(true);
            }
            break;
          }

          case 'assets.archived': {
            const { initiator, data } = event;
            const collectionsWithPermissions = await getAllowedCollectionsWithPermissions(data.collections);
            const { archived } = store.getState().router.location.query;
            const previewAssetId = getPreviewId();

            if (!archived || previewAssetId) {
              const ids = getIds(event);
              const activeAsset = event.data.assets.find((({ _id }) => _id === previewAssetId));

              if (activeAsset) {
                const navigate = () => {
                  back();
                  assetsActions.deletedAssets(ids);
                };

                Logger.log('UI', 'ShowDialogTeammateArchivedAsset', previewAssetId);
                showDialog({
                  title: localization.DIALOGS.TEAMMATE_ARCHIVED_ASSET.TITLE,
                  text: localization.DIALOGS.TEAMMATE_ARCHIVED_ASSET.TEXT(initiator.displayName, activeAsset.name),
                  textBtnOk: 'Ok',
                  onOk: navigate,
                  onCancel: navigate,
                  onClose: navigate,
                });
              } else {
                assetsActions.deletedAssets(ids);
              }
            }
            addChangedTagsIds(data);
            collectionsActions.decrementCount(data.assetsTotalCount);
            archiveActions.addCollections({
              ...data, collections: collectionsWithPermissions, user, isAssets: true, isTeammate: true,
            });
            break;
          }

          case 'assets.archived.deleted': {
            const { data } = event;
            const allowedCollections = getAllowedCollections(data.collections, user);
            const ids = _map(allowedCollections, '_id');

            notificationsActions.addChangedTagsIds(ids);
            break;
          }

          case 'assets.unarchived': {
            const { initiator, data } = event;
            const { archived } = store.getState().router.location.query;
            const previewAssetId = getPreviewId();
            const otherIds = [data.unarchivedTo._id];

            if (archived || previewAssetId) {
              const ids = getIds(event);

              if (previewAssetId && ids.includes(previewAssetId)) {
                const currentAsset = _find(data.assets, { _id: previewAssetId });
                const navigate = () => {
                  assetsActions.deletedAssets(ids);
                  back();
                };

                Logger.log(
                  'UI',
                  'ShowDialogTeammateUnarchivedAsset',
                  previewAssetId,
                );
                showDialog({
                  title: localization.DIALOGS.TEAMMATE_UNARCHIVED_ASSET.TITLE,
                  text: localization.DIALOGS.TEAMMATE_UNARCHIVED_ASSET.TEXT(initiator.displayName, currentAsset.name),
                  textBtnOk: 'Ok',
                  onOk: navigate,
                  onCancel: navigate,
                  onClose: navigate,
                });
              } else {
                assetsActions.deletedAssets(ids);
              }
            }
            addChangedTagsIds(data, otherIds);
            collectionsActions.incrementCount(data.assetsTotalCount);
            break;
          }

          case 'inbox.created': {
            inboxesActions.createdEvent(event.data.inbox._id);
            break;
          }

          case 'inbox.renamed': {
            inboxesActions.renamedEvent({ ...event.data.inbox, addedByTeammate: true });
            break;
          }

          case 'inbox.deleted': {
            inboxesActions.deletedEvent({ _id: event.data.inbox._id, deletedByTeammate: true });
            break;
          }

          case 'inbox.changed': {
            inboxesActions.changedEvent({ ...event.data.inbox });
            break;
          }

          case 'inbox.asset.created': {
            const { inbox } = event.data.assets[0];
            if (inbox) {
              notificationsActions.addChangedTagsIds([inbox._id]);
            }
            break;
          }

          case 'asset.created': {
            const collectionsStore = store.getState().collections;
            const isRecursiveSearchActive = collectionsStore.notRecursiveSearch;
            const rootID = collectionsStore.collections.my._id;
            const eventTags = [];

            if (!event.data.assets || !event.data.assets.length) {
              throw new Error('asset.created: assets are undefined');
            }
            event.data.assets.forEach((asset) => {
              if (asset.tags && asset.tags.length) {
                asset.tags.forEach((tag) => {
                  if (!eventTags.length) {
                    eventTags.push(tag);
                  } else if (
                    eventTags.some((eventTag) => eventTag._id !== tag._id)
                  ) {
                    eventTags.push(tag);
                  }
                });
              }
            });
            const changedCollections = [];

            if (isRecursiveSearchActive) {
              if (eventTags.length > 0 && tagId === eventTags[0]._id) {
                changedCollections.push(eventTags[0]._id);
              } else if (eventTags.length === 0 && tagId === rootID) {
                changedCollections.push(rootID);
              }
              // uploaded asset from 'my collection'
            } else if (eventTags.length === 0) {
              changedCollections.push(rootID);
              // uploaded asset from one of a sub-collection
            } else if (eventTags.length > 0) {
              let collectionPath;
              changedCollections.push(rootID);
              changedCollections.push(eventTags[0]._id);

              // needs to find all IDs from the received 'path'
              collectionPath = `${eventTags[0].path}/`;
              collectionPath = collectionPath.replace('/root', '');
              let collectionsList = collectionPath.split('/');
              collectionsList = collectionsList.slice(
                1,
                collectionsList.length - 1,
              );

              while (collectionsList.length > 0) {
                let collection;
                collectionsList = collectionsList.slice(
                  0,
                  collectionsList.length - 1,
                );

                collectionPath = `/${collectionsList.join('/')}/`;
                collection = getParent(collectionsStore.collections, 'my', {
                  path: collectionPath,
                });

                if (collectionsList.length === 1) {
                  if (!collection) {
                    collection = getParent(collectionsStore.collections, 'my', {
                      name: collectionsList[collectionsList.length - 1],
                    });
                  }
                }

                if (collection) {
                  changedCollections.push(collection._id);
                }
              }
            }
            if (changedCollections.length) {
              notificationsActions.addChangedTagsIds(changedCollections);
            }
            break;
          }

          case 'asset.renamed': {
            const { _id, name } = event.data.asset;
            assetsActions.renamed(_id, name);
            break;
          }

          case 'assets.trashing.waiting': {
            assetsActions.setTrashing(
              getIds(event),
              CONSTANTS.TRASHING_STATUS_FIELD_NAME,
            );
            break;
          }

          case 'assets.trashing.complete': {
            assetsActions.deletedAssets(getIds(event));
            /** Trash updated */
            const { trashed } = store.getState().router.location.query;
            if (trashed) notificationsActions.addChangedTagsIds([tagId]);

            /** only for teammates show collection updated */
            if (!isInitiator) {
              const collectionIds = event.data.assets.reduce((ids, asset) => {
                if (asset.tags && asset.tags.length) {
                  ids.push(...asset.tags.map((t) => t._id));
                }
                return ids;
              }, []);
              const ids = uniq(collectionIds);
              notificationsActions.addChangedTagsIds(ids);
            }
            break;
          }

          case 'assets.moving.waiting': {
            assetsActions.setMoving(
              getIds(event),
              CONSTANTS.ASYNC_JOB_STATUS_WAITING,
            );
            break;
          }

          case 'assets.moving.complete': {
            assetsActions.setMoving(
              getIds(event),
              CONSTANTS.ASYNC_JOB_STATUS_COMPLETE,
            );
            break;
          }

          case 'assets.deleting.waiting': {
            assetsActions.setTrashing(
              getIds(event),
              CONSTANTS.DELETING_STATUS_FIELD_NAME,
            );
            break;
          }

          case 'assets.deleting.complete': {
            assetsActions.deletedAssets(getIds(event));

            const { trashed } = store.getState().router.location.query;
            if (!isInitiator && trashed) notificationsActions.addChangedTagsIds([tagId]);

            break;
          }

          case 'assets.untrashing.waiting': {
            assetsActions.setUntrashing(
              getIds(event),
              CONSTANTS.ASYNC_JOB_STATUS_WAITING,
            );
            break;
          }

          case 'assets.untrashing.failed': {
            assetsActions.setUntrashing(
              getIds(event),
              CONSTANTS.ASYNC_JOB_STATUS_FAILED,
            );
            break;
          }

          case 'assets.untrashing.complete': {
            const collectionToUntrash = event.data.assets[0].untrashTo;
            if (collectionToUntrash) {
              notificationsActions.addChangedTagsIds([collectionToUntrash._id]);
            }
            /** Trash updated */
            const { trashed } = store.getState().router.location.query;
            if (trashed) assetsActions.deletedAssets(getIds(event));
            break;
          }

          case 'assets.color.changed': {
            assetsActions.changedColor(
              getIds(event),
              event.data.value,
              initiatorId,
            );
            break;
          }

          case 'assets.flag.changed': {
            assetsActions.changedFlag(
              getIds(event),
              event.data.value,
              initiatorId,
            );
            break;
          }

          case 'assets.rating.changed': {
            assetsActions.changedRating(
              getIds(event),
              event.data.value,
              initiatorId,
            );
            break;
          }

          case 'assets.assigned': {
            assetsActions.assignedUser(
              getIds(event),
              event.data.assignees[0]._id,
            );
            break;
          }

          case 'assets.unassigned': {
            assetsActions.unAssignedUser(
              getIds(event),
              event.data.assignees[0]._id,
            );
            break;
          }

          case 'assets.removed_modified_meta_field': {
            assetsActions.removedModifiedField(
              getIds(event),
              event.data.fieldName,
            );
            break;
          }

          case 'website.created': {
            collectionsActions.setWebsite(event.data.collection._id, {}, true);
            break;
          }

          case 'website.deleted': {
            collectionsActions.setWebsite(
              event.data.collection._id,
              null,
              true,
            );
            break;
          }

          case 'assets.attached_to_collection': {
            const tagID = event.data.collection._id;
            notificationsActions.addChangedTagsIds([tagID]);
            const ids = [];
            event.data.assets.forEach((asset) => ids.push(asset._id));
            if (!event.data.assets || !event.data.assets.length) {
              throw new Error('assets.attached_to_collection: assets are undefined');
            }
            const params = {
              _id: tagID,
              path: event.data.collection.path,
              ids,
            };
            assetsActions.addedToCollection(params);
            break;
          }

          case 'assets.detached_from_collection': {
            const tagID = event.data.collection._id;
            notificationsActions.addChangedTagsIds([tagID]);
            const ids = [];
            event.data.assets.forEach((asset) => ids.push(asset._id));
            if (!event.data.assets || !event.data.assets.length) {
              throw new Error('assets.detached_from_collection: assets are undefined');
            }
            const params = {
              _id: tagID,
              path: event.data.collection.path,
              ids,
            };
            assetsActions.removedFromCollection(params);
            break;
          }

          case 'keywords.created': {
            keywordsActions.addKeywords(event.data.keywords);
            break;
          }

          case 'keyword.renamed': {
            keywordsActions.renamed(
              event.data.keyword._id,
              event.data.keyword.name,
            );
            break;
          }

          case 'keywords.deleted': {
            keywordsActions.keywordRemoving(event.data.keywords[0]._id);
            break;
          }

          case 'assets.keyword_attached': {
            assetsActions.attachedKeyword(
              getIds(event),
              event.data.keyword,
              initiatorId,
            );
            break;
          }

          case 'assets.keyword_detached': {
            assetsActions.detachedKeyword(
              getIds(event),
              event.data.keyword._id,
              initiatorId,
            );
            break;
          }

          case 'keywords.dictionary_applied': {
            keywordsActions.getKeywords();
            break;
          }

          case 'asset.metadating.complete': {
            const { asset } = event.data;
            const fields = ['metadating'];
            const values = ['complete'];

            if ('title' in asset) {
              fields.push('title');
              values.push(asset.title);
            }
            if ('description' in asset) {
              fields.push('description');
              values.push(asset.description);
            }
            if ('color' in asset) {
              fields.push('color');
              values.push(asset.color);
            }
            if ('rating' in asset) {
              fields.push('rating');
              values.push(asset.rating);
            }
            if ('flag' in asset) {
              fields.push('flag');
              values.push(asset.flag);
            }
            if ('keywords' in asset) {
              const keywordsStore = store.getState().keywords;
              const keywordsNames = asset.keywords.map(
                (name) => SEPARATOR + name,
              );
              const keywords = keywordsStore.all.filter((keyword) => {
                if (
                  keywordsNames.includes(keyword.path)
                    || keywordsNames.some((keywordName) => keyword.path.endsWith(keywordName))
                ) {
                  return true;
                }
                return false;
              });
              fields.push('keywords');
              values.push(keywords);
            }
            if ('meta' in asset) {
              fields.push('meta');
              values.push(asset.meta);
            }

            assetsActions.updateFields(asset._id, fields, values);
            break;
          }

          case 'asset.replicating.complete': {
            assetsActions.updateFields(
              event.data.asset._id,
              ['replicating'],
              ['complete'],
            );
            break;
          }

          case 'assets.keywording.complete': {
            assetsActions.keywordsGenerated(event.data.assets);
            break;
          }

          case 'asset.contenting.complete': {
            assetsActions.updateFields(
              event.data.asset._id,
              ['contenting'],
              ['complete'],
            );
            break;
          }

          case 'asset.thumbnailing.complete': {
            const {
              _id,
              revisionId,
              thumbnailLink,
              pages,
              imageSizes,
              thumbnail,
            } = event.data.asset;
            setTimeout(() => {
              /** sometimes `403` error while trying to display thumbnail */
              assetsActions.setCustomThumbnail(
                _id,
                revisionId,
                thumbnailLink,
                pages,
                imageSizes,
                thumbnail,
              );
            }, 1000);
            break;
          }

          case 'customfield.created': {
            customFieldsActions.add(event.data.customField, true);
            break;
          }

          case 'customfield.deleted': {
            customFieldsActions.remove(event.data.customField.title, true, event.data.customField.required);
            break;
          }

          case 'command.reload_app': {
            if (!event.data.bySessionId) {
              window.location.reload();
              break;
            }

            const sessionId = getSessionId();
            const account = event.data.accounts.find(
              (acc) => acc.sessionId && acc.sessionId === sessionId,
            );

            if (account && event.data.bySessionId) {
              setTimeout(() => window.location.reload(), 2000);
            }
            break;
          }

          case 'user.jobs_statuses': {
            if (!event.data) break;
            notificationsActions.updateJobsStatus(event.data.statuses);
            break;
          }

          case 'sync.succeed.FullSync': {
            if (!event.data) break;
            const { sync } = event.data;
            const { stats } = sync;
            const {
              collectionsRemoved, collectionsCreated, tagsCreated, tagsRemoved,
            } = stats;
            if (collectionsRemoved || collectionsCreated || tagsCreated || tagsRemoved) {
              collectionsActions.getCollections();
            }
            addChangedTagsIdsAfterSync(event.data);
            break;
          }

          case 'sync.failed.FullSync': {
            if (!event.data) break;
            if (userId !== initiatorId) break; // show this event only initiator
            const { code, websites } = event.data;
            // if we show dialog, we mark event as read and don't show it in NotificationCenter
            showDestructiveSyncErrorDialog(code, websites);
            notificationsActions.notificationMarkAsRead(event._id, true);
            break;
          }

          case 'sync.succeed.IncrementalSync': {
            if (!event.data) break;
            addChangedTagsIdsAfterSync(event.data);
            break;
          }

          case 'asset.comment.added': {
            const assetId = event.data?.asset?._id;
            if (assetId) {
              notificationsActions.updateUnreadParam('newComments', event._id, assetId);
            }
            break;
          }

          case 'asset.revision.created': {
            const assetId = event.data?.asset?._id;
            if (assetId) {
              notificationsActions.updateUnreadParam('newRevisions', event._id, assetId);
            }
            break;
          }

          default:
            break;
          }
        }
      } catch (err) {
        Logger.error(
          new Error('PubSubRouter error'),
          { eventType: event.type, eventId: event._id, error: err },
          ['ProcessEventFailed', (err && err.message) || 'NoMessage'],
        );
      }
    });
  });
}
