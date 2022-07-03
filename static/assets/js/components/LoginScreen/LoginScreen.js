import React from 'react';
import PropTypes from 'prop-types';
import LoginForm from '../LoginForm';
import './styles.scss';

function LoginScreen({ onLogin }) {
  return (
    <div className="pageContainer LoginScreen">
      <div className="loginForm mobileLogin">
        <h1 className="form-container-header">Login</h1>
        <div className="simpleDialogDescription">
          <LoginForm onLogin={onLogin} withGoogleButton withMicrosoftButton={false} componentPrefix="LoginFromMobileApp" />
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;

LoginScreen.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
