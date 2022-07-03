import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Button } from '@picsio/ui';

import localization from '../../shared/strings';

const MenuItemButton = ({
  isSiteProcessing, isActive, createdAt, toggleWebsitePublish, disabled,
}) => {
  const text = isActive ? localization.WEBSITES.textDelete : localization.WEBSITES.textCreate;
  const color = isActive ? 'secondary' : 'primary';
  const createDateDiff = createdAt && dayjs(createdAt).fromNow();

  return (
    <div className="pageMenuItemBtns">
      <div className="websitePublish">
        <Button
          variant="contained"
          color={color}
          size="md"
          onClick={toggleWebsitePublish}
          disabled={disabled || isSiteProcessing}
          fullWidth
          componentProps={{
            'data-qa-id': 'websitePublishBtn',
          }}
        >
          {text}
        </Button>
        <If condition={isActive && createDateDiff}>
          <div className="publishDate">
            <span>Published</span> {createDateDiff}
          </div>
        </If>
      </div>
    </div>
  );
};

MenuItemButton.defaultProps = {
  isSiteProcessing: false,
  isActive: false,
  createdAt: null,
  disabled: false,
};
MenuItemButton.propTypes = {
  isSiteProcessing: PropTypes.bool,
  isActive: PropTypes.bool,
  createdAt: PropTypes.string,
  toggleWebsitePublish: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default MenuItemButton;
