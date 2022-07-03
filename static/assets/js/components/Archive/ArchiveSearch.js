import React from 'react';
import PropTypes from 'prop-types';
import localization from '../../shared/strings';
import SearchBar from '../SearchBar/SearchBar';

const ArchiveSearch = props => {
  const { searchCollections, query, sortType, setSort, openedTree, placeholder } = props;

  return (
    <SearchBar
      defaultValue={query}
      search={searchCollections}
      sortType={sortType}
      setSort={setSort}
      openedTree={openedTree}
      placeholder={placeholder}
    />
  );
}

ArchiveSearch.defaultProps = {
  query: '',
  openedTree: 'archive',
  placeholder: localization.TAGSTREE.placeholderSearch,
};
ArchiveSearch.propTypes = {
  query: PropTypes.string,
  searchCollections: PropTypes.func.isRequired,
  sortType: PropTypes.shape({
    type: PropTypes.string.isRequired,
    order: PropTypes.string.isRequired,
  }).isRequired,
  setSort: PropTypes.func.isRequired,
  openedTree: PropTypes.string,
  placeholder: PropTypes.string,
};

export default ArchiveSearch;

