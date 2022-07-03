import React, { useState } from 'react';
import { useMount } from 'react-use';
import PropTypes from 'prop-types';
import ReactCodeInput from 'react-code-input';
import Skeleton from 'react-loading-skeleton';
import { useDispatch } from 'react-redux';
import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import WithSkeletonTheme from '../WithSkeletonTheme';
import sdk from '../../sdk';
import { updateUser, updateTeamValue } from '../../store/actions/user';
import './styles.scss';

const TwoFactorAuth = (props) => {
  const dispatch = useDispatch();
  const { configured } = props;
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isQrLoading, setQrLoading] = useState(false);
  const [isComplete, setComplete] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [code, setCode] = useState('');

  useMount(async () => {
    if (configured) return;
    try {
      const { data: response } = await sdk.users.generateTwoFactorSecret();
      setData(response);
    } catch (err) {
      setErrors({ ...errors, fetch: localization.TWO_FACTOR_AUTH.error });
      const errorMessage = utils.getDataFromResponceError(err, 'message');
      Logger.error(new Error('Can not load 2FA data'), { error: err }, [
        '2FADataLoadFailed',
        errorMessage || 'NoMessage',
      ]);
    }
    setLoading(false);
    setQrLoading(true);
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
      const { secret, recoveryCode } = data;
      await sdk.users.completeTwoFactorSetup(codeValue, secret, recoveryCode);
      setComplete(true);
      dispatch(updateUser({ twoFactorConfigured: true }));
      dispatch(updateTeamValue('twoFactorConfigured', true));
      if (errors.code) {
        setErrors({ ...errors, code: null });
      }
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
      sendData(value);
    }
  };

  return (
    <WithSkeletonTheme>
      <div className="twoFactorAuth">
        <Choose>
          <When condition={configured || isComplete}>
            <>{localization.TWO_FACTOR_AUTH.complete}</>
          </When>
          <When condition={isLoading}>
            <div className="twoFactorAuth__content">
              <div className="twoFactorAuth__image">
                <Skeleton width={200} height={200} />
              </div>
              <div className="twoFactorAuth__description">
                <p>
                  <Skeleton count={10} />
                </p>
              </div>
            </div>
          </When>
          <When condition={data}>
            <div className="twoFactorAuth__content">
              <div className="twoFactorAuth__image">
                <If condition={isQrLoading}>
                  <Skeleton width={200} height={200} />
                </If>
                <img
                  src={data.qr}
                  width="200"
                  height="200"
                  alt="QR code"
                  style={{ display: isQrLoading ? 'none' : 'inline-block' }}
                  onLoad={() => setQrLoading(false)}
                />
              </div>
              <div className="twoFactorAuth__description">
                <p>{localization.TWO_FACTOR_AUTH.scan}</p>
                <p>{localization.TWO_FACTOR_AUTH.inCase}</p>
                <p>
                  <span className="twoFactorAuth__recoveryCode">{data.recoveryCode}</span>
                  <br />
                  {localization.TWO_FACTOR_AUTH.save}
                </p>
              </div>
            </div>
            <div className="twoFactorAuth__code">
              <div className="twoFactorAuth__code-label">{localization.TWO_FACTOR_AUTH.input}</div>
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
                <div className="twoFactorAuth__code-error">{errors.code}</div>
              </If>
            </div>
          </When>
          <Otherwise>
            <div className="twoFactorAuth__emtpy">{errors.fetch}</div>
          </Otherwise>
        </Choose>
      </div>
    </WithSkeletonTheme>
  );
};

TwoFactorAuth.defaultProps = {
  configured: false,
};

TwoFactorAuth.propTypes = {
  configured: PropTypes.bool,
};

export default TwoFactorAuth;
