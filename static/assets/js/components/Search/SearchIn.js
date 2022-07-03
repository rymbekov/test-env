import React from 'react';
import PropTypes from 'prop-types';
import remove from 'lodash.remove';

import { Checkbox } from '../../UIComponents';
import localization from '../../shared/strings';
import picsioConfig from '../../../../../config';
import Tooltip from '../Tooltip';

const any = {
  text: localization.SEARCH.fieldAny,
  value: 'any',
};
let fields = [
  {
    text: localization.SEARCH.fieldContent,
    value: 'content',
  },
  {
    text: localization.SEARCH.fieldName,
    value: 'name',
  },
  {
    text: localization.SEARCH.fieldTitle,
    value: 'title',
  },
  {
    text: localization.SEARCH.fieldDescription,
    value: 'description',
  },
  {
    text: localization.SEARCH.fieldKeywords,
    value: 'keywords',
  },
  {
    text: localization.SEARCH.fieldMeta,
    value: 'meta',
  },
  {
    text: localization.SEARCH.fieldCollectionName,
    value: 'tagName',
  },
];

class SearchIn extends React.Component {
  constructor(props) {
    super(props);

    if (picsioConfig.isProofing()) {
      fields = remove(fields, (item) => {
        return !(
          (item.value === 'title' && !picsioConfig.access.titleShow) ||
          (item.value === 'description' && !picsioConfig.access.descriptionShow) ||
          ['keywords', 'meta', 'tagName'].includes(item.value)
        );
      });
    }
  }

  state = {
    checked: [],
  };

  componentDidUpdate() {
    const { props } = this;
    if (!props.checkedItems.some((value) => value === any.value)) {
      this.lastChecked = [...[], ...props.checkedItems];
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let checked = nextProps.checkedItems;

    // if any
    if (checked.some((value) => value === any.value)) {
      checked = fields.map((item) => item.value);
    }

    if (checked !== prevState.checked) {
      return { checked };
    }

    return null;
  }

  onChangeAny = () => {
    if (this.props.checkedItems.some((value) => value === any.value)) {
      if (this.lastChecked && !this.lastChecked.some((value) => value === any.value)) {
        this.props.onChange([...[], ...this.lastChecked]);
      }
      return;
    }
    this.props.onChange([any.value]);
  };

  onChangeField = (value) => {
    let newCheckedItems = [...[], ...this.state.checked];
    const itemIndex = newCheckedItems.indexOf(value);

    if (itemIndex !== -1) {
      newCheckedItems.splice(itemIndex, 1);
    } else {
      newCheckedItems.push(value);
    }
    if (
      // if all checked
      newCheckedItems.length === fields.length ||
      // if not allowed content search
      (!this.contentSearchAllowed() && newCheckedItems.length === fields.length - 1)
    ) {
      newCheckedItems = [any.value];
    }
    if (newCheckedItems.length > 0) {
      this.props.onChange(newCheckedItems);
    }
  };

  contentSearchAllowed() {
    return true;
  }

  render() {
    const { checked } = this.state;
    const { disabled } = this.props;
    const contentSearchAllowed = this.contentSearchAllowed();
    const allChecked =
      checked.length === fields.length ||
      (!contentSearchAllowed && checked.length === fields.length - 1);

    return (
      <div className="itemSearchFilters itemSearchFilters--searchIn">
        <div className="labelItemSearchFilters labelItemSearchFilters--alt">
          {localization.SEARCH.text['Search in']}
        </div>
        <div className="contentItemSearchFilters">
          <div className="defaultCheckboxList">
            <Checkbox
              label={any.text}
              onChange={this.onChangeAny}
              value={allChecked}
              disabled={disabled}
            />
            {fields.map((field) => {
              const isContentNotAllowed = field.value === 'content' && !contentSearchAllowed;
              return (
                <Tooltip
                  key={field.value}
                  content={
                    isContentNotAllowed &&
                    'Search in documents content is available starting Micro billing plan'
                  }
                  placement="top"
                >
                  <Checkbox
                    label={field.text}
                    onChange={() => this.onChangeField(field.value)}
                    value={
                      isContentNotAllowed
                        ? false
                        : allChecked || checked.some((value) => value === field.value)
                    }
                    disabled={isContentNotAllowed ? true : disabled}
                  />
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

SearchIn.propTypes = {
  checkedItems: PropTypes.array,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

SearchIn.defaultProps = {
  checkedItems: [],
  onChange: () => {},
  disabled: false,
};

export default SearchIn;
