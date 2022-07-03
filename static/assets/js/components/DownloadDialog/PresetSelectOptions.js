import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@picsio/ui';

const PresetSelectOptions = (props) => {
  const {
    label, id, name, value, onChange, options, disabled,
  } = props;

  return (
    <TextField
      label={label}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      select
      SelectProps={{
        labelId: null, // TODO: temporary fix, will be fixed in the  next ui repo release
        options,
        dataId: 'value',
        dataValue: 'text',
        native: true,
      }}
    />
  );
};

PresetSelectOptions.defaultProps = {
  disabled: false,
};
PresetSelectOptions.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  })).isRequired,
  disabled: PropTypes.bool,
};

export default PresetSelectOptions;
