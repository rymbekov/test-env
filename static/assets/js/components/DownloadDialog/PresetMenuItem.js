import React from 'react';
import PropTypes from 'prop-types';
import {
  MenuItem, MenuItemAction, MenuItemText, IconButton,
} from '@picsio/ui';
import { CloseIcon } from '@picsio/ui/dist/icons';

const PresetMenuItem = (props) => {
  const {
    value,
    text,
    onRemove,
    option,
    ...rest
  } = props;
  const isAllowRemove = value !== 'original' && value !== 'custom' && !option.data.resolution;

  return (
    <MenuItem variant="select" ellipsis {...rest}>
      <MenuItemText primary={text} />
      <If condition={isAllowRemove}>
        <MenuItemAction>
          <IconButton
            color="inherit"
            buttonSize="lg"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(value, text);
            }}
          >
            <CloseIcon />
          </IconButton>
        </MenuItemAction>
      </If>
    </MenuItem>
  );
};

PresetMenuItem.propTypes = {
  value: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  option: PropTypes.object,
};

export default PresetMenuItem;
