import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import * as teamActions from '../../../store/reducers/teammates';
import SecurityTeammateStatus from './SecurityTeammateStatus';
import Toast from '../../Toast';
import './securityTeammatesStatus.scss';

const SecurityTeammatesStatus = (props) => {
  const dispatch = useDispatch();
  const { items: teammates } = useSelector((state) => state.teammates);

  const handleReset = async (teammateId) => {
    Logger.log('User', 'ResetTwoFactorAuthentication', teammateId);
    try {
      const result = await dispatch(
        teamActions.updateTeammateByField({ teammateId, field: 'twoFactorConfigured' }),
      );
      if (result.success) {
        Toast(localization.TEAMMATES.reset2FASuccess);
      }
    } catch (err) {
      Logger.error(new Error('Reset two-factor auth failed'), { error: err }, [
        'ResetTwoFactorAuthenticationFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
  };

  return (
    <div className="securityTeammatesStatus">
      {teammates.map((teammate) => (
        <SecurityTeammateStatus
          key={teammate._id}
          teammate={teammate}
          onReset={() => handleReset(teammate._id)}
        />
      ))}
    </div>
  );
};

SecurityTeammatesStatus.defaultProps = {
  team: {
    twoFactorConfigured: false,
    twoFactorEnabled: false,
  },
};

SecurityTeammatesStatus.propTypes = {
  team: PropTypes.shape({
    twoFactorConfigured: PropTypes.bool,
    twoFactorEnabled: PropTypes.bool,
  }),
};

export default memo(SecurityTeammatesStatus);
