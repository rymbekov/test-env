import React from 'react';
import union from 'lodash.union';
import debounce from 'lodash.debounce';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ua from '../../../ua';
import localization from '../../../shared/strings';

import * as utils from '../../../shared/utils';
import Logger from '../../../services/Logger';
import picsioConfig from '../../../../../../config';
import store from '../../../store';
import * as collectionsActions from '../../../store/actions/collections';
import * as mainActions from '../../../store/actions/main';
import * as userActions from '../../../store/actions/user';
import * as assetsActions from '../../../store/actions/assets';
import * as lightboardsActions from '../../../store/actions/lightboards';
import * as notificationsActions from '../../../store/actions/notifications';
import * as archiveActions from '../../../store/actions/archive';
import { findCollection, getParent } from '../../../store/helpers/collections';

import { Checkbox } from '../../../UIComponents';

import showSelectFromTreeDialog from '../../../helpers/showSelectFromTreeDialog';
import { downloadCollection } from '../../../helpers/fileDownloader';
import { setSearchRoute, navigate } from '../../../helpers/history';
import archiveCollection from '../../../helpers/archiveCollection';
import Toast from '../../Toast';
import { showDialog } from '../../dialog';

import SearchBar from '../../SearchBar';
import Spinner from './Spinner';
import Item from './TagItem';
import Trash from './Trash';

class Tree extends React.Component {
  initialTagId = null;

  state = {
    openedCollections: {
      favorites: [],
      websites: [],
      my: [],
    },
    isTrashActive: false,
  };

  componentDidMount() {
    const { tagId } = this.props.searchQuery;
    this.findOpenedCollectionsIds(tagId);
  }

  static getDerivedStateFromProps(nextProps) {
    const { trashed } = nextProps.searchQuery;
    return { isTrashActive: Boolean(trashed) };
  }

  componentDidUpdate(prevProps) {
    const { tagId, archived } = this.props.searchQuery;
    const { openedTree, collectionsActions: propsActions, collectionsStore } = this.props;

    if (openedTree === 'collections' && openedTree !== prevProps.openedTree) {
      propsActions.applySearch('');
    }

    if (
      !archived &&
      prevProps.collectionsStore.collections &&
      collectionsStore.collections &&
      ((tagId && this.initialTagId === null) ||
        prevProps.collectionsStore.collections.my.nodes !== collectionsStore.collections.my.nodes)
    ) {
      this.findOpenedCollectionsIds(tagId);
    }
  }

  /**
   * Click on collection item
   * @param {string} collectionID
   */
  onClickItem = (collectionID, hasChild = true) => {
    this.props.notificationsActions.clearChangedTagsIds();
    setSearchRoute({ tagId: collectionID });
    Logger.log('User', 'CollectionPanelSelectCollection', collectionID);
    /** hide tree */
    if (ua.isMobileApp() || (ua.browser.isNotDesktop() && window.innerWidth < 1024))
      this.props.mainActions.setMobileMainScreenPanel('catalog');
  };

  /** Click on Trash */
  handleClickTrash = async () => {
    this.props.notificationsActions.clearChangedTagsIds();
    setSearchRoute({ tagId: this.props.rootCollectionId, trashed: true });
    Logger.log('User', 'CollectionPanelSelectCollection', 'Trash');
    this.props.collectionsActions.setActiveCollection(null);
    /** hide tree */
    if (ua.isMobileApp() || (ua.browser.isNotDesktop() && window.innerWidth < 1024))
      this.props.mainActions.setMobileMainScreenPanel('catalog');
  };

  /**
   * Click on collection item
   * @param {string} collectionID
   */
  onClickUpload = (collectionID) => {
    setSearchRoute({ tagId: collectionID });
  };

  getCurrentLevelCollections = (collectionID) => {
    const { collections } = this.props.collectionsStore;
    let result = [];
    const loop = (collection, index, nodes) => {
      if (collection._id === collectionID) {
        result = nodes;
        return false;
      }
      if (collection.nodes) {
        collection.nodes.every(loop);
      }
      return true;
    };

    if (collections.my.nodes) {
      collections.my.nodes.every(loop);
    }
    return result;
  };

  public = (collectionID) => {
    navigate(`/websites/${collectionID}?tab=main`);

    Logger.log('UI', 'WebSiteSettingsPage', collectionID);
  };

  onChangeUpload = (files) => {
    window.dispatchEvent(new CustomEvent('importPanel:add', { detail: files }));
    const { tagId } = this.props.searchQuery;
    Logger.log('User', 'CollectionsPanelUpload', { collectionId: tagId });
  };

  /**
   * @param {Object} node - collection
   * @param {Boolean} isMove
   */
  onDrop = (node, isMove) => {
    const assets = store.getState().assets.items;
    const selectedAssets = assets.filter((asset) => this.props.selectedItems.includes(asset._id));
    if (
      utils.isSelectedAssetsRestricted(selectedAssets) &&
      this.props.rolePermissions.restrictedMoveOrDelete === false
    ) {
      return showDialog({
        title: 'Warning',
        text:
          this.props.selectedItems.length > 1
            ? localization.RESTRICT.attachAssetsToCollection
            : localization.RESTRICT.attachAssetToCollection,
        textBtnOk: 'Ok',
        textBtnCancel: null,
      });
    }
    const path = (node.path + node.name).substring(1);
    this.props.assetsActions.addToCollection({
      collectionID: node._id,
      collectionPath: path,
      assetIDs: undefined,
      isMove,
    });

    if (isMove) {
      Logger.log('User', 'ThumbnailMoveToCollection');
    } else {
      Logger.log('User', 'ThumbnailAddToCollection', {
        collectionId: node._id,
        assetIDs: this.props.selectedItems,
      });
    }
  };

  onDragover(event) {
    event.preventDefault();
    event.stopPropagation();
    const isSomeAssetRestricted = this.isRestricted();
    if (!isSomeAssetRestricted) {
      event.dataTransfer.dropEffect = 'copy';
      event.currentTarget.classList.add('onDragenterHighlight');
    }
  }

  onDragleave(event) {
    event.currentTarget.classList.remove('onDragenterHighlight');
  }

  findOpenedCollectionsIds = (tagId) => {
    const { collections: storeCollections } = this.props.collectionsStore;
    const parentsIds = [];
    let foundCollection = findCollection(storeCollections, 'my', { _id: tagId });

    while (foundCollection) {
      parentsIds.push(foundCollection._id);
      foundCollection = getParent(storeCollections, 'my', { _id: foundCollection._id });
      this.fetching = false;
    }
    const newOpenedCollections = { ...this.state.openedCollections };

    if (parentsIds.length) {
      newOpenedCollections.my = union(newOpenedCollections.my, parentsIds);
    }
    this.initialTagId = tagId;
    this.setState({ openedCollections: newOpenedCollections });
  };

  handleToggleOpenCollections = (name, id) => {
    const items = this.state.openedCollections;
    if (!items[name].includes(id)) {
      items[name].push(id);
    } else {
      const index = items[name].indexOf(id);
      if (index > -1) {
        items[name].splice(index, 1);
      }
    }
    this.setState({ openedCollections: items });
  };

  handleMoveDialogOpen = (collectionId, name, path) => {
    if (!picsioConfig.isMainApp()) return;

    Logger.log('UI', 'MoveCollectionDialog');
    const { collections } = this.props.collectionsStore;
    this.collectionToMove = { id: collectionId, name, path };

    showSelectFromTreeDialog({
      title: localization.DIALOGS.MOVE_COLLECTION_DIALOG.TITLE(name),
      treeListItems: [collections.my] || [],
      onClick: this.handleToggleCollection,
      onLoadChildren: async (item) => await this.props.collectionsActions.getChildren(item._id),
      onClose: this.handleMoveDialogClose,
      textBtnCancel: localization.DIALOGS.MOVE_COLLECTION_DIALOG.CANCEL_TEXT,
      onOk: this.handleMoveDialogSubmit,
      textBtnOk: localization.DIALOGS.MOVE_COLLECTION_DIALOG.OK_TEXT,
      openedItems: [collections.my._id, ...this.state.openedCollections.my],
      collectionToMove: this.collectionToMove,
      type: 'move',
    });
  };

  handleOpenArchiveDialog = (collection) => {
    if (!picsioConfig.isMainApp()) return;
    archiveCollection(collection);
  };

  handleMoveDialogClose = () => (this.collectionToMove = undefined);

  handleMoveDialogSubmit = async (selectedCollections) => {
    if (selectedCollections && selectedCollections.length) {
      const storeCollections = this.props.collectionsStore.collections;
      const rootId = storeCollections.my._id;
      const { collectionToMove } = this;
      const targetCollectionId = selectedCollections[0];

      const collectionToMoveParent = getParent(storeCollections, 'my', {
        _id: collectionToMove.id,
      });
      const collectionTarget = findCollection(storeCollections, 'my', { _id: targetCollectionId });
      const collectionToMoveParentId = collectionToMoveParent && collectionToMoveParent._id;

      let oldPath;
      if (collectionToMoveParent) {
        oldPath = rootId === collectionToMoveParentId ? '/' : collectionToMove.path;
      } else {
        oldPath = collectionToMove.path;
      }
      const newPath =
        rootId === targetCollectionId ? '/' : `${collectionTarget.path + collectionTarget.name}/`;

      Logger.log('User', 'CollectionMove', collectionToMove.id);
      this.props.collectionsActions.moveCollection(
        collectionToMove.id,
        targetCollectionId,
        newPath,
        oldPath,
        collectionToMove.name
      );
      this.handleMoveDialogClose();
    } else {
      Toast(localization.TAGSTREE.textCollectionNotSelected);
    }
  };

  isSelectedAssetsRestricted = () => {
    const assets = store.getState().assets.items;
    const selectedAssets = assets.filter((asset) => this.props.selectedItems.includes(asset._id));
    return (
      utils.isSelectedAssetsRestricted(selectedAssets) &&
      this.props.rolePermissions.restrictedMoveOrDelete === false
    );
  };

  handleDownload = async (collectionId) => {
    if (!picsioConfig.isMainApp()) return;
    downloadCollection(collectionId, this.props.rolePermissions);
  };

  setSort = (sortType) => {
    this.props.userActions.updateUserSortType({ collectionType: 'collections', sortType });
  };

  handlers = {
    item: this.onClickItem,
    uploadClick: this.onClickUpload,
    arrow: this.props.collectionsActions.getChildren,
    getCurrentLevelCollections: this.getCurrentLevelCollections,
    rename: this.props.collectionsActions.renameCollection,
    add: this.props.collectionsActions.addCollection,
    remove: this.props.collectionsActions.removeCollection,
    public: this.public,
    favorite: this.props.collectionsActions.addToFavorites,
    inputUpload: this.onChangeUpload,
    drop: this.onDrop,
    dragover: this.onDragover,
    dragleave: this.onDragleave,
    openToggle: this.handleToggleOpenCollections,
    move: this.handleMoveDialogOpen,
    isRestricted: this.isSelectedAssetsRestricted,
    download: this.handleDownload,
    archive: this.handleOpenArchiveDialog,
    syncFolder: this.props.collectionsActions.syncFolder
  };

  toggleFavorites = (id) => {
    this.handleToggleOpenCollections('favorites', id);
  };

  toggleWebsites = (id) => {
    this.handleToggleOpenCollections('websites', id);
  };

  toggleMy = (id) => {
    this.handleToggleOpenCollections('my', id);
  };

  render() {
    if (this.props.openedTree !== 'collections') return null;
    const { props, state } = this;
    const {
      isLoaded,
      collections,
      search,
      activeCollection,
      notRecursiveSearch,
    } = this.props.collectionsStore;
    const { _id: activeCollectionID = null || props.searchQuery.tagId } = activeCollection || {};
    const collectionsForRender = search.collections !== null ? search.collections : collections;

    return (
      <div className="folderTreeView" style={{ width: props.panelWidth }}>
        <div
          className="treeResizer"
          onMouseDown={(event) => this.props.mainActions.resizePanel(event, 'left')}
        />
        {picsioConfig.isMainApp() && (
          <SearchBar
            applySearch={debounce(this.props.collectionsActions.applySearch, 300)}
            placeholder={localization.TAGSTREE.placeholderSearch}
            defaultValue={search.query}
            openedTree={this.props.openedTree}
            sortType={this.props.sortType}
            setSort={this.setSort}
          />
        )}
        <div className="listFolderTree">
          {(!isLoaded || search.isSearching) && <Spinner />}
          {collectionsForRender !== null && (
            <ul role="tree" aria-labelledby="collections">
              {/* Favorites */}
              {collectionsForRender.favorites?.nodes?.length > 0 && (
                  <Item
                    node={collectionsForRender.favorites}
                    handlers={this.handlers}
                    lvl={0}
                    activeCollectionID={activeCollectionID}
                    toggle={this.toggleFavorites}
                    openedCollections={state.openedCollections.favorites}
                    team={props.team}
                    subscriptionFeatures={props.subscriptionFeatures}
                    id="favorites"
                    rolePermissions={props.rolePermissions}
                    searchQuery={props.searchQuery}
                    rootCollectionId={props.rootCollectionId}
                  />
                )}
              {/* Websites */}
              {collectionsForRender.websites?.nodes?.length > 0 && (
                  <Item
                    node={collectionsForRender.websites}
                    handlers={this.handlers}
                    lvl={0}
                    activeCollectionID={activeCollectionID}
                    toggle={this.toggleWebsites}
                    openedCollections={state.openedCollections.websites}
                    team={props.team}
                    subscriptionFeatures={props.subscriptionFeatures}
                    id="websites"
                    rolePermissions={props.rolePermissions}
                    searchQuery={props.searchQuery}
                    rootCollectionId={props.rootCollectionId}
                  />
                )}
              {/* My collections */}
              {collectionsForRender.my && (
                <Item
                  node={collectionsForRender.my}
                  handlers={this.handlers}
                  lvl={0}
                  activeCollectionID={state.isTrashActive ? null : activeCollectionID}
                  toggle={this.toggleMy}
                  openedCollections={state.openedCollections.my}
                  team={props.team}
                  subscriptionFeatures={props.subscriptionFeatures}
                  id="my"
                  rolePermissions={props.rolePermissions}
                  searchQuery={props.searchQuery}
                  rootCollectionId={props.rootCollectionId}
                />
              )}
              {picsioConfig.isMainApp() && (
                <Trash isActive={state.isTrashActive} onClick={this.handleClickTrash} />
              )}
            </ul>
          )}
        </div>
        {picsioConfig.isMainApp() && (
          <div className="folderTreeCheckbox">
            <Checkbox
              label={localization.RECURSIVE_SEARCH.labelOnTreeDontShow}
              value={notRecursiveSearch}
              onChange={this.props.collectionsActions.recursiveSearchToggle}
              slide
            />
          </div>
        )}
      </div>
    );
  }
}

const defaultSortType = {
  type: 'name',
  order: 'asc',
};

const ConnectedTree = connect(
  (state) => ({
    searchQuery: state.router.location.query,
    collectionsStore: state.collections,
    openedTree: state.main.openedTree,
    panelWidth: state.main.panelsWidth.catalogView.left,
    selectedItems: state.assets.selectedItems,
    team: state.user.team,
    rolePermissions: (picsioConfig.isMainApp() && state.user.role.permissions) || {},
    subscriptionFeatures: (picsioConfig.isMainApp() && state.user.subscriptionFeatures) || {},
    sortType: state.user.collectionsSortType || defaultSortType,
    rootCollectionId: state.collections.collections.my._id,
  }),
  (dispatch) => ({
    collectionsActions: bindActionCreators(collectionsActions, dispatch),
    mainActions: bindActionCreators(mainActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
    assetsActions: bindActionCreators(assetsActions, dispatch),
    lightboardsActions: bindActionCreators(lightboardsActions, dispatch),
    notificationsActions: bindActionCreators(notificationsActions, dispatch),
    archiveActions: bindActionCreators(archiveActions, dispatch),
  })
)(Tree);

export default ConnectedTree;
