import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import Dropdown from '../dropdown';

const MultiSelect = (props) => {
  const {
    className,
    title,
    value,
    options,
    onChange,
    required,
    inProgress,
    position,
  } = props;
  const items = options?.map((option) => ({ _id: option, title: option }));
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    /** for some reason value may be 'true', or something else */
    if (typeof value !== 'string') {
      setSelected([]);
      return;
    }
    setSelected(value.split(',').map((valuePart) => ({ _id: valuePart, title: valuePart })));
  }, [value]);

  const onCheck = (targetValue) => {
    if (required) {
      onChange(targetValue.title, () => setSelected(selected), { isAttach: true, required: true, multipleAttach: true });
    } else {
      onChange(targetValue.title, () => setSelected(selected), { isAttach: true, multipleAttach: true });
    }
  };

  const onUncheck = (targetValue) => {
    if (required) {
      onChange(targetValue.title, () => setSelected(selected), { isAttach: false, required: true, multipleAttach: true });
    } else {
      onChange(targetValue.title, () => setSelected(selected), { isAttach: false, multipleAttach: true });
    }
  };

  const newProps = {
    ...props,
    placeholder: 'Select values',
    checkedItems: selected,
    onCheckedHandler: onCheck,
    onUncheckedHandler: onUncheck,
    items,
    type: 'keyword',
    filterText: 'Select values',
    inProgress,
    canCreate: false,
    createHandler: null,
    position,
  };

  return (
    <div
      className={clsx(
        'customFieldValue',
        'picsioInputText',
        className,
      )}
    >
      <If condition={title}>
        <label htmlFor={title} className="labelInputText">
          {title}
        </label>
      </If>
      <Dropdown
        {...newProps}
      />
    </div>
  );
};

MultiSelect.defaultProps = {
  className: '',
  title: '',
  modifiedField: null,
  value: '',
  placement: 'bottom',
  disabled: false,
  error: false,
  inProgress: false,
  multipleAttach: false,
  position: 'bottom',
};
MultiSelect.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedField: PropTypes.shape({
    name: PropTypes.string,
    updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    userId: PropTypes.string,
    value: PropTypes.string,
  }),
  placement: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  inProgress: PropTypes.bool,
  multipleAttach: PropTypes.bool,
  position: PropTypes.string,
};

export default MultiSelect;
