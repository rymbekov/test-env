import React from 'react';
import PropTypes from 'prop-types';
import _debounce from 'lodash/debounce';

import { Search, Close } from '@picsio/ui/dist/icons';
import { Icon } from '@picsio/ui';
import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';

import { Input } from '../../UIComponents';

import SearchBarSort from './SearchBarSort';

class SearchBar extends React.Component {
  state = {
    value: '',
  };

  static getDerivedStateFromProps(newProps, state) {
    if (newProps.defaultValue !== state.oldDefaultValue) {
      return {
        ...state,
        value: newProps.defaultValue,
        oldDefaultValue: newProps.defaultValue,
      };
    }

    return null;
  }

  debounceSearch = _debounce((action, searchValue) => {
    action(searchValue);
  }, 300);


  handleKeyDown = e => {
    const keyEsc = 27;

    if (e.keyCode === keyEsc) this.handleResetSearch();
  };

  handleChange = e => {
    const { value } = e.currentTarget;

    this.setState({ value });
    this.search(value);
  };

  search = (value) => {
    const { applySearch, search } = this.props;

    if (applySearch) {
      applySearch(value);
    }
    if (search) {
      this.debounceSearch(search, value);
    }
  }

  handleResetSearch = () => {
    this.setState({
      value: '',
    });
    this.search('');
  };

  // uses only for Logger
  handleFocus = () => {
    if (this.props.openedTree) {
      const treeName = utils.capitalizeFirstLetter(this.props.openedTree);
      Logger.log('User', `${treeName}PanelSearch`);
    }
  };

  render() {
    const { value } = this.state;
    const { placeholder, autoFocus, sortType, setSort, sortItems, hiddenSorts } = this.props;

    return (
      <div className="searchBar">
        <div className="searchBar-content">
          <Icon size="xl" color="inherit" className="icon-search">
            <Search />
          </Icon>
          <Input
            isDefault
            type="text"
            name="search"
            placeholder={placeholder || ''}
            value={value}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            autoComplete="off"
            autoFocus={ autoFocus}
          />
          <If condition={value.length}>
            <div className="searchBar-reset" onClick={this.handleResetSearch} role="presentation">
              <Icon size="xl" color="inherit" className="icon-search">
                <Close />
              </Icon>
            </div>
          </If>
          <If condition={sortType && !value.length}>
            <SearchBarSort activeSort={sortType} onSort={setSort} sortItems={sortItems} hiddenSorts={hiddenSorts} />
          </If>
        </div>
      </div>
    );
  }
}

SearchBar.defaultProps = {
  applySearch: null,
  search: null,
  placeholder: '',
  openedTree: '',
  autoFocus: false,
  sortType: null,
  setSort: null,
  sortItems: undefined,
  hiddenSorts: [],
};
SearchBar.propTypes = {
  applySearch: PropTypes.func,
  search: PropTypes.func,
  placeholder: PropTypes.string,
  openedTree: PropTypes.string,
  autoFocus: PropTypes.bool,
  sortType: PropTypes.shape({
    type: PropTypes.string,
    order: PropTypes.string,
  }),
  setSort: PropTypes.func,
  sortItems: PropTypes.arrayOf(PropTypes.object),
  hiddenSorts: PropTypes.arrayOf(PropTypes.string),
};

export default SearchBar;
