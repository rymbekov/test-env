import React from 'react';
import PropTypes from 'prop-types';
import _upperCase from 'lodash/upperCase';
import {
  MenuItem,
  MenuItemText,
  MenuItemIcon,
} from '@picsio/ui';
import { CheckIcon } from '@picsio/ui/dist/icons';
import FlagIcon from '../../FlagIcon';

const TaxOption = (props) => {
  const {
    text, option, selected, ...rest
  } = props;
  const {
    id, image, description, country, abbreviation,
  } = option;
  const title = id === 'empty' ? 'Not selected' : _upperCase(text);

  return (
    <MenuItem className="taxOption" title={description} variant="select" selected={selected} icon="end" {...rest}>
      <FlagIcon abbreviation={abbreviation} image={image} alt={text} />
      <MenuItemText primary={title} secondary={country} />
      <If condition={selected}>
        <MenuItemIcon>
          <CheckIcon />
        </MenuItemIcon>
      </If>
    </MenuItem>
  );
};

TaxOption.defaultProps = {
  text: '',
  selected: false,
};
TaxOption.propTypes = {
  text: PropTypes.string,
  option: PropTypes.shape({
    id: PropTypes.string,
    abbreviation: PropTypes.string,
    image: PropTypes.string,
    description: PropTypes.string,
    country: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool,
};

export default TaxOption;
