import React from 'react';
import { object } from 'prop-types';
import {
  Tooltip, Input, IconButton, InputAdornment, Icon,
} from '@picsio/ui';
import { ArrowDownSimple, ArrowUpSimple, Search } from '@picsio/ui/dist/icons';
import * as utils from '../../../../shared/utils';
import SearchOptions from './SearchOptions';

const OPTIONS_NAME_IN_LOCAL_STORAGE = 'pdfViewerSearchOptions';
const OPTIONS = utils.LocalStorage.get(OPTIONS_NAME_IN_LOCAL_STORAGE) || {
  phraseSearch: false,
  caseSensitive: false,
  entireWord: false,
  highlightAll: true,
};

class SearchBar extends React.Component {
  state = {
    query: '',
    prevQuery: '',
    matchesCount: {
      current: 0,
      total: 0,
    },
    options: OPTIONS,
  };

  componentDidMount() {
    const { eventBus } = this.props;
    eventBus.on('updatefindmatchescount', this.handleUpdateMatches);
    eventBus.on('updatefindcontrolstate', this.handleUpdateMatches);
  }

  componentWillUnmount() {
    const { eventBus } = this.props;
    eventBus.off('updatefindmatchescount', this.handleUpdateMatches);
    eventBus.off('updatefindcontrolstate', this.handleUpdateMatches);
  }

  handleUpdateMatches = ({ matchesCount }) => {
    this.setState({ matchesCount });
  };

  handleInputChange = (evt) => {
    const { value } = evt.target;
    this.setState({ query: value });
  };

  setOptions = (newOptions) => {
    this.setState({ options: newOptions, prevQuery: '' }, () => {
      if (this.state.query) this.search();
    });
    utils.LocalStorage.set(OPTIONS_NAME_IN_LOCAL_STORAGE, newOptions);
  };

  search = () => {
    const { query, prevQuery, options } = this.state;

    if (query === prevQuery) {
      this.nextMatch();
      return;
    }

    this.setState({ prevQuery: query });
    this.props.controller.executeCommand('find', {
      ...options,
      query,
      findPrevious: false,
    });
  };

  nextMatch = () => {
    const { query, options } = this.state;
    this.props.controller.executeCommand('findagain', {
      ...options,
      query,
      findPrevious: false,
    });
  };

  prevMatch = () => {
    const { query, options } = this.state;
    this.props.controller.executeCommand('findagain', {
      ...options,
      query,
      findPrevious: true,
    });
  };

  handleKeydown = (e) => {
    const { query, prevQuery } = this.state;
    if (e.key === 'Enter' || e.keyCode === 13) {
      /** Search */
      if (query !== prevQuery) return this.search();
      /** If the same query AND Shift+Enter -> find PREVIOUS */
      if (e.shiftKey) return this.prevMatch();
      /** If the same query AND Enter -> find NEXT */
      return this.nextMatch();
    }
    return false;
  };

  render() {
    const { state, handleKeydown } = this;
    return (
      <div className="pdfViewerControlsPart">
        <Input
          value={state.query}
          id="pdfSearch"
          type="text"
          placeholder="Search in pdf"
          onChange={this.handleInputChange}
          onKeyDown={handleKeydown}
          startAdornment={(
            <InputAdornment>
              <Icon>
                <Search />
              </Icon>
            </InputAdornment>
          )}
          endAdornment={(
            <InputAdornment>
              <If condition={state.matchesCount.total > 0}>
                <span className="pdfMatchesCount">
                  {state.matchesCount.current} / {state.matchesCount.total}
                </span>
              </If>
              <SearchOptions options={state.options} setOptions={this.setOptions} />
            </InputAdornment>
          )}
        />
        <div>
          <Tooltip content="Next match">
            <IconButton onClick={this.nextMatch} disabled={state.query === ''}>
              <ArrowDownSimple />
            </IconButton>
          </Tooltip>
          <Tooltip content="Previous match">
            <IconButton onClick={this.prevMatch} disabled={state.query === ''}>
              <ArrowUpSimple />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  }
}

SearchBar.propTypes = {
  // eslint-disable-next-line
  eventBus: object.isRequired, // pdf.js eventBus
  // eslint-disable-next-line
  controller: object.isRequired, // pdf.js findController
};

export default SearchBar;
