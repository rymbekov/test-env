import React from 'react';
import {
  bool, string, object, func, array,
} from 'prop-types';

import cn from 'classnames';
import { CSSTransition } from 'react-transition-group';

/** Store */
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DropdownTree from '../../DropdownTree';
import localization from '../../../shared/strings';
import DropdownTreeOpener from '../../DropdownTreeOpener';
import Logger from '../../../services/Logger';
import store from '../../../store';
import * as collectionsActions from '../../../store/actions/collections';
import * as assetsActions from '../../../store/actions/assets';

import { findCollection, getParent } from '../../../store/helpers/collections';
import Collections from './Collections';

class CollectionsComponent extends React.Component {
  rootId = this.props.collectionsStore && this.props.collectionsStore.collections.my._id;

  state = {
    isDropdownTreeOpened: false,
    collections: [],
    attachedCollections: [],
    openedItems: [this.rootId],
  };

  fetchingCollectionsIds = [];

  static getDerivedStateFromProps(props, state) {
    if (props.collections !== state.collections) {
      return {
        collections: props.collections,
        attachedCollections: props.collections.map((item) => item._id),
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const { isDropdownTreeOpened } = this.state;
    const { selectedAssets, collectionsStore } = this.props;
    // after ran getChildren we need rerun findOpenedCollectionsIds()
    /** Only if dropdown opened */
    if (isDropdownTreeOpened
      && (prevProps.selectedAssets !== selectedAssets
        || collectionsStore.collections !== prevProps.collectionsStore.collections
      )
    ) {
      this.findOpenedCollectionsIds();
    }
  }

  findOpenedCollectionsIds = () => {
    const storeCollections = this.props.collectionsStore.collections;

    // Find parents collections Ids
    const parentsIds = [];
    this.props.collections.forEach((collection) => {
      let foundCollection = findCollection(storeCollections, 'my', { _id: collection._id });
      if (!foundCollection && !this.fetchingCollectionsIds.includes(collection._id)) {
        // we pushing ids to this.fetchingCollectionsIds for fetching once
        // if we don't do it, this function loops in componentDidUpdate
        this.fetchingCollectionsIds.push(collection._id);
        this.props.collectionsActions.getChildren(this.rootId, { currentCollectionId: collection._id });
      } else if (foundCollection) {
        const index = this.fetchingCollectionsIds.findIndex((id) => id === collection._id);
        if (index > -1) {
          // if we found collection, we remove collection id from fetching queue
          this.fetchingCollectionsIds.splice(index, 1);
        }
        while (foundCollection) {
          foundCollection = getParent(storeCollections, 'my', { _id: foundCollection._id });
          if (foundCollection) {
            parentsIds.push(foundCollection._id);
          }
        }
      }
    });

    this.setState({ openedItems: parentsIds });
  };

  removeCollection = (collection) => {
    Logger.log('User', 'InfoPanelRemoveCollection');
    this.props.remove(collection, this.props.selectedAssets, true);
  };

  toggleDropdownTree = (isOpened) => {
    if (isOpened) {
      this.findOpenedCollectionsIds();
    }

    this.setState({ isDropdownTreeOpened: !this.state.isDropdownTreeOpened });
  };

  handleToggleCollection = (collection) => {
    const clonnedCollection = { ...collection };
    clonnedCollection.path = (clonnedCollection.path + clonnedCollection.name).substring(1);
    if (!this.state.attachedCollections.includes(clonnedCollection._id)) {
      Logger.log('User', 'InfoPanelAddCollection', { collectionId: collection._id });

      this.props.assetsActions.addToCollection({
        collectionID: clonnedCollection._id,
        collectionPath: clonnedCollection.path,
        assetIDs: this.props.selectedAssets,
        withoutAlertDialog: true,
      });
    } else {
      this.removeCollection(clonnedCollection);
    }
  };

  render() {
    const { props, state } = this;
    const {
      collections,
      selectedAssets,
      remove,
      highlight,
      highlightAnimationReset,
      userRole,
      collectionsActions,
      collectionsStore,
      disabled,
      editingDisabled,
      isMainApp,
      detailsPanelVisibility,
      isArchived,
      openedTree,
      changeTree,
    } = props;
    const isDisabled = disabled || editingDisabled;
    const isVisible = detailsPanelVisibility[props.blockName];
    return (
      <div
        data-qa="details-component-collections"
        className={cn('detailsPanel__item', {
          act: isVisible,
        })}
      >
        <div className="detailsPanel__title">
          <span
            className="detailsPanel__title_text"
            onClick={() => props.toggleVisibility(props.blockName)}
          >
            {props.blockTitle}
          </span>
        </div>
        <CSSTransition in={isVisible} timeout={300} classNames="fade">
          <>
            <If condition={isVisible}>
              <Collections
                collections={collections}
                selectedAssets={selectedAssets}
                remove={remove}
                highlight={highlight}
                highlightAnimationReset={highlightAnimationReset}
                disabled={isDisabled}
                userRole={userRole}
                isArchived={isArchived}
                openedTree={openedTree}
                changeTree={changeTree}
              />
            </If>
          </>
        </CSSTransition>

        <If condition={isMainApp && !isDisabled}>
          <DropdownTreeOpener
            hideOnClickOutside={false}
            tooltip={localization.OPEN_COLLECTIONS_DIALOG}
            toggleDropdownTree={this.toggleDropdownTree}
          >
            <DropdownTree
              checkedItems={state.attachedCollections}
              openedItems={state.openedItems}
              treeListItems={[collectionsStore.collections.my]}
              onClick={this.handleToggleCollection}
              onLoadChildren={(item) => collectionsActions.getChildren(item._id)}
              iconSpecial="folder"
              disableRoot
              type="attach"
            />
          </DropdownTreeOpener>
        </If>
      </div>
    );
  }
}

CollectionsComponent.propTypes = {
  disabled: bool,
  toggleVisibility: func,
  detailsPanelVisibility: object,
  blockName: string,
  blockTitle: string,
  isMainApp: bool,
  collections: array,
  selectedAssets: array,
  remove: func,
  highlight: array,
  highlightAnimationReset: func,
  openedTree: string,
  changeTree: func,
  userRole: string,
};

const ConnectedCollections = connect(
  (store) => ({
    collectionsStore: store.collections,
    userRole: store.user.role,
  }),
  (dispatch) => ({
    assetsActions: bindActionCreators(assetsActions, dispatch),
    collectionsActions: bindActionCreators(collectionsActions, dispatch),
  }),
)(CollectionsComponent);

export default (props) => (
  <Provider store={store}>
    <ConnectedCollections {...props} />
  </Provider>
);
