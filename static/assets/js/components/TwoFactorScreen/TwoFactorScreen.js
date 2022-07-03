import React, { useState, memo } from 'react';
import { useMount, useToggle } from 'react-use';
import PropTypes from 'prop-types';
import ReactCodeInput from 'react-code-input';
import { Button } from '@picsio/ui';
import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import { Input } from '../../UIComponents';
import sdk from '../../sdk';

import './twoFactorScreen.scss';

function TwoFactorScreen(props) {
  const { onLogin, twoFactorMode } = props;
  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [code, setCode] = useState('');
  const [recoveryMode, toggleRecoveryMode] = useToggle(false);

  const sendTwoFactorEmailCode = async () => {
    try {
      setDisabled(true);
      await sdk.users.resendTwoFactorEmailCode();
      Logger.log('UI', '2FAEmailCodeSent');
      setDisabled(false);
    } catch (err) {
      const errorMessage = utils.getDataFromResponceError(err, 'message');
      setErrors({ code: errorMessage });
      setDisabled(false);
      Logger.warn(new Error('Can not send 2fa email code'), { error: err }, [
        '2FAEmailCodeSendFailed',
        errorMessage || 'NoMessage',
      ]);
    }
  };

  useMount(async () => {
    Logger.log('UI', '2FASetupScreen', { twoFactorMode });
    utils.mobileAppSave2faAutorization('false', twoFactorMode);
    if (twoFactorMode === 'email') {
      sendTwoFactorEmailCode();
    }
  });

  const digitsProps = {
    inputStyle: {
      fontFamily: 'monospace',
      MozAppearance: 'textfield',
      margin: '4px',
      borderRadius: '4px',
      width: '50px',
      height: '66px',
      fontSize: '24px',
      padding: '0',
    },
    inputStyleInvalid: {
      fontFamily: 'monospace',
      MozAppearance: 'textfield',
      margin: '4px',
      borderRadius: '4px',
      width: '50px',
      height: '66px',
      fontSize: '24px',
      padding: '0',
      color: 'red',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'red',
    },
  };

  const sendData = async (codeValue) => {
    try {
      await sdk.users.verifyTwoFactorCode(codeValue, twoFactorMode, recoveryMode);
      if (recoveryMode) {
        utils.mobileAppRemove2faAutorization();
      } else {
        utils.mobileAppSave2faAutorization('true', twoFactorMode);
      }
      onLogin();
    } catch (err) {
      const errorMessage = utils.getDataFromResponceError(err, 'message');
      setErrors({ code: errorMessage });
      setDisabled(false);
      Logger.warn(new Error('Can not send 2fa data'), { error: err }, [
        '2FADataSendFailed',
        errorMessage || 'NoMessage',
      ]);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (value && value.length === 6) {
      setDisabled(true);
      Logger.log('User', '2FASetupCodeSubmit');
      sendData(value);
    }
  };

  const handleEnterCodeMode = () => {
    Logger.log('User', '2FASetupCodeScreen');
    setCode('');
    if (errors.code) {
      setErrors({ ...errors, code: null });
    }
    toggleRecoveryMode(false);
  };

  const handleRecoveryMode = () => {
    Logger.log('User', '2FARecoveryForm');
    setCode('');
    if (errors.code) {
      setErrors({ ...errors, code: null });
    }
    toggleRecoveryMode(true);
  };

  const handleResendEmailCode = async () => {
    Logger.log('User', '2FAResendEmailCode');
    await sendTwoFactorEmailCode();
  };

  return (
    <div className="pageContainer twoFactorScreen">
      <div className="loginForm mobileLogin">
        <Choose>
          <When condition={recoveryMode}>
            <h2 className="form-container-header">
              {localization.TWO_FACTOR_SCREEN.recoveryTitle}
            </h2>
            <Input
              label="Please input the code below:"
              defaultValue={code}
              disabled={disabled}
              error={errors.code}
              onChange={(e) => {
                setCode(e.currentTarget.value);
              }}
            />
            <div className="twoFactorScreen__buttons">
              {localization.TWO_FACTOR_SCREEN.useApp(handleEnterCodeMode)}
              <Button
                variant="contained"
                component="button"
                color="primary"
                size="md"
                full
                onClick={() => {
                  Logger.log('User', '2FARecoveryFormSubmit');
                  sendData(code);
                }}
              >
                {localization.TWO_FACTOR_SCREEN.recoveryButton}
              </Button>
            </div>
          </When>
          <Otherwise>
            <h2 className="form-container-header">
              {localization.TWO_FACTOR_SCREEN.enterCodeTitle}
            </h2>
            <div className="twoFactorScreen__code">
              <div className="twoFactorScreen__code-label">
                <Choose>
                  <When condition={twoFactorMode === 'app'}>
                    {localization.TWO_FACTOR_SCREEN.enterCodeLabelApp}
                  </When>
                  <When condition={twoFactorMode === 'email'}>
                    {localization.TWO_FACTOR_SCREEN.enterCodeLabelEmail}
                  </When>
                  <Otherwise>{localization.TWO_FACTOR_SCREEN.enterCodeLabelApp}</Otherwise>
                </Choose>
              </div>
              <ReactCodeInput
                type="number"
                fields={6}
                value={code}
                onChange={handleCodeChange}
                isValid={!errors.code}
                disabled={disabled}
                {...digitsProps}
              />
              <If condition={errors.code}>
                <div className="twoFactorScreen__code-error">{errors.code}</div>
              </If>
              <p>
                <If condition={twoFactorMode === 'email'}>
                  <span className="picsioLink" onClick={handleResendEmailCode} tabIndex={0} role="button">
                    {localization.TWO_FACTOR_SCREEN.resendButton}
                  </span> {' '}
                </If>
                {localization.TWO_FACTOR_SCREEN.useRecovery(handleRecoveryMode)}
              </p>
            </div>
          </Otherwise>
        </Choose>
      </div>
    </div>
  );
}

export default memo(TwoFactorScreen);

TwoFactorScreen.propTypes = {
  onLogin: PropTypes.func.isRequired,
  twoFactorMode: PropTypes.string.isRequired,
};
