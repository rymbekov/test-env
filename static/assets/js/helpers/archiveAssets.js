import { bindActionCreators } from 'redux';
import localization from '../shared/strings';
import Logger from '../services/Logger';
import showSelectFromTreeDialog from './showSelectFromTreeDialog';
import store from '../store';
import {
  archiveCollection, unarchiveCollection, archiveAssets, unarchiveAssets,
} from '../store/actions/archive';
import {
  getChildren,
} from '../store/actions/collections';
import { activeCollectionSelector } from '../store/selectors/collections';
import { showDialog } from '../components/dialog';

const archiveActions = bindActionCreators(
  {
    archiveCollection, unarchiveCollection, archiveAssets, unarchiveAssets,
  },
  store.dispatch,
);

const collectionsActions = bindActionCreators(
  {
    getChildren,
  },
  store.dispatch,
);

const getSharedAssets = (assets, selectedIds) => {
  if (assets.length === selectedIds.length) {
    return assets.filter((a) => a.singleSharingSettings && a.singleSharingSettings.isShared);
  }
  return selectedIds.reduce((acc, id) => {
    const asset = assets.find(
      (a) => a._id === id && a.singleSharingSettings && a.singleSharingSettings.isShared,
    );

    if (asset) {
      return [...acc, asset];
    }
    return acc;
  }, []);
};

const getCurrentAsset = (assets, id) => assets.find((a) => a._id === id);

/**
 * Confirm archive assets
 * @param {boolean} needToArchiveCollection
 * @param {string} archiveReason
 * @param {string[]?} assetIds - ids of assets to archive
 */
const confirmArchive = (needToArchiveCollection = false, archiveReason, assetIds) => {
  const activeCollection = activeCollectionSelector(store.getState());
  const selectedAssetsIds = assetIds || store.getState().assets.selectedItems;
  if (needToArchiveCollection) {
    archiveActions.archiveCollection({ collectionId: activeCollection._id, reason: archiveReason });
  } else {
    archiveActions.archiveAssets({ ids: selectedAssetsIds, reason: archiveReason });
  }
};

/**
 * Confirm unarchive assets
 * @param {boolean?} needToUnarchiveCollection
 * @param {string?} unarchiveToCollection
 * @param {string[]?} assetIds
 */
const confirmUnarchive = (
  needToUnarchiveCollection = false,
  unarchiveToCollection = null,
  assetIds,
) => {
  const activeCollection = activeCollectionSelector(store.getState());
  const selectedAssetsIds = assetIds || store.getState().assets.selectedItems;

  if (needToUnarchiveCollection) {
    archiveActions.unarchiveCollection({ collectionId: activeCollection._id });
  } else {
    archiveActions.unarchiveAssets({
      ids: selectedAssetsIds,
      collectionId: unarchiveToCollection,
    });
  }
};

const showArchiveSingleAssetDialog = (asset, link, archiveReason) => {
  Logger.log('UI', 'ShowArchiveSingleAssetDialog');

  showDialog({
    title: localization.DIALOGS.ARCHIVE_ASSET_DIALOG.TITLE,
    text: localization.DIALOGS.ARCHIVE_ASSET_DIALOG.TEXT(asset.name, link),
    onOk() {
      Logger.log('User', 'ConfirmArchiveSingleAssetDialog');
      confirmArchive(false, archiveReason, [asset._id]);
    },
    onCancel() {
      Logger.log('User', 'CancelArchiveSingleAssetDialog');
    },
    onClose() {
      Logger.log('User', 'CloseArchiveSingleAssetDialog');
    },
    textBtnOk: localization.DIALOGS.ARCHIVE_ASSET_DIALOG.OK,
    textBtnCancel: localization.DIALOGS.ARCHIVE_ASSET_DIALOG.CANCEL,
  });
};

const showArchiveAllAssetsDialog = () => {
  Logger.log('UI', 'ShowArchiveAllAssetsDialog');
  const activeCollection = activeCollectionSelector(store.getState());

  showDialog({
    title: localization.DIALOGS.ARCHIVE_ALL_ASSETS_DIALOG.TITLE,
    text: localization.DIALOGS.ARCHIVE_ALL_ASSETS_DIALOG.TEXT(activeCollection.name),
    onOk() {
      Logger.log('User', 'ConfirmArchiveAllAssetsDialog');
      confirmArchive(true);
    },
    onCancel() {
      confirmArchive(false);
      Logger.log('User', 'CancelArchiveAllAssetsDialog');
    },
    onClose() {
      Logger.log('User', 'CloseArchiveAllAssetsDialog');
    },
    textBtnOk: localization.DIALOGS.ARCHIVE_ALL_ASSETS_DIALOG.OK,
    textBtnCancel: localization.DIALOGS.ARCHIVE_ALL_ASSETS_DIALOG.CANCEL,
  });
};

const showArchiveSeveralAssetsDialog = (selectedAssets, count, sharedAssets, isAll = false) => {
  Logger.log('UI', 'ShowArchiveSeveralAssetsDialog');

  showDialog({
    title: localization.DIALOGS.ARCHIVE_ASSETS_DIALOG.TITLE,
    text: localization.DIALOGS.ARCHIVE_ASSETS_DIALOG.TEXT(selectedAssets, count, sharedAssets),
    onOk() {
      Logger.log('User', 'ConfirmArchiveSeveralAssetsDialog');

      if (isAll) {
        showArchiveAllAssetsDialog();
      } else {
        confirmArchive();
      }
    },
    onCancel() {
      Logger.log('User', 'CancelArchiveSeveralAssetsDialog');
    },
    onClose() {
      Logger.log('User', 'CloseArchiveSeveralAssetsDialog');
    },
    textBtnOk: localization.DIALOGS.ARCHIVE_ASSETS_DIALOG.OK,
    textBtnCancel: localization.DIALOGS.ARCHIVE_ASSETS_DIALOG.CANCEL,
  });
};

const showChooseCollectionDialog = (assetIds) => {
  Logger.log('UI', 'ShowSelectCollectionToRestoreToDialog');
  const myCollection = store.getState().collections.collections.my;
  const { _id } = myCollection;
  const onLoadChildren = async (item) => collectionsActions.getChildren(item._id);

  showSelectFromTreeDialog({
    title: localization.DIALOGS.UNARCHIVE_ASSETS_TO.TITLE,
    treeListItems: [myCollection],
    onLoadChildren,
    onOk: (selectedCollections) => {
      confirmUnarchive(false, selectedCollections[0], assetIds);
    },
    textBtnOk: localization.DIALOGS.UNARCHIVE_ASSETS_TO.OK,
    textBtnCancel: localization.DIALOGS.UNARCHIVE_ASSETS_TO.CANCEL,
    type: 'moveAssets',
    openedItems: [_id],
  });
};

const showUnarchiveAssetsDialog = (selectedAssetsString, count, assetIds) => {
  Logger.log('UI', 'ShowUnarchiveAssetsDialog');

  showDialog({
    title: localization.DIALOGS.UNARCHIVE_ASSETS_DIALOG.TITLE,
    text: localization.DIALOGS.UNARCHIVE_ASSETS_DIALOG.TEXT(selectedAssetsString, count),
    onOk() {
      Logger.log('User', 'ConfirmUnarchiveAssetsDialog');

      showChooseCollectionDialog(assetIds);
    },
    onCancel() {
      Logger.log('User', 'CancelUnarchiveAssetsDialog');
    },
    onClose() {
      Logger.log('User', 'CloseUnarchiveAssetsDialog');
    },
    textBtnOk: localization.DIALOGS.UNARCHIVE_ASSETS_DIALOG.OK,
    textBtnCancel: localization.DIALOGS.UNARCHIVE_ASSETS_DIALOG.CANCEL,
  });
};

const showUnarchiveAllAssetsDialog = () => {
  Logger.log('UI', 'ShowUnarchiveAllAssetsDialog');
  const activeCollection = activeCollectionSelector(store.getState());

  showDialog({
    title: localization.DIALOGS.UNARCHIVE_ALL_ASSETS_DIALOG.TITLE,
    text: localization.DIALOGS.UNARCHIVE_ALL_ASSETS_DIALOG.TEXT(activeCollection.name),
    onOk() {
      Logger.log('User', 'ConfirmUnarchiveAllAssetsDialog');

      confirmUnarchive(true);
    },
    onCancel() {
      Logger.log('User', 'CancelUnarchiveAllAssetsDialog');

      showChooseCollectionDialog();
    },
    onClose() {
      Logger.log('User', 'CloseUnarchiveAllAssetsDialog');
    },
    textBtnOk: localization.DIALOGS.UNARCHIVE_ALL_ASSETS_DIALOG.OK,
    textBtnCancel: localization.DIALOGS.UNARCHIVE_ALL_ASSETS_DIALOG.CANCEL,
  });
};

/**
 * Archive assets
 * @param {string[]} selectedAssetsIds
 * @param {boolean?} isArchived
 * @param {string?} archiveReason
 * @returns {JSX}
 */
export default function handleArchive(
  selectedAssetsIds,
  isArchived,
  archiveReason = localization.DETAILS.defaultArchiveReason,
) {
  const isSingleAsset = selectedAssetsIds.length === 1;
  const { items: assets, total } = store.getState().assets;
  const activeCollection = activeCollectionSelector(store.getState());
  const isAll = assets.length === selectedAssetsIds.length || total === selectedAssetsIds.length;
  const selectedAssets = assets
    .filter(({ _id }) => selectedAssetsIds.includes(_id))
    .map(({ name }) => `<span class="highlight">${name}</span>`);
  const selectedAssetsString = selectedAssets.slice(0, 5).join(', ');

  if (!isArchived) {
    Logger.log('User', 'AssetMoveToArchiveClicked', { assets: selectedAssetsIds });
    const sharedAssets = getSharedAssets(assets, selectedAssetsIds).map(
      ({ _id }) => `https://show.pics.io/preview/${_id}`,
    );

    if (isSingleAsset) {
      const asset = getCurrentAsset(assets, selectedAssetsIds[0]);
      const link = sharedAssets[0];

      showArchiveSingleAssetDialog(asset, link, archiveReason);
    } else {
      showArchiveSeveralAssetsDialog(
        selectedAssetsString,
        selectedAssets.length - 5,
        sharedAssets,
        isAll,
      );
    }
  } else {
    Logger.log('User', 'AssetUnarchiveClicked', { assets: selectedAssetsIds });

    if (isAll && activeCollection && activeCollection.archived) {
      showUnarchiveAllAssetsDialog();
    } else {
      showUnarchiveAssetsDialog(selectedAssetsString, selectedAssets.length - 5, selectedAssetsIds);
    }
  }
}
