import React from 'react';
import PropTypes from 'prop-types';
import localization from '../../shared/strings';
import SearchBar from '../SearchBar/SearchBar';

const KeywordsTreeSearch = (props) => {
  const {
    handleSearch, query, sortType, setSort, openedTree, placeholder, sortItems,
  } = props;

  return (
    <SearchBar
      defaultValue={query}
      search={handleSearch}
      sortType={sortType}
      setSort={setSort}
      openedTree={openedTree}
      placeholder={placeholder}
      sortItems={sortItems}
    />
  );
};

KeywordsTreeSearch.defaultProps = {
  query: '',
  openedTree: 'keywords',
  placeholder: localization.KEYWORDSTREE.inputPlaceholderSearch,
  sortItems: undefined,
};
KeywordsTreeSearch.propTypes = {
  query: PropTypes.string,
  handleSearch: PropTypes.func.isRequired,
  sortType: PropTypes.shape({
    type: PropTypes.string.isRequired,
    order: PropTypes.string.isRequired,
  }).isRequired,
  setSort: PropTypes.func.isRequired,
  openedTree: PropTypes.string,
  placeholder: PropTypes.string,
  sortItems: PropTypes.arrayOf(PropTypes.object),
};

export default KeywordsTreeSearch;
