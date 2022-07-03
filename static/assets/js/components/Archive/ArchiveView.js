import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from '../../UIComponents';
import localization from '../../shared/strings';

import ArchiveSearch from './ArchiveSearch';
import ArchiveTree from './ArchiveTree';
import propTypes from './propTypes';

import Spinner from '../collectionsTree/views/Spinner';

const ArchiveView = (props) => {
  const {
    user,
    activeCollectionId,
    loading,
    collections,
    search,
    sortType,
    added,
    deleted,
    fetchMoreCollections,
    unarchiveCollection,
    downloadCollection,
    deleteCollection,
    searchCollections,
    setSort,
    panelWidth,
    resizePanelWidth,
    recursiveSearch,
    toggleRecursiveSearch,
  } = props;
  const { loading: searching, query } = search;
  const activeCollections = query ? search.collections : collections;

  return (
    <div className="tree archiveView">
      <div style={{ width: panelWidth }} className="folderTreeView">
        <div className="treeResizer" onMouseDown={resizePanelWidth} role="presentation" />
        <If condition={loading || searching}>
          <Spinner />
        </If>
        <ArchiveSearch
          query={query}
          searchCollections={searchCollections}
          sortType={sortType}
          setSort={setSort}
        />
        <div className="listFolderTree">
          <ArchiveTree
            loading={loading}
            user={user}
            collections={activeCollections}
            activeCollectionId={activeCollectionId}
            added={added}
            deleted={deleted}
            fetchMoreCollections={fetchMoreCollections}
            unarchiveCollection={unarchiveCollection}
            downloadCollection={downloadCollection}
            deleteCollection={deleteCollection}
          />
        </div>
        <div className="folderTreeCheckbox">
          <Checkbox
            value={recursiveSearch}
            onChange={toggleRecursiveSearch}
            label={localization.RECURSIVE_SEARCH.labelOnTreeDontShow}
            slide
          />
        </div>
      </div>
    </div>
  );
};

ArchiveView.defaultProps = {
  collections: [],
  activeCollectionId: null,
  added: [],
  deleted: [],
};
ArchiveView.propTypes = {
  user: PropTypes.shape(propTypes.user).isRequired,
  activeCollectionId: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  collections: PropTypes.arrayOf(PropTypes.shape(propTypes.collection)),
  search: PropTypes.shape(propTypes.search).isRequired,
  sortType: PropTypes.shape(propTypes.sortType).isRequired,
  added: PropTypes.arrayOf(PropTypes.string),
  deleted: PropTypes.arrayOf(PropTypes.string),
  fetchMoreCollections: PropTypes.func.isRequired,
  unarchiveCollection: PropTypes.func.isRequired,
  downloadCollection: PropTypes.func.isRequired,
  deleteCollection: PropTypes.func.isRequired,
  searchCollections: PropTypes.func.isRequired,
  setSort: PropTypes.func.isRequired,
  panelWidth: PropTypes.number.isRequired,
  resizePanelWidth: PropTypes.func.isRequired,
  recursiveSearch: PropTypes.bool.isRequired,
  toggleRecursiveSearch: PropTypes.func.isRequired,
};

export default ArchiveView;
