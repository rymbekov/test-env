import React, { useCallback } from 'react';
import { useMount } from 'react-use';
import { useSelector, useDispatch } from 'react-redux';
import _map from 'lodash/map';
import _filter from 'lodash/filter';

import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import { downloadCollection as openDownloadDialog } from '../../helpers/fileDownloader';

import ArchiveView from './ArchiveView';

import * as mainActions from '../../store/actions/main';
import * as collectionsActions from '../../store/actions/collections';
import * as userActions from '../../store/actions/user';
import archiveActions from '../../store/actions/archive';
import { userSelector, panelWidthSelector, sortTypeSelector } from '../../store/selectors/archive';
import { findCollectionsPathToId } from '../../store/actions/helpers/archive';
import { showDialog } from '../dialog';

import './styles.scss';

const Archive = () => {
  const dispatch = useDispatch();
  const { notRecursiveSearch: recursiveSearch } = useSelector((state) => state.collections);
  const {
    activeCollectionId,
    activeCollection,
    loading,
    collections,
    search,
    added,
    deleted,
  } = useSelector((state) => state.archive);
  const user = useSelector(userSelector);
  const sortType = useSelector(sortTypeSelector);
  const panelWidth = useSelector((state) => panelWidthSelector(state, 'catalogView.left'));
  const { permissions } = user;

  useMount(() => {
    Logger.log('UI', 'ArchiveOpened');
  });

  const setActiveCollectionId = useCallback(
    (collectionId) => {
      return dispatch(archiveActions.setActiveCollectionId(collectionId));
    },
    [dispatch]
  );

  const setActiveCollection = useCallback(
    (collectionId) => {
      return dispatch(archiveActions.setActiveCollection(collectionId));
    },
    [dispatch]
  );

  const fetchMoreCollections = useCallback(
    (collectionId) => {
      return dispatch(archiveActions.fetchArchivedCollections({ collectionId, fetchMore: true }));
    },
    [dispatch]
  );

  const downloadCollection = useCallback(
    (collectionId) => {
      openDownloadDialog(collectionId, permissions, true);
    },
    [permissions]
  );

  const unarchiveCollection = useCallback(
    (collection) => {
      const { _id: collectionId, name: collectionName } = collection;
      const { list } = findCollectionsPathToId(collections, collectionId);
      const archivedParents = _filter(list.slice(0, list.length - 1), { archived: true });
      const parentNamesString = _map(archivedParents, 'name').join(', ');

      const action = () => {
        dispatch(archiveActions.unarchiveCollection({ collectionId }));
      };
      showDialog({
        title: localization.DIALOGS.UNARCHIVE_COLLECTION_DIALOG.TITLE,
        text: localization.DIALOGS.UNARCHIVE_COLLECTION_DIALOG.TEXT(collectionName, parentNamesString),
        onOk: action,
        textBtnOk: localization.DIALOGS.UNARCHIVE_COLLECTION_DIALOG.OK,
        textBtnCancel: localization.DIALOGS.UNARCHIVE_COLLECTION_DIALOG.CANCEL,
      });
    },
    [dispatch, collections]
  );

  const deleteCollection = useCallback(
    (collectionId, name) => {
      const text = localization.TAGSTREE.textRemoveCollectionAndSite(utils.decodeSlash(name));

      showDialog({
        title: localization.TAGSTREE.textRemoveCollection,
        text,
        textBtnCancel: localization.DIALOGS.btnCancel,
        textBtnOk: localization.DIALOGS.btnOk,
        onOk: () => {
          dispatch(archiveActions.deleteArchiveCollection(collectionId));
        }
      });
    },
    [dispatch]
  );

  const searchCollections = useCallback(
    (query) => {
      if (query) {
        Logger.log('User', 'ArchiveTreeSearchUsed', { query });
        return dispatch(archiveActions.searchArchivedCollections(query));
      }
      return dispatch(archiveActions.resetSearch());
    },
    [dispatch]
  );

  const setSort = useCallback(
    (sort) => {
      return dispatch(
        userActions.updateUserSortType({ collectionType: 'collections', sortType: sort })
      );
    },
    [dispatch]
  );

  const resizePanelWidth = useCallback(
    (event) => {
      return dispatch(mainActions.resizePanel(event, 'left'));
    },
    [dispatch]
  );

  const toggleRecursiveSearch = useCallback((value) => {
    dispatch(collectionsActions.recursiveSearchToggle(value));

    utils.LocalStorage.set('picsio.recursiveSearch', !value);
  }, [dispatch]);

  return (
    <ArchiveView
      user={user}
      activeCollectionId={activeCollectionId}
      activeCollection={activeCollection}
      loading={loading}
      collections={collections}
      search={search}
      sortType={sortType}
      added={added}
      deleted={deleted}
      fetchMoreCollections={fetchMoreCollections}
      unarchiveCollection={unarchiveCollection}
      downloadCollection={downloadCollection}
      deleteCollection={deleteCollection}
      searchCollections={searchCollections}
      setSort={setSort}
      panelWidth={panelWidth}
      resizePanelWidth={resizePanelWidth}
      recursiveSearch={recursiveSearch}
      toggleRecursiveSearch={toggleRecursiveSearch}
    />
  );
};

export default Archive;
