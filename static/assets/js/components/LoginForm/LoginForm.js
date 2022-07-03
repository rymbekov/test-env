import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { IconColorful } from '@picsio/ui';
import { MicrosoftIcon, GoogletIcon } from '@picsio/icons';
import { removeCurrentUserWebPushSubscription } from '../../store/helpers/user';
import * as utils from '../../shared/utils';
import picsioConfig from '../../../../../config';
import ua from '../../ua';
import UiBlocker from '../../services/UiBlocker';
import Logger from '../../services/Logger';
import { saveAutorization, isValidEmailAddress } from '../../shared/utils';
import sdk from '../../sdk';
import { Input, Button } from '../../UIComponents';
import TwoFactorScreen from '../TwoFactorScreen';
import { reloadApp } from '../../helpers/history';
import GoogleButton from '../GoogleButton';
import MicrosoftButton from '../MicrosoftButton';

import './LoginForm.scss';

// Value will be injected by Webpack DefinePlugin constant from Webpack
// eslint-disable-next-line jsx-control-statements/jsx-jcs-no-undef
const isMobileApp = __IS_MOBILE__;

export default function LoginForm({
  onLogin, componentPrefix, withGoogleButton, withMicrosoftButton,
}) {
  const [loginValue, setLoginValue] = useState('');
  const [loginError, setLoginError] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const login = async (event) => {
    Logger.log('User', componentPrefix);
    event.preventDefault();
    if (!loginValue) {
      setLoginError('Please enter your email');
      return;
    }
    if (!isValidEmailAddress(loginValue)) {
      setLoginError('Invalid email address');
      return;
    }
    if (!passwordValue) {
      setPasswordError('Please enter your password');
      return;
    }

    let res;
    UiBlocker.block('Logging in process...');
    let isLoggerInited = false;
    try {
      Logger.info('Starting remove WebPush Subscription');
      await removeCurrentUserWebPushSubscription();

      const loginResponse = await sdk.users.login(loginValue, passwordValue);
      res = loginResponse.data;
      if (res.user) {
        const {
          apiKey,
          email,
          displayName,
          twoFactorConfigured,
          twoFactorMode = 'app',
          subscriptionFeatures = {},
        } = res.user;
        Logger.setUser({ email, displayName });
        isLoggerInited = true;

        if (apiKey) {
          saveAutorization(apiKey);
          if (onLogin) {
            Logger.info('Logging in mobile app');
            if (ua.isMobileApp()) {
              const { twoFactorAuth } = subscriptionFeatures;
              const isTwoFactorAuthComplete = await utils.MobileStorage.get('picsio.twoFactorAuthComplete') || 'false';
              if (twoFactorAuth && twoFactorConfigured && isTwoFactorAuthComplete === 'false') {
                UiBlocker.unblock();
                ReactDOM.render(
                  <TwoFactorScreen onLogin={onLogin} twoFactorMode={twoFactorMode} />,
                  document.querySelector('.wrapperPicsioApp'),
                );
                return;
              }
            }
            onLogin();
          } else {
            reloadApp();
          }
          return;
        }
      }
      if (!isLoggerInited && loginValue) {
        Logger.setUser({ email: loginValue.toLowerCase(), displayName: loginValue.toLowerCase() });
      }
      isLoggerInited = false; // if user texted a wrong email and will try to login agein, we need to update Logger info
      if (res.errors) {
        Logger.log('UI', 'MobileAppLoginServerError', { error: res.errors._id });
        UiBlocker.unblock();
        setServerError(res.errors._id);
        return;
      }
      Logger.log('UI', 'UserDontHaveApiKey');
      throw new Error('No ApiToken');
    } catch (err) {
      UiBlocker.unblock();
      if (!isLoggerInited && loginValue) {
        Logger.setUser({ email: loginValue.toLowerCase(), displayName: loginValue.toLowerCase() });
      }
      setServerError('Something went wrong. Please try again.');
      Logger.error(new Error('Can not login user'), { error: err }, [
        'LoginUserFailed',
      ]);
      isLoggerInited = false;
    }
  };

  const googleSignInForMobileApp = async () => {
    try {
      UiBlocker.block('Logging in process...');
      const googleProfile = await GoogleAuth.signIn();
      console.log('====> googleProfile: ', googleProfile);
      if (googleProfile) {
        try {
          const { accessToken } = googleProfile.authentication;
          const loginResponse = await sdk.users.loginWithGoogle({ accessToken });
          const res = loginResponse.data;
          if (res.success && res.user) {
            if (!res.user.apiKey) {
              throw new Error('apiKey is undefined');
            }
            saveAutorization(res.user.apiKey);
            reloadApp();
            return;
          }
        } catch (err) {
          throw new Error('Can not get user with googleProfile');
        }
      }
      throw new Error('Can not get googleProfile');
    } catch (err) {
      const errMessage = (err && err.message) || 'NoMessage';

      // message when user canceled/closed Google Auth popup
      if (errMessage === 'The user canceled the sign-in flow.') {
        return;
      }
      setServerError("Can't authorize with Google. Please try again.");
      Logger.error(new Error('Can not login user with GoogleAuth'), { error: err }, [
        'LoginUserGoogleAuthFailed',
        errMessage,
      ]);
    } finally {
      UiBlocker.unblock();
    }
  };

  const handleLoginWithGoogle = () => {
    Logger.log('User', `${componentPrefix}WithGoogle`);
    if (ua.isMobileApp()) {
      googleSignInForMobileApp();
    } else {
      window.open('/auth/google', '_blank');
      setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          window.addEventListener('focus', reloadApp);
        }
      }, 200);
    }
  };

  const microsoftSignInForMobileApp = async () => {
    try {
      throw new Error('Login with Azure AD is not implemented yet');
    } catch (err) {
      const errMessage = (err && err.message) || 'NoMessage';

      // message when user canceled/closed Google Auth popup
      if (errMessage === 'The user canceled the sign-in flow.') {
        return;
      }
      setServerError("Can't authorize with Microsoft. Please try again.");
      Logger.error(new Error('Can not login user with MicrosoftAuth'), { error: err }, [
        'LoginUserMicrosoftAuthFailed',
        errMessage,
      ]);
    } finally {
      UiBlocker.unblock();
    }
  };

  const handleLoginWithMicrosoft = () => {
    Logger.log('User', `${componentPrefix}WithMicrosoft`);
    if (ua.isMobileApp()) {
      googleSignInForMobileApp();
    } else {
      window.open('/auth/azure', '_blank');
      setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          window.addEventListener('focus', reloadApp);
        }
      }, 200);
    }
  };

  const generateForgotLink = () => {
    let url = loginValue && utils.isValidEmailAddress(loginValue)
      ? `/forgot?email=${loginValue}`
      : '/forgot';
    if (isMobileApp) {
      url = `${picsioConfig.getApiBaseUrl()}${url}`;
    }
    return url;
  };

  return (
    <form onSubmit={login}>
      <If condition={serverError}>
        <div className="error">{serverError}</div>
      </If>
      <Input
        type="text"
        placeholder="Email"
        error={loginError}
        value={loginValue}
        onChange={(e, value) => {
          setLoginValue(value.trim());
          if (loginError) setLoginError('');
          if (serverError) setServerError('');
        }}
        className="formInputAddAccount"
      />
      <Input
        type="password"
        error={passwordError}
        placeholder="Password"
        value={passwordValue}
        onChange={(e, value) => {
          setPasswordValue(value);
          if (passwordError) setPasswordError('');
          if (serverError) setServerError('');
        }}
        className="formInputAddAccount"
      />
      <div className="loginButtons">
        <Button id="button-login" className="buttonAction" type="submit">
          Log in
        </Button>
        <If condition={ua.isMobileApp()}>
          <If condition={withGoogleButton || withMicrosoftButton}>
            <span className="socialLoginTxtOr"><span className="separator">or</span></span>
          </If>
          <div className="signInWithNetworkButtons">
            <If condition={withGoogleButton}>
              <GoogleButton onClick={googleSignInForMobileApp} />
            </If>
            <If condition={withMicrosoftButton}>
              <div className="loginGoogle">
                <MicrosoftButton onClick={microsoftSignInForMobileApp} />
              </div>
            </If>
          </div>
        </If>
        <If condition={!ua.isMobileApp()}>
          <If condition={withGoogleButton || withMicrosoftButton}>
            <span className="socialLoginTxtOr">
              <div className="separator">or</div>
            </span>
          </If>
          <div className="signInWithNetworkButtons">
            <If condition={withGoogleButton}>
              <>
                <button
                  id="button-loginWithGoogle"
                  type="button"
                  className="googleBtn"
                  data-login="google"
                  onClick={handleLoginWithGoogle}
                >
                  <IconColorful size="lg">
                    <GoogletIcon />
                  </IconColorful>
                  <span className="googleBtnText">Sign in with Google</span>
                </button>
              </>
            </If>
            <If condition={withMicrosoftButton}>
              <>
                <button
                  id="button-loginWithMicrosoft"
                  type="button"
                  className="microsoftBtn"
                  data-login="microsoft"
                  onClick={handleLoginWithMicrosoft}
                >
                  <IconColorful size="lg">
                    <MicrosoftIcon />
                  </IconColorful>
                  <span className="microsoftBtnText">Sign in with Microsoft</span>
                </button>
              </>
            </If>
          </div>
        </If>
      </div>
      <div className="loginForgotPassword">
        <a
          id="link-forgotPassword"
          href={generateForgotLink()}
          target="_blank"
          rel="noreferrer"
          onClick={() => Logger.log('User', `${componentPrefix}ForgotPassword`)}
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
}

LoginForm.defaultProps = {
  onLogin: null,
};

LoginForm.propTypes = {
  componentPrefix: PropTypes.string.isRequired,
  withGoogleButton: PropTypes.bool.isRequired,
  withMicrosoftButton: PropTypes.bool.isRequired,
  onLogin: PropTypes.func,
};
