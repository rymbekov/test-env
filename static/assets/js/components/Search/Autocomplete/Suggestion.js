import React from 'react';
import { findAll } from 'highlight-words-core';
import Icon from '../../Icon';

const icons = {
  collection: 'folder',
  keyword: 'keyword',
  savedSearch: 'search',
};

const Suggestion = (suggestion, { query }, savedValue) => {
  const { type, result } = suggestion;
  const suggestionText = suggestion.name || suggestion.path || suggestion.value;
  const actualQuery = savedValue ? query?.replace(savedValue, '')?.trim() : query;

  const chunks = findAll({
    autoEscape: true,
    searchWords: [actualQuery],
    textToHighlight: suggestionText,
  });

  return (
    <>
      <If condition={icons[type]}>
        <Icon name={icons[type]} />
      </If>
      <div className="react-autosuggest__suggestion-text">
        {chunks.map((chunk, index) => {
          const { end, highlight, start } = chunk;
          const text = suggestionText.substr(start, end - start);
          const className = highlight ? 'react-autosuggest__suggestion-match' : null;
          return (
            <span className={className} key={index}>
              {text}
            </span>
          );
        })}
      </div>
      <If condition={result}>
        <span className="react-autosuggest__suggestion-result">{result}</span>
      </If>
    </>
  );
};

export default Suggestion;
