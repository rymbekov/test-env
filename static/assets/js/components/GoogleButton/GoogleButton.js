import React from 'react';
import PropTypes from 'prop-types';
import { IconColorful } from '@picsio/ui';
import { GoogletIcon } from '@picsio/icons';
import './GoogleButton.scss';

const GoogleButton = (props) => {
  const { onClick } = props;
  return (
    <button type="button" className="google-btn" data-login="google" onClick={onClick}>
      <IconColorful size="xxxl">
        <GoogletIcon />
      </IconColorful>
      <span className="google-btn-text">Sign in with Google</span>
    </button>
  );
};

GoogleButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default GoogleButton;
