import React from 'react'; // eslint-disable-line
import {
  bool, func, array, string, object,
} from 'prop-types';

/** Store */
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from '../../store';
import { add } from '../../store/actions/keywords';

import Dropdown from '../dropdown';

let allKeywordsCached = [];
let items = [];
const KeywordsDropdown = (props) => {
  const { allKeywords } = props;
  /** update items if keywords changed */
  if (allKeywordsCached !== allKeywords) {
    allKeywordsCached = allKeywords;
    if (allKeywords?.length) {
      items = allKeywords.map((item) => ({
        _id: item._id,
        title: item.path.split('→').pop(),
      })).sort((a, b) => a.title.localeCompare(b.title));
    }
  }
  const newProps = {
    ...props,
    items,
    inProgress: props.inProgress || props.isBusy,
    createHandler: props.canCreate ? props.actions.add : null,
  };
  return <Dropdown type="keyword" {...newProps} />;
};

KeywordsDropdown.propTypes = {
  hideHeading: bool,
  disabled: bool,
  canCreate: bool,
  checkedItems: array,
  onCheckedHandler: func,
  onUncheckedHandler: func,
  icon: string,
  placeholder: string,
  placeholderIcon: string,
  filterText: string,
  additionalClass: string,
  createText: string,
  createPlaceholderText: string,
  onItemClickHandler: func,
  onBlur: func,
  isOnlyCreate: bool,
  inProgress: bool,
  modifiedField: object,
};

const ConnectedDropdown = connect(
  (state) => ({
    allKeywords: state.keywords.all,
    isItemsLoaded: state.keywords.isLoaded,
    isBusy: state.keywords.isBusy,
  }),
  (dispatch) => ({ actions: bindActionCreators({ add }, dispatch) }),
)(KeywordsDropdown);

export default (props) => (
  <Provider store={store}>
    <ConnectedDropdown {...props} />
  </Provider>
);
