import React from 'react'; // eslint-disable-line
import PropTypes from 'prop-types';

import localization from '../../shared/strings';

import KeywordsDropdown from '../keywordsDropdown';

const Keywords = ({ addKeyword, selectedKeywords, removeKeyword }) => (
  <div className="itemSearchFilters searchDropdownTop">
    <div className="labelItemSearchFilters">{localization.SEARCH.text.Keywords}</div>
    <div className="contentItemSearchFilters">
      <KeywordsDropdown
        placeholder={localization.DROPDOWN.placeholderKeywords}
        placeholderIcon="emptyKeywords"
        icon="keyword"
        filterText={localization.DROPDOWN.chooseKeywords}
        createText={localization.DROPDOWN.createKeyword}
        checkedItems={selectedKeywords}
        onCheckedHandler={addKeyword}
        onUncheckedHandler={removeKeyword}
        canCreate={false}
      />
    </div>
  </div>
);

Keywords.propTypes = {
  selectedKeywords: PropTypes.array,
  addKeyword: PropTypes.func,
  removeKeyword: PropTypes.func,
};

export default Keywords;
