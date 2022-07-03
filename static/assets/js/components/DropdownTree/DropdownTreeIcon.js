import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Icon as UiIcon } from '@picsio/ui';
import { Folder, Label as Keyword } from '@picsio/icons';

const DropdownTreeIcon = ({ iconSpecial }) => (
  <Choose>
    <When condition={iconSpecial === 'keyword'}>
      <UiIcon size="inherit" color="inherit">
        <Keyword />
      </UiIcon>
    </When>
    <When condition={iconSpecial === 'folder'}>
      <UiIcon size="inherit" color="inherit">
        <Folder />
      </UiIcon>
    </When>
    <Otherwise>{null}</Otherwise>
  </Choose>
);

/** default props */
DropdownTreeIcon.defaultProps = {
  iconSpecial: null,
};

DropdownTreeIcon.propTypes = {
  iconSpecial: PropTypes.string,
};

export default memo(DropdownTreeIcon);
