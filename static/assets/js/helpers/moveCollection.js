import { bindActionCreators } from 'redux';
import store from '../store';
import Logger from '../services/Logger';
import localization from '../shared/strings';
import Toast from '../components/Toast';
import showSelectFromTreeDialog from './showSelectFromTreeDialog';
import {
  getChildren,
  moveCollection,
} from '../store/actions/collections';
import { findCollection, getParent } from '../store/helpers/collections';

const collectionsActions = bindActionCreators(
  { getChildren, moveCollection },
  store.dispatch,
);

const handleMoveDialogSubmit = async (selectedCollections, collection) => {
  const { collections } = store.getState().collections;
  if (selectedCollections && selectedCollections.length) {
    const rootId = collections.my._id;
    const { _id, name, path } = collection;
    const collectionToMove = { id: _id, name, path };
    const targetCollectionId = selectedCollections[0];

    const collectionToMoveParent = getParent(collections, 'my', {
      _id: collectionToMove.id,
    });
    const collectionTarget = findCollection(collections, 'my', { _id: targetCollectionId });
    const collectionToMoveParentId = collectionToMoveParent && collectionToMoveParent._id;

    let oldPath;
    if (collectionToMoveParent) {
      oldPath = rootId === collectionToMoveParentId ? '/' : collectionToMove.path;
    } else {
      oldPath = collectionToMove.path;
    }
    const newPath = rootId === targetCollectionId ? '/' : `${collectionTarget.path + collectionTarget.name}/`;

    Logger.log('User', 'MoveCollection', collectionToMove.id);
    collectionsActions.moveCollection(
      collectionToMove.id,
      targetCollectionId,
      newPath,
      oldPath,
      collectionToMove.name,
    );
  } else {
    Toast(localization.TAGSTREE.textCollectionNotSelected);
  }
};

const handleMove = (collection) => {
  const { collections } = store.getState().collections;
  const { _id, name, path } = collection;
  const collectionToMove = { id: _id, name, path };

  showSelectFromTreeDialog({
    title: localization.DIALOGS.MOVE_COLLECTION_DIALOG.TITLE,
    treeListItems: [collections.my] || [],
    onLoadChildren: async (item) => collectionsActions.getChildren(item._id),
    onClose: () => {},
    onOk: (selectedCollections) => handleMoveDialogSubmit(selectedCollections, collection),
    textBtnCancel: localization.DIALOGS.MOVE_COLLECTION_DIALOG.CANCEL_TEXT,
    textBtnOk: localization.DIALOGS.MOVE_COLLECTION_DIALOG.OK_TEXT,
    openedItems: [collections.my._id],
    collectionToMove,
    type: 'move',
  });
};

export default handleMove;
