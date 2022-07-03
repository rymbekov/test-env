import { bindActionCreators } from 'redux';
import store from '../store';
import localization from '../shared/strings';
import Logger from '../services/Logger';
import { archiveCollection } from '../store/actions/archive';
import { showDialog } from '../components/dialog';

const archiveActions = bindActionCreators(
  { archiveCollection },
  store.dispatch,
);

const handleArchive = (collection) => {
  Logger.log('UI', 'ShowCollectionMoveToArchiveDialog');
  const { _id, name, website } = collection;
  const websites = website ? [website.alias] : [];

  showDialog({
    title: localization.DIALOGS.ARCHIVE_COLLECTION_DIALOG.TITLE,
    text: localization.DIALOGS.ARCHIVE_COLLECTION_DIALOG.TEXT(name, websites),
    textBtnOk: localization.DIALOGS.ARCHIVE_COLLECTION_DIALOG.OK,
    textBtnCancel: localization.DIALOGS.ARCHIVE_COLLECTION_DIALOG.CANCEL,
    onOk: () => {
      archiveActions.archiveCollection({ collectionId: _id });
    },
  });
};

export default handleArchive;
