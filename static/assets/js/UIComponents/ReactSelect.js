import React, { memo } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

const ReactSelect = (props) => {
  const { label, options, value, onChange, disabled, ...rest } = props;

  return (
    <div className="react-select">
      <If condition={label}>
        <div className="react-select__label">{label}</div>
      </If>
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        value={value}
        onChange={onChange}
        options={options}
        isDisabled={disabled}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: () => <span className="react-select__indicator" />,
        }}
        inputProps={{ autoComplete: 'off', autoCorrect: 'off', spellCheck: 'off' }}
        {...rest}
      />
    </div>
  );
};

ReactSelect.defaultProps = {
  label: '',
  disabled: false,
  value: null || [],
};

ReactSelect.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.any),
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ]),
  onChange: PropTypes.func.isRequired,
};

export default memo(ReactSelect);
