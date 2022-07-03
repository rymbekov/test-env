import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TreePlaceholder from '../../TreePlaceholder';
import TreePlaceholderError from '../../TreePlaceholderError';
import Spinner from '../../collectionsTree/views/Spinner';

import ua from '../../../ua';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import * as utils from '../../../shared/utils';

import * as savedSearchesActions from '../../../store/actions/savedSearches';
import * as mainActions from '../../../store/actions/main';
import * as userActions from '../../../store/actions/user';
import SearchBar from '../../SearchBar';
import Item from './Item';
import { setSearchRoute } from '../../../helpers/history';

class Tree extends React.Component {
  componentDidMount() {
    const { store } = this.props;
    if (store.tree === null && !store.isLoaded) this.props.savedSearchesActions.getSavedSearches();
  }

  componentDidUpdate(nextProps) {
    // reset search value
    if (this.props.openedTree === 'savedSearches' && this.props.openedTree !== nextProps.openedTree) {
      if (this.props.store.searchQuery) {
        this.props.savedSearchesActions.applySearch('');
      }
    }
  }

  renderTreeItems = () => {
    const { props } = this;
    const treeFavorites = props.store.tree ? props.store.tree.favorites : null;
    const treeSavedSearches = props.store.tree ? props.store.tree.savedSearches : null;

    return (
      <div className="listFolderTree">
        <ul role="tree" aria-labelledby="savedSearches">
          {treeFavorites.nodes.length > 0 && (
            <Item
              allSavedSearches={props.store.all}
              activeSavedSearch={props.activeSavedSearchId}
              node={treeFavorites}
              lvl={1}
              handlers={this.handlers}
              user={props.user}
              id="savedSearchesFavorites"
            />
          )}
          <Item
            allSavedSearches={props.store.all}
            activeSavedSearch={props.activeSavedSearchId}
            node={treeSavedSearches}
            lvl={1}
            handlers={this.handlers}
            user={props.user}
            id="savedSearches"
          />
        </ul>
      </div>
    );
  };

  renderTreePlaceholder = () => (
    <div className="listFolderTree">
      <div className="wrapperTree__placeholder">
        <TreePlaceholder
          buttonId="createSavedSearch"
          title={localization.SAVEDSEARCHESTREE.textSavedSearches}
          description={utils.sanitizeXSS(localization.SAVEDSEARCHESTREE.textPlaceholderText, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: ['br'],
          })}
          icon="placeholderSavedSearch"
          add={this.add}
          isActionsAllowed={false}
        />
      </div>
    </div>
  );

  handleItemClick = (id, data) => {
    if (this.alreadyClicked) return;
    Logger.log('User', 'SavedSearchesPanelSelectSS', id);
    this.alreadyClicked = true;
    setTimeout(() => {
      this.alreadyClicked = false;
    }, 100);

    setSearchRoute(data);
    // app does everything what is needed, and then we just set act state for saved search
    setTimeout(() => {
      this.props.savedSearchesActions.setActive(id);
    }, 100);

    if (ua.isMobileApp() || (ua.browser.isNotDesktop() && window.innerWidth < 1024)) {
      this.props.mainActions.setMobileMainScreenPanel('catalog');
    }
  };

  setSort = (sortType) => {
    this.props.userActions.updateUserSortType({ collectionType: 'searches', sortType });
  }

  handlers = {
    favorite: this.props.savedSearchesActions.favorite,
    remove: this.props.savedSearchesActions.remove,
    item: this.handleItemClick,
  };

  getSavedSearches = () => {
    Logger.log('User', 'GetSavedSearchesClick');
    this.props.savedSearchesActions.getSavedSearches();
  }

  render() {
    const { props } = this;
    const { store, openedTree } = props;
    if (openedTree !== 'savedSearches') return null;
    const { isLoading, isLoaded, error } = store;

    if (isLoading || (!isLoaded && error)) {
      return (
        <div className="folderTreeView" style={{ width: props.panelWidth }}>
          <div className="treeResizer" onMouseDown={(event) => this.props.mainActions.resizePanel(event, 'left')} />
          <Choose>
            <When condition={isLoading}>
              <div className="treeList listFolderTree">
                <Spinner />
              </div>
            </When>
            <Otherwise>
              <TreePlaceholderError
                buttonId="getSavedSearch"
                title={localization.SAVEDSEARCHESTREE.textSavedSearches}
                description="Failed to load saved searches. Click the button below to try again."
                icon="placeholderSavedSearch"
                handleClick={this.getSavedSearches}
                isBusy={!isLoaded && !error}
                buttonText="Load saved searches"
              />
            </Otherwise>
          </Choose>
        </div>
      );
    }

    if (!store?.tree) return null;
    const treeSavedSearches = props.store.tree ? props.store.tree.savedSearches : null;
    return (
      <div className="folderTreeView" style={{ width: props.panelWidth }}>
        <div className="treeResizer" onMouseDown={(event) => this.props.mainActions.resizePanel(event, 'left')} />
        <SearchBar
          applySearch={props.savedSearchesActions.applySearch}
          placeholder={localization.SAVEDSEARCHESTREE.placeholderSearch}
          defaultValue={props.store.searchQuery}
          openedTree={this.props.openedTree}
          sortType={this.props.sortType}
          setSort={this.setSort}
          hiddenSorts={['updatedAt']}
        />
        {treeSavedSearches && treeSavedSearches.nodes && treeSavedSearches.nodes.length >= 1
          ? this.renderTreeItems()
          : null}
        {treeSavedSearches && treeSavedSearches.nodes && treeSavedSearches.nodes.length < 1
          ? this.renderTreePlaceholder()
          : null}
      </div>
    );
  }
}

const defaultSortType = {
  type: 'createdAt',
  order: 'asc',
};

const ConnectedTree = connect(
  (store) => ({
    activeSavedSearchId: store.savedSearches.activeSavedSearch?._id || '',
    store: store.savedSearches,
    openedTree: store.main.openedTree,
    panelWidth: store.main.panelsWidth.catalogView.left,
    user: store.user,
    sortType: store.user.searchesSortType || defaultSortType,
  }),
  (dispatch) => ({
    savedSearchesActions: bindActionCreators(savedSearchesActions, dispatch),
    mainActions: bindActionCreators(mainActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
  }),
)(Tree);

export default ConnectedTree;
