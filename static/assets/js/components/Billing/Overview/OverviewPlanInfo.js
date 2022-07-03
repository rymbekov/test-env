import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import Skeleton from 'react-loading-skeleton';
import WithSkeletonTheme from '../../WithSkeletonTheme';
import localization from '../../../shared/strings';
import ua from '../../../ua';

import { subscriptionPropTypes } from './propTypes';

const getPlanInfo = (
  activePlanId,
  activePlanFullName,
  activePlanPrice,
  activePlanInterval,
  activePlanIsOld,
  trialEnds,
  subscription,
) => {
  if (activePlanId) {
    const { currentPeriodEnd, cancelPeriodEnd } = subscription;
    const periodEndDate = new Date(currentPeriodEnd * 1000);
    const periodEndDateFormatted = dayjs(periodEndDate).format('ll');

    if (activePlanIsOld) {
      return localization.BILLING.billingOldPlanInfo(
        activePlanPrice / 100,
        activePlanInterval,
        periodEndDateFormatted,
      );
    } if (cancelPeriodEnd) {
      return `${localization.BILLING.textYourSubscription1} <b>${activePlanFullName} ${localization.BILLING.textYourSubscription2}</b>. ${localization.BILLING.textYourSubscription3} ${periodEndDateFormatted}`;
    }
    return `${localization.BILLING.textYourSubscribed1} <b>${activePlanFullName} ${localization.BILLING.textYourSubscribed2}</b>. ${localization.BILLING.textYourSubscribed3} ${periodEndDateFormatted}.`;
  }

  const trialEndsDate = new Date(trialEnds);
  const trialEndsDateFormatted = dayjs(trialEndsDate).format('ll');
  const isExpired = trialEndsDate > Date.now();

  if (isExpired) {
    return `${localization.BILLING.textYourTrial1} ${localization.BILLING.textYourTrial2} ${trialEndsDateFormatted}. <br/> You can use all the functionality without any restrictions. <br/> Except for a number of assets, you have a limit of 50,000 files during the Trial period.`;
  }
  return `${localization.BILLING.textYourTrialEnded}`;
};

const OverviewPlanInfo = (props) => {
  const {
    activePlanId,
    activePlanFullName,
    activePlanPrice,
    activePlanInterval,
    activePlanIsOld,
    trialEnds,
    subscription,
    loading,
  } = props;
  const info = getPlanInfo(activePlanId,
    activePlanFullName,
    activePlanPrice,
    activePlanInterval,
    activePlanIsOld,
    trialEnds,
    subscription);

  return (
    <div className="billingOverview__plan__info">
      <Choose>
        <When condition={loading}>
          <WithSkeletonTheme>
            <Choose>
              <When condition={ua.browser.isNotDesktop()}>
                <Skeleton width={280} />
              </When>
              <Otherwise>
                <Skeleton width={456} />
              </Otherwise>
            </Choose>
          </WithSkeletonTheme>
        </When>
        <Otherwise>
          <p dangerouslySetInnerHTML={{ __html: info }} />
        </Otherwise>
      </Choose>
    </div>
  );
};

OverviewPlanInfo.defaultProps = {
  activePlanId: '',
  activePlanFullName: '',
  activePlanPrice: null,
  activePlanInterval: '',
  activePlanIsOld: null,
  trialEnds: null,
  subscription: {},
  loading: false,
};
OverviewPlanInfo.propTypes = {
  activePlanId: PropTypes.string,
  activePlanFullName: PropTypes.string,
  activePlanPrice: PropTypes.number,
  activePlanInterval: PropTypes.string,
  activePlanIsOld: PropTypes.bool,
  trialEnds: PropTypes.string,
  subscription: PropTypes.shape(subscriptionPropTypes),
  loading: PropTypes.bool,
};

export default OverviewPlanInfo;
