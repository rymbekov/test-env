import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@picsio/ui';
import Logger from '../../../services/Logger';
import * as Api from '../../../api/team';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import { Checkbox } from '../../../UIComponents';
import UpgradePlan from '../../UpgradePlan';
import ua from '../../../ua';
import picsioConfig from '../../../../../../config';
import Icon from '../../Icon';
import Alert from '../../Alert';
import SecurityTeammatesStatus from './SecurityTeammatesStatus';
import { navigate, reloadApp } from '../../../helpers/history';

const Security = (props) => {
  const { team, userActions, subscriptionFeatures } = props;
  const { twoFactorConfigured, twoFactorEnabled, trialEnds } = team;

  const isTrial = !(new Date() > new Date(trialEnds));
  const { twoFactorAuth, planName } = subscriptionFeatures;
  const isUnsubscribedUser = !planName;

  const handleAuthentication = async (value) => {
    if (!twoFactorAuth) return;
    Logger.log('User', 'SecurityEnforcedTeam2FA', value);
    try {
      userActions.updateTeamValue('twoFactorEnabled', value);
      await Api.enableTwoFactorAuth();
    } catch (err) {
      userActions.updateTeamValue('twoFactorEnabled', !value);
      const errorMessage = utils.getDataFromResponceError(err, 'message');
      Logger.error(new Error('Can not change 2FA for team'), { error: err }, [
        '2FATeamChangedFailed',
        errorMessage || 'NoMessage',
      ]);
    }
  };

  const handleSetupClick = () => {
    Logger.log('User', 'TwoFactorAuthSetupButton');
    if (ua.isMobileApp()) {
      window.open(picsioConfig.getApiBaseUrl(), '_blank');
    } else {
      reloadApp();
    }
  };

  const useAuthenticationLabel = (
    <span>
      {localization.TEAMMATES.labelAuthentication}{' '}
      <Icon name="question" tooltipText={localization.TEAMMATES.labelAuthenticationTooltip} />
    </span>
  );

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
          {localization.TEAMMATES.titleSecurity}
          <If condition={!twoFactorAuth}>
            {' '}
            <UpgradePlan tooltip={localization.TWO_FACTOR_AUTH.TWO_FACTOR_AUTH} />
          </If>
        </div>
        <Checkbox
          label={useAuthenticationLabel}
          value={twoFactorEnabled}
          disabled={!twoFactorAuth}
          onChange={handleAuthentication}
        />
        <If condition={twoFactorEnabled && twoFactorAuth}>
          {/* <TwoFactorAuth configured={twoFactorConfigured} /> */}
          <Alert color="success">{localization.TWO_FACTOR_AUTH.myTeamTextEnabled()}</Alert>
          <If condition={!twoFactorConfigured}>
            <div className="pageItemRow">
              <Button
                className="billingCard__button"
                variant="text"
                color="primary"
                size="md"
                onClick={handleSetupClick}
              >
                {localization.TEAMMATES.setup2FANow}
              </Button>
            </div>
          </If>
        </If>
        <SecurityTeammatesStatus />
      </div>
    </div>
  );
};

Security.defaultProps = {
  team: {
    twoFactorConfigured: false,
    twoFactorEnabled: false,
  },
};

Security.propTypes = {
  team: PropTypes.shape({
    twoFactorConfigured: PropTypes.bool,
    twoFactorEnabled: PropTypes.bool,
  }),
};

export default memo(Security);
