import React from 'react';
import PropTypes from 'prop-types';
import './MicrosoftButton.scss';
import { MicrosoftIcon } from '@picsio/icons';
import { IconColorful } from '@picsio/ui';

const MicrosoftButton = (props) => {
  const { onClick } = props;
  return (
    <button type="button" className="microsoft-btn" data-login="microsoft" onClick={onClick}>
      <IconColorful size="xxl">
        <MicrosoftIcon />
      </IconColorful>
      <span className="microsoft-btn-text">Sign in with Microsoft</span>
    </button>
  );
};

MicrosoftButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default MicrosoftButton;
