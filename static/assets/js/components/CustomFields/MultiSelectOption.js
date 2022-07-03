import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem, MenuItemText, MenuItemIcon } from '@picsio/ui';
import { CheckIcon } from '@picsio/ui/dist/icons';

const MultiSelectOption = (props) => {
  const {
    text,
    selected,
    // prevent to pass the option prop to MenuItem, but it's available
    option, //eslint-disable-line
    onClick,
    ...other
  } = props;

  return (
    <MenuItem selected={selected} onClick={onClick} variant="select" icon="end" {...other}>
      <MenuItemText primary={text} />
      <If condition={selected}>
        <MenuItemIcon>
          <CheckIcon />
        </MenuItemIcon>
      </If>
    </MenuItem>
  );
}

MultiSelectOption.propTypes = {
  text: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MultiSelectOption;
