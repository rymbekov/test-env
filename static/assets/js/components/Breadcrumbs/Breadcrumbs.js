import React from 'react';
/** Store */
import { Provider, connect } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import { bindActionCreators } from 'redux';
import picsioConfig from '../../../../../config';
import store from '../../store';
import WithSkeletonTheme from '../WithSkeletonTheme';

import ErrorBoundary from '../ErrorBoundary';

import { findCollection, getParent } from '../../store/helpers/collections';
import * as collectionsActions from '../../store/actions/collections';
import BreadcrumbsItem from './BreadcrumbsItem';
import { findCollectionsPathToId } from '../../store/actions/helpers/archive';
import { setSearchRoute, isRouteSearch } from '../../helpers/history';

const TYPES = {
  TAGS: 'tagId',
  LIGHTBOARDS: 'lightboardId',
  INBOXES: 'inboxId',
  KEYWORDS: 'keywords',
  ARCHIVE: 'archive',
};

class Breadcrumbs extends React.Component {
  state = {
    type: TYPES.TAGS,
    items: [],
  };

  componentDidMount() {
    this.handleRouteChange();
  }

  componentDidUpdate(prevProps) {
    if (isRouteSearch() && this.props.router.location !== prevProps.router.location) {
      this.handleRouteChange();
    }
    const { query: searchQuery } = this.props.router.location;
    const {
      archived, tagId, lightboardId, inboxId, keywords,
    } = searchQuery;

    if (keywords
      && tagId
      && this.props.keywordsMainTree.length > 0
      && prevProps.keywordsMainTree !== this.props.keywordsMainTree
    ) {
      this.handleRouteChange();
      return;
    }

    if (
      (tagId && !archived)
      && this.props.collectionsIsLoaded
      && (
        prevProps.collectionsMainTree.my.nodes !== this.props.collectionsMainTree.my.nodes
        || prevProps.collectionsMainTree.my.name !== this.props.collectionsMainTree.my.name
      )
    ) {
      // on Proofing we don't have tagId on load, so we need to get it from collections.my._id
      const collectionId = tagId || this.props.collectionsMainTree.my?._id;
      this.buildByCollections(collectionId, this.props.collectionsMainTree);
      return;
    }

    if (tagId && archived && prevProps.archive.collections !== this.props.archive.collections) {
      this.buildByArchive(tagId);
    }
  }

  handleRouteChange = async () => {
    const { query: searchQuery } = this.props.router.location;
    const {
      tagId, lightboardId, inboxId, keywords, archived,
    } = searchQuery;

    if (!this.rootCollectionID) {
      this.rootCollectionID = this.props.collectionsMainTree && this.props.collectionsMainTree.my._id;
    }

    if (tagId && tagId === this.rootCollectionID && keywords && Array.isArray(keywords)) {
      return this.buildByKeywords(this.props.keywordsMainTree, keywords[0]);
    }
    if (lightboardId) return this.buildByLightboards(lightboardId);
    if (inboxId) return this.buildByInboxes(inboxId);
    if (tagId && !archived) return this.buildByCollections(tagId, this.props.collectionsMainTree);
    if (tagId && archived) {
      return this.buildByArchive(tagId);
    }

    if (picsioConfig.isProofing()) {
      return this.buildByProofing();
    }
  };

  buildByProofing = () => {
    const rootId = this.props.collectionsMainTree?.my?._id;
    if (!this.rootCollectionID) {
      this.rootCollectionID = rootId;
    }
    this.buildByCollections(rootId, this.props.collectionsMainTree);
  }

  buildByArchive = (collectionId) => {
    const {
      archive: { collections },
    } = this.props;
    const { list } = findCollectionsPathToId(collections, collectionId);
    let items = list.map(({ _id, name }) => ({ _id, title: name }));
    if (!items.length) {
      items = [{
        _id: this.props.archive.collections[0]?._id,
        title: 'Archive',
      }];
    }
    this.setState({ type: TYPES.ARCHIVE, items });
  };

  buildByCollections = (currentCollectionId, collections) => {
    const list = [];
    let collection = findCollection(collections, 'my', { _id: currentCollectionId });
    if (collections && collections.my && !collection) {
      this.props.collectionsActions.getChildren(collections.my._id, { currentCollectionId });
      return;
    }
    while (collection) {
      list.unshift(collection);
      collection = getParent(collections, 'my', { _id: collection._id });
    }

    if (list.length > 0) {
      // name shouldn't be here, use path instead. API will stop pass name in future
      const items = list.map((item) => ({ title: item.name, _id: item._id }));
      this.setState({ type: TYPES.TAGS, items });
    }
  };

  buildByLightboards = (lightboardId) => {
    const lightboardTree = this.props.lightboards.lightboards;
    const lightboard = lightboardTree.find((lb) => lb._id === lightboardId);
    const items = [
      {
        _id: null,
        title: 'Lightboards',
      },
      {
        _id: lightboardId,
        title: lightboard.path.split('→').pop(),
      },
    ];
    this.setState({ items, type: TYPES.LIGHTBOARDS });
  };

  buildByInboxes = (inboxId) => {
    const inboxesTree = this.props.inboxes.inboxes;
    const inbox = inboxesTree.find((lb) => lb._id === inboxId);
    const items = [
      {
        _id: null,
        title: 'Inboxes',
      },
      {
        _id: inboxId,
        title: inbox.name,
      },
    ];
    this.setState({ items, type: TYPES.INBOXES });
  };

  buildByKeywords = (list, keywordID) => {
    const items = [
      { _id: null, title: 'Keywords' },
      ...this.getBreadcrumbsForKeywords(list, keywordID),
    ];
    this.setState({ items, type: TYPES.KEYWORDS });
  };

  /**
   * Find chain for breadcrumbs
   * @param {Object[]} list
   * @param {string} id
   * @returns {Array} - chain
   */
  getBreadcrumbsForKeywords = (list, id) => {
    const result = [];
    let finded = false;
    function handle(items) {
      for (let i = 0; i < items.length; i++) {
        if (finded) break;

        const item = items[i];
        result.push({ _id: item._id, title: item.path.split('→').pop() });

        /** Finish */
        if (item._id === id) {
          finded = true;
          break;
        }

        if (item.nodes && item.nodes.length > 0) handle(item.nodes);

        if (!finded) result.pop();
      }
    }

    handle(list);
    return result;
  };

  /**
   * Click on item
   * @param {string} id
   */
  handleItemClick = (id) => {
    if (!id) return;
    const { type } = this.state;

    switch (type) {
    case TYPES.TAGS:
    case TYPES.LIGHTBOARDS:
      setSearchRoute({ [type]: id });
      break;

    case TYPES.KEYWORDS:
      setSearchRoute({ tagId: this.rootCollectionID, [type]: id });
      break;

    case TYPES.ARCHIVE:
      setSearchRoute({ tagId: id, archived: true });
      break;

    default:
      break;
    }
  };

  render() {
    const { state } = this;
    return (
      <div className="breadCrumbs" data-testid="breadcrumbs">
        <Choose>
          <When condition={state.items.length > 0}>
            <ul>
              {state.items.map((item) => (
                <BreadcrumbsItem key={item._id} onClick={this.handleItemClick} {...item} />
              ))}
            </ul>
          </When>
          <Otherwise>
            <WithSkeletonTheme>
              <ul>
                <li><span><Skeleton width={98} /></span></li>
                <li><span><Skeleton width={70} /></span></li>
              </ul>
            </WithSkeletonTheme>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

const ConnectedBreadCrumbs = connect(
  (state) => ({
    router: state.router,
    keywordsMainTree: state.keywords.tree ? state.keywords.tree.keywords.nodes : [],
    collectionsMainTree: state.collections.collections,
    collectionsIsLoaded: state.collections.isLoaded,
    lightboards: state.lightboards,
    inboxes: state.inboxes,
    archive: state.archive,
  }),
  (dispatch) => ({ collectionsActions: bindActionCreators(collectionsActions, dispatch) }),
)(Breadcrumbs);

export default () => (
  <Provider store={store}>
    <ConnectedBreadCrumbs />
  </Provider>
);
