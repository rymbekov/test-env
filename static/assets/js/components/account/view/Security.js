import React, { memo } from 'react';
import { Button } from '@picsio/ui';
import PropTypes from 'prop-types';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import { Checkbox } from '../../../UIComponents';
import UpgradePlan from '../../UpgradePlan';
import picsioConfig from '../../../../../../config';
import ua from '../../../ua';
import Icon from '../../Icon';
import Alert from '../../Alert';
import SetPassword from './SetPassword';
import { navigate, reloadApp } from '../../../helpers/history';
// import TwoFactorAuth from '../../TwoFactorAuth';

const Security = (props) => {
  const { user, userActions } = props;
  const {
    twoFactorConfigured, personalTwoFactorEnabled, team, subscriptionFeatures,
  } = user;
  const { twoFactorEnabled: twoFactorEnabledPerTeam, trialEnds } = team;

  const isTrial = !(new Date() > new Date(trialEnds));
  const { twoFactorAuth, planName } = subscriptionFeatures;
  const isUnsubscribedUser = !planName;

  const handleAuthentication = (value) => {
    if (twoFactorEnabledPerTeam || !twoFactorAuth) return;
    Logger.log('User', 'SecurityEnabledUser2FA', value);
    userActions.updateUser({ personalTwoFactorEnabled: value }, false);
  };

  const useAuthenticationLabel = (
    <span>
      {localization.ACCOUNT.labelAuthentication}{' '}
      <Icon name="question" tooltipText={localization.ACCOUNT.labelAuthenticationTooltip} />
    </span>
  );

  const handleSetupClick = () => {
    Logger.log('User', 'TwoFactorAuthSetupButton');
    if (ua.isMobileApp()) {
      window.open(picsioConfig.getApiBaseUrl(), '_blank');
    } else {
      reloadApp();
    }
  };

  return (
    <div className="pageTabsContentAccount">
      <div className="pageContainer">
        <If condition={isTrial && isUnsubscribedUser}>
          <div className="pageItem">
            <div className="pageItemTitle">
              {localization.TWO_FACTOR_AUTH.termsTitle}
              <UpgradePlan tooltip={localization.TWO_FACTOR_AUTH.upgradeTooltip} />
            </div>
            {localization.TWO_FACTOR_AUTH.planRestriction(() => navigate('/billing?tab=overview'))}
          </div>
        </If>
        <div className="pageItemTitle">
          {localization.ACCOUNT.titleSecurity}
          <If condition={!twoFactorAuth}>
            {' '}
            <UpgradePlan tooltip={localization.TWO_FACTOR_AUTH.upgradeTooltip} />
          </If>
        </div>
        <div className="pageItemCheckbox">
          <Checkbox
            label={useAuthenticationLabel}
            value={personalTwoFactorEnabled}
            onChange={handleAuthentication}
            disabled={!twoFactorAuth || twoFactorEnabledPerTeam}
          />
        </div>
        <SetPassword
          user={user}
          userActions={userActions}
        />
        <If condition={personalTwoFactorEnabled}>
          <Alert color="success">{localization.TWO_FACTOR_AUTH.myAccountTextEnabled}</Alert>

          <If condition={!twoFactorConfigured}>
            <div className="pageItemRow">
              <Button
                className="billingCard__button"
                variant="contained"
                component="button"
                color="primary"
                size="md"
                onClick={handleSetupClick}
              >
                {localization.ACCOUNT.setup2FANow}
              </Button>
            </div>
          </If>
        </If>

        {/* <If condition={personalTwoFactorEnabled && twoFactorAuth}>
          <TwoFactorAuth configured={twoFactorConfigured} />
        </If> */}
      </div>
    </div>
  );
};

Security.defaultProps = {
  twoFactorConfigured: false,
  personalTwoFactorEnabled: false,
};

Security.propTypes = {
  twoFactorConfigured: PropTypes.bool,
  personalTwoFactorEnabled: PropTypes.bool,
};

export default memo(Security);
