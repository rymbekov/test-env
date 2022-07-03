import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import _debounce from 'lodash/debounce';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Logger from '../../../services/Logger';
import * as Api from '../../../api/assets';
import * as savedSearchActions from '../../../store/actions/savedSearches';
import * as UtilsCollections from '../../../store/utils/collections';

import * as utils from '../../../shared/utils';
import { setSearchRoute } from '../../../helpers/history';
import SuggestionsContainer from './SuggestionsContainer';
import SuggestionsTitle from './SuggestionsTitle';
import Suggestion from './Suggestion';
import {
  lightboardSelector,
  inboxSelector,
  userIdSelector,
} from '../../../store/selectors/autocomplete';
import { activeCollectionSelector } from '../../../store/selectors/collections';
import './Autocomplete.scss';

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = (suggestion) => suggestion.value || suggestion.name || suggestion.path;

const getSectionSuggestions = (section) => section?.items;

const suggestTitles = {
  savedSearches: 'Saved Searches',
  recentlyUpdated: 'Recently Updated',
  recentSearches: 'Recent Searches',
  keywords: 'Keywords',
  collections: 'Collections',
  name: 'Name',
};

const normalizeRequest = (data) => Object.keys(data).reduce((acc, item) => {
  if (item) {
    let { items } = data[item];
    if (item === 'collections') {
      items = items.map((i) => {
        if (i.path.startsWith('/root/')) {
          return {
            ...i,
            path: i.path.replace('/root/', ''),
          };
        }
        return i;
      });
    }
    acc.push({
      title: suggestTitles[item],
      items,
    });
  }
  return acc;
}, []);

class Autocomplete extends React.Component {
  constructor() {
    super();

    // const testSuggestionsData = [{"title":"Recent Searches","items":[{"_id":"60f02ab830cc3d3c6befa81c","value":"name:13.jpg","name":"name:13.jpg","type":"recentSearch","result":64},{"_id":"60f02b0f30cc3d3c6befac67","value":"name:12.jpg","name":"name:12.jpg","type":"recentSearch","result":72},{"_id":"60f04d4630cc3d3c6bf11fa5","value":"name:15.jpg","name":"name:15.jpg","type":"recentSearch","result":71},{"_id":"60f04de730cc3d3c6bf12785","value":"name:11.jpg","name":"name:11.jpg","type":"recentSearch","result":64},{"_id":"60f055a530cc3d3c6bf18195","value":"name:12.jpg 15.jpg /root/Website/Website %2F sub-collection2/Sub-sub%2Fsome1 /root/Website/Website %2F sub-collection2/Sub-sub%2Fsome1","name":"name:12.jpg 15.jpg /root/Website/Website %2F sub-collection2/Sub-sub%2Fsome1 /root/Website/Website %2F sub-collection2/Sub-sub%2Fsome1","type":"recentSearch","result":101}]},{"title":"Collections","items":[{"_id":"6044cc3e411912de755268e2","path":"/root/A-1","value":"tags.path: \"/root/A-1\"","type":"collection"},{"_id":"605a1c6102d81f2450b4d83d","path":"/root/asset1","value":"tags.path: \"/root/asset1\"","type":"collection"},{"_id":"6065e2c8250736cce3c4f104","path":"/root/Collection with sub/SubCollection/2SubSollection-1","value":"tags.path: \"/root/Collection with sub/SubCollection/2SubSollection-1\"","type":"collection"},{"_id":"6065ee9f250736cce3c4f114","path":"/root/2019 year when codid-19 started, fucking","value":"tags.path: \"/root/2019 year when codid-19 started, fucking\"","type":"collection"},{"_id":"606c0886eae47822310de75c","path":"/root/videos/1elem","value":"tags.path: \"/root/videos/1elem\"","type":"collection"}]},{"title":"Keywords","items":[{"_id":"60b6326591f4e2a751b4421e","path":"→1","name":"1","text":"keyword is →1","value":"keywords._id:\"60b6326591f4e2a751b4421e\"","type":"keyword"},{"_id":"60a3da94c081222b6a4d936c","path":"→FOLDER 1","name":"FOLDER 1","text":"keyword is →FOLDER 1","value":"keywords._id:\"60a3da94c081222b6a4d936c\"","type":"keyword"},{"_id":"60a3da94c081222b6a4d936d","path":"→FOLDER 1→Cats","name":"Cats","text":"keyword is →FOLDER 1→Cats","value":"keywords._id:\"60a3da94c081222b6a4d936d\"","type":"keyword"},{"_id":"60b0a1f2e3414b2d0cac3cc8","path":"→FOLDER 1→Cats→SubCat","name":"SubCat","text":"keyword is →FOLDER 1→Cats→SubCat","value":"keywords._id:\"60b0a1f2e3414b2d0cac3cc8\"","type":"keyword"},{"_id":"60a3da94c081222b6a4d936e","path":"→FOLDER 1→Doggg","name":"Doggg","text":"keyword is →FOLDER 1→Doggg","value":"keywords._id:\"60a3da94c081222b6a4d936e\"","type":"keyword"}]},{"title":"Saved Searches","items":[{"_id":"6042043dbc02e27918e5770d","data":{"text":"assignees.assigneeId: 6042043dbc02e27918e57709"},"name":"Assigned to me","value":"assignees.assigneeId: 6042043dbc02e27918e57709","type":"savedSearch"}]},{"title":"Recently Updated","items":[{"_id":"6044d0db411912de75526936","name":"07.jpg","value":"_id:6044d0db411912de75526936","type":"asset"},{"_id":"6044d0e1411912de7552693a","name":"changed flag.jpg","value":"_id:6044d0e1411912de7552693a","type":"asset"},{"_id":"6044d184411912de75526940","name":"EUEG6BRWAAAxZh8.jpeg","value":"_id:6044d184411912de75526940","type":"asset"},{"_id":"6044d184411912de75526941","name":"EUEG6qxXQAI53P9.jpeg","value":"_id:6044d184411912de75526941","type":"asset"},{"_id":"6044d185411912de75526942","name":"EUEG6UBWoAMRc9i.jpeg","value":"_id:6044d185411912de75526942","type":"asset"}]}];

    this.state = {
      value: '',
      savedValue: '',
      suggestions: [], // or use testSuggestionsData for sample
      highlightedSuggestion: null,
      isLoading: false,
      suggestionPlaceholder: '',
    };

    this.debouncedLoadSuggestions = _debounce(this.loadSuggestions, 250);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.searchValue && nextProps.searchValue !== prevState.searchValue) {
      return {
        value: nextProps.searchValue,
        searchValue: nextProps.searchValue,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const { searchValue } = this.props;
    // if (!searchValue && searchValue !== prevProps.searchValue) {
    if (!searchValue && prevProps.searchValue) {
      this.resetValues();
    }
  }

  savePreviousValue = (event) => {
    const { savedValue } = this.state;
    const { target } = event;
    event.preventDefault();
    const inputValue = target.value.trim();
    const newValue = savedValue + inputValue.replace(savedValue, '');
    this.setState({
      value: ' ',
      savedValue: newValue,
    });
  };

  resetValues = () => {
    this.setState({
      value: '',
      savedValue: '',
      suggestions: [],
    });
  };

  onChange = (event, { newValue, method }) => {
    const { savedValue } = this.state;
    if (newValue === '') {
      this.resetValues();
      // If user changed value by arrows up/down
    } else if ((method === 'up' || method === 'down') && savedValue !== '') {
      const changedValue = newValue.replace(savedValue, '').trim();
      this.setState({
        value: ` ${changedValue}`,
      });
      // If user has already deleted new value and started deleted previos savedValue
    } else if (savedValue === newValue) {
      this.setState({
        value: newValue,
        savedValue: '',
      });
    } else {
      const changedValue = newValue.replace(savedValue, '');
      this.setState({
        value: changedValue,
      });
    }
  };

  onKeyPress = (event) => {
    const { highlightedSuggestion } = this.state;
    const { charCode } = event;

    // Enter
    if (charCode === 13) {
      this.submitValues();
    }

    // Space
    if (charCode === 32) {
      Logger.log('User', 'AutocompleteKeySpace');
      if (highlightedSuggestion) {
        this.savePreviousValue(event);
      }
    }
  };

  // Handle tab
  onKeyDown = (event) => {
    const { key } = event;
    const { highlightedSuggestion } = this.state;
    if (key === 'Tab' && highlightedSuggestion) {
      Logger.log('User', 'AutocompleteKeyTab');
      this.savePreviousValue(event);
    }
  };

  onSuggestionsFetchRequested = ({ value: inputValue, reason }) => {
    const { savedValue } = this.state;
    const newValue = inputValue.replace(savedValue, '').trim();
    this.debouncedLoadSuggestions(newValue);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  shouldRenderSuggestions = (inputValue, reason) => {
    const { isLoading, suggestionPlaceholder } = this.state;
    if (reason === 'input-blurred' && (isLoading || suggestionPlaceholder)) {
      this.setState({ isLoading: false, suggestionPlaceholder: '' });
    }
    return inputValue.trim().length >= 0;
  };

  getFinalValue = (normalizedSuggestionValue) => {
    const { savedValue, value } = this.state;
    const actualValue = normalizedSuggestionValue || value;
    const finalValue = `${savedValue}${actualValue}`;
    this.setState({
      value: finalValue,
      savedValue: '',
      suggestionPlaceholder: '',
    });
    return finalValue;
  }

  submitValues = (suggestionValue) => {
    const { savedValue } = this.state;

    let normalizedSuggestionValue = suggestionValue;
    if (normalizedSuggestionValue) {
      normalizedSuggestionValue = savedValue
        ? ` ${normalizedSuggestionValue}`
        : normalizedSuggestionValue;
    }
    const finalValue = this.getFinalValue(normalizedSuggestionValue);
    this.props.handleSubmit(finalValue);
  };

  // pass input value to Search component
  onBlur = () => {
    const { handleChange } = this.props;
    const finalValue = this.getFinalValue();
    handleChange(finalValue);
  }

  onSuggestionHighlighted = ({ suggestion }) => {
    const { highlightedSuggestion } = this.state;
    if (highlightedSuggestion?._id !== suggestion?._id) {
      this.setState({ highlightedSuggestion: suggestion });
    }
  };

  onSuggestionSelected = (
    event,
    {
      suggestion, suggestionValue, suggestionIndex, sectionIndex, method,
    },
  ) => {
    Logger.log('User', 'AutocompleteSuggestionSelected', { type: suggestion.type });

    if (suggestion.type === 'savedSearch' && suggestion.data) {
      const rootId = UtilsCollections.getRootId();
      setSearchRoute({ ...suggestion.data, tagId: rootId, collectionId: rootId });
      setTimeout(() => {
        this.props.savedSearchActions.setActive(suggestion._id);
      }, 100);
      return;
    }
    this.submitValues(suggestionValue.trim());
  };

  async loadSuggestions(inputValue) {
    let onlySuggestions = null;
    const { isLoading } = this.state;
    const {
      userId, collection, lightboard, inbox,
    } = this.props;

    if (inputValue.length === 0) {
      if (!isLoading) {
        this.setState({
          isLoading: true,
        });
      }
      onlySuggestions = ['recentSearches', 'recentlyUpdated'];
    }

    try {
      const data = {
        userId,
        text: inputValue,
      };

      if (onlySuggestions) {
        data.onlySuggestions = onlySuggestions;
      }

      if (collection) {
        const path = collection.path === 'root' ? '/root' : `/root${collection.path}${collection.name}`;
        data.collection = {
          path,
          _id: collection._id,
        };
      }
      if (lightboard) {
        data.lightboard = {
          _id: lightboard._id,
        };
      }
      if (inbox) {
        data.inbox = {
          _id: inbox._id,
        };
      }

      const result = await Api.getSuggest(data);
      const normalizedResult = normalizeRequest(result);
      this.setState({
        isLoading: false,
        suggestions: normalizedResult,
        suggestionPlaceholder: normalizedResult.length === 0 ? 'Start typing to search' : '',
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      if (errorStatus === 429) return;

      Logger.error(new Error('Get suggestions failed'), { error }, [
        'GetSuggestionsFailed',
        (error && error.msg) || 'NoMessage',
      ]);
      this.setState({
        isLoading: false,
        suggestionPlaceholder: '',
      });
    }
  }

  render() {
    const { placeholder } = this.props;
    const {
      value, savedValue, suggestions, isLoading, suggestionPlaceholder,
    } = this.state;
    const inputProps = {
      placeholder,
      value: `${savedValue}${value}`,
      onChange: this.onChange,
      onKeyPress: this.onKeyPress,
      onKeyDown: this.onKeyDown,
      onBlur: this.onBlur,
    };

    return (
      <Autosuggest
        multiSection
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionHighlighted={this.onSuggestionHighlighted}
        onSuggestionSelected={this.onSuggestionSelected}
        getSuggestionValue={getSuggestionValue}
        getSectionSuggestions={getSectionSuggestions}
        renderSectionTitle={SuggestionsTitle}
        renderSuggestion={(...args) => Suggestion(...args, savedValue)}
        renderSuggestionsContainer={
          (...args) => SuggestionsContainer(...args, isLoading, suggestionPlaceholder)
        }
        inputProps={inputProps}
        shouldRenderSuggestions={this.shouldRenderSuggestions}
        // alwaysRenderSuggestions={true} // uncomment to test with testSuggestions
      />
    );
  }
}

Autocomplete.defaultProps = {
  placeholder: '',
  searchValue: '',
  collection: null,
  lightboard: null,
  inbox: null,
};

Autocomplete.propTypes = {
  placeholder: PropTypes.string,
  searchValue: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  savedSearchActions: PropTypes.shape({
    setActive: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  collection: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  }),
  lightboard: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
  inbox: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
};

const ConnectedAutocomplete = connect(
  (state) => {
    const isArchive = state.main.openedTree === 'archive' && state.archive.activeCollectionId;
    return {
      collection: activeCollectionSelector(state, isArchive),
      lightboard: lightboardSelector(state),
      inbox: inboxSelector(state),
      userId: userIdSelector(state),
    };
  },
  (dispatch) => ({
    savedSearchActions: bindActionCreators(savedSearchActions, dispatch),
  }),
)(Autocomplete);

export default ConnectedAutocomplete;
