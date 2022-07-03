import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import localization from '../../../shared/strings';
import { Input } from '../../../UIComponents';

const SetPassword = ({ user, userActions }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState(user.error);
  const [newPasswordError, setNewPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  useEffect(() => {
    userActions.setUserErrorToNull();
  }, []);

  useEffect(() => {
    setOldPasswordError(user.error);
  }, [user.error]);

  const handleOldPasswordChange = (event) => {
    setOldPassword(event.target.value);
    userActions.setUserErrorToNull();
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
    setNewPasswordError(null);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    setConfirmPasswordError(null);
  };

  const handleSave = () => {
    if (user.hasPassword && oldPassword.length === 0) {
      setOldPasswordError(localization.SET_NEW_PASSWORD.emptyPasswordError);
      return;
    }
    if (newPassword.length < 8) {
      setNewPasswordError(localization.SET_NEW_PASSWORD.passwordLengthError);
      return;
    }
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError(localization.SET_NEW_PASSWORD.passwordsAreNotEqualError);
      return;
    }
    userActions.setNewPassword({ oldPassword, newPassword });
  };

  return (
    <div>
      <div className="passwordField">
        <If condition={user.hasPassword}>
          <Input
            dataTestId="setOldPasswordInput"
            label={localization.SET_NEW_PASSWORD.oldPassword}
            autoComplete="new-password"
            value={oldPassword}
            type="password"
            onChange={handleOldPasswordChange}
            disabled={false}
            error={oldPasswordError}
          />
        </If>
        <Input
          dataTestId="setNewPasswordInput"
          label={localization.SET_NEW_PASSWORD.newPassword}
          autoComplete="new-password"
          value={newPassword}
          type="password"
          onChange={handleNewPasswordChange}
          disabled={false}
          error={newPasswordError}
        />
        <Input
          dataTestId="setNewPasswordRepeatInput"
          label={localization.SET_NEW_PASSWORD.confirmPassword}
          autoComplete="new-password"
          value={confirmPassword}
          type="password"
          onChange={handleConfirmPasswordChange}
          disabled={false}
          error={confirmPasswordError}
        />
      </div>
      <div
        className={cn('picsioDefBtn btnCallToAction saveButton')}
        onClick={handleSave}
        data-testid="setNewPasswordButtonSave"
      >
        {localization.SET_NEW_PASSWORD.save}
      </div>
    </div>
  );
};

SetPassword.propTypes = {
  user: PropTypes.shape({
    error: PropTypes.string,
    hasPassword: PropTypes.bool,
  }).isRequired,
  userActions: PropTypes.shape({
    setNewPassword: PropTypes.func,
    setUserErrorToNull: PropTypes.func,
  }).isRequired,
};

export default SetPassword;
