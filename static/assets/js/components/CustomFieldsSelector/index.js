import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cn from 'classnames';
import localization from '../../shared/strings';
import Dropdown from '../dropdown';
import Opener from '../Opener';

import './styles.scss';

const CustomFieldsSelector = (props) => {
  const {
    title,
    label,
    className,
    customFields,
    selectedFields,
    hiddenFields,
    addField,
    removeField,
    hideDisabled,
    readOnly,
    disabled,
    autoFocus,
    eventName,
    disablePortal,
  } = props;
  const [fields, setFields] = useState({
    all: [],
    writable: [],
  });
  const items = hideDisabled ? fields.writable : fields.all;
  const localizedLabel = localization.SEARCH.text[label] || '';

  useEffect(() => {
    const newFields = customFields
      .reduce((acc, item) => {
        const { type, title: itemTitle, writable } = item;

        if (type !== 'separator' && !hiddenFields.includes(itemTitle)) {
          const newItem = {
            ...item,
            _id: itemTitle,
          };

          acc.all.push(newItem);

          if (writable !== false) {
            acc.writable.push(newItem);
          }
        }
        return acc;
      }, {
        all: [],
        writable: [],
      });

    setFields(newFields);
  }, [customFields, hiddenFields]);

  return (
    <div className="customFieldsSelectorWrapper">
      <Opener openerText={title} disabled={disabled} hideOpenerWhenOpen eventName={eventName}>
        <div className={cn('itemSearchFilters', className)}>
          <div className="labelItemSearchFilters">{localizedLabel}</div>
          <div className="contentItemSearchFilters">
            <Dropdown
              filterText={localization.DROPDOWN.chooseCustomFields}
              checkedItems={selectedFields}
              items={items}
              onCheckedHandler={addField}
              onUncheckedHandler={removeField}
              createHandler={null}
              readOnly={readOnly}
              disabled={disabled}
              autoFocus={autoFocus}
              type="default"
              disablePortal={disablePortal}
            />
          </div>
        </div>
      </Opener>
    </div>
  );
};

CustomFieldsSelector.defaultProps = {
  title: 'Add custom field',
  label: 'Custom field',
  className: '',
  customFields: [],
  selectedFields: [],
  hiddenFields: [],
  addField: null,
  removeField: null,
  readOnly: false,
  disabled: false,
  hideDisabled: false,
  autoFocus: false,
  disablePortal: false,
  eventName: '',
};
CustomFieldsSelector.propTypes = {
  title: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  customFields: PropTypes.arrayOf(PropTypes.object),
  selectedFields: PropTypes.arrayOf(PropTypes.object),
  hiddenFields: PropTypes.arrayOf(PropTypes.string),
  addField: PropTypes.func,
  removeField: PropTypes.func,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  hideDisabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  disablePortal: PropTypes.bool,
  eventName: PropTypes.string,
};

const ConnectedCustomFieldsSelector = connect((store) => ({
  customFields: store.customFields.items,
}))(CustomFieldsSelector);

export default ConnectedCustomFieldsSelector;
