import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Switch, InputLabel } from '@picsio/ui';

import cn from 'classnames';
import localization from '../../../shared/strings';

import { getUserStorageName } from '../../../store/helpers/user';
import OverviewPlanInfo from './OverviewPlanInfo';
import BillingPlan from './BillingPlan';
import BillingPlanSkeleton from './BillingPlanSkeleton';
import PaygCounts from './PaygCounts';
import {
  planPropTypes, frequencyTypes, paygFeaturesPropTypes, subscriptionPropTypes,
} from './propTypes';

import getPlanAmount from './helpers/getPlanAmount';
import getPlanAdditionalField from './helpers/getPlanAdditionalField';
import getCredits from './helpers/getCredits';
import BillingPlanFeatures from './BillingPlanFeatures';
import BillingPlanButtons from './BillingPlanButtons';

const plansQuantityByStorage = {
  gd: 4,
  s3: 3,
  picsioStorage: 4,
};

const OverviewPlan = (props) => {
  const {
    loading,
    plans,
    frequency,
    paygFeatures,
    changePaygFeature,
    selectedPlanId,
    selectPlan,
    activePlanId,
    activePlanFullName,
    activePlanPrice,
    activePlanInterval,
    activePlanIsOld,
    websitesCount,
    teammatesCount,
    buyCredits,
    balance,
    trialEnds,
    subscription,
    switchFrequency,
    isDowngradeOrFreePlan,
    requestMoreStorage,
    picsioStorage,
    team,
  } = props;
  const { websites, teammates } = paygFeatures;
  const creditsAmount = getCredits(balance);
  const checked = frequency === 'year';
  const storageName = getUserStorageName(team);
  const plansLength = plansQuantityByStorage[storageName];

  return (
    <div className="billingOverview__plan" role="presentation">
      <div className="billingOverview__plan__toolbar billingOverviewToolbar">
        <h3 className="pageItemTitle">Plan</h3>
      </div>
      <div className="billingOverview__plan__toolbar billingOverviewToolbar">
        <OverviewPlanInfo
          activePlanId={activePlanId}
          activePlanFullName={activePlanFullName}
          activePlanPrice={activePlanPrice}
          activePlanInterval={activePlanInterval}
          activePlanIsOld={activePlanIsOld}
          trialEnds={trialEnds}
          subscription={subscription}
          loading={loading}
        />
      </div>
      <div className="billingOverview__plan__toolbar billingOverviewToolbar">
        <div className="billingFrequency">
          <InputLabel className="billingFrequency__label" htmlFor="frequency">
            <span className={cn({ 'PicsioInputLabel-checked': !checked })}>Billed monthly</span>
            <Switch name="frequency" checked={checked} onChange={switchFrequency} inputProps={{ id: 'frequency' }} />
            <span className={cn({ 'PicsioInputLabel-checked': checked })}>Billed annually</span>
          </InputLabel>
          <div className="billingFrequency__info">Save 2 month</div>
        </div>
      </div>
      <div className="billingOverview__plan__wrapper">
        <div className="billingOverview__plan__list billingOverviewList billingOverviewList--plan">
          <Choose>
            <When condition={loading || !plans.length}>
              {
                Array.from({ length: plansLength }, (_, i) => (
                  <BillingPlanSkeleton key={i} />
                ))
              }
            </When>
            <Otherwise>
              {
                plans.map((plan) => {
                  const { planId, name, description } = plan;
                  const content = (
                    <Choose>
                      <When condition={planId === 'payg'}>
                        <PaygCounts
                          websites={websites}
                          teammates={teammates}
                          websitesCount={websitesCount}
                          teammatesCount={teammatesCount}
                          onChange={changePaygFeature}
                        />
                      </When>
                      <Otherwise>{null}</Otherwise>
                    </Choose>
                  );
                  const amount = getPlanAmount(plan, frequency, websites, teammates, true);
                  const externalStorageValue = getPlanAdditionalField(plan, frequency, 'externalStorage');
                  const externalStorage = externalStorageValue === 'true';
                  const additionalDescription = getPlanAdditionalField(plan, frequency, 'additionalDescription');
                  // we don't need to highlight active plan, if user plan is old
                  const isActivated = !activePlanIsOld && planId === activePlanId;
                  const isChecked = planId === selectedPlanId;
                  const isUserSubscribed = !!activePlanId; // used for showing 'best offer' caption
                  const isDisabledByPeriod = planId === 'payg' && checked; // disable payg plan when 'year' selected

                  // disable plan for not picsioStorage users
                  let isDisabledByStorageType = !picsioStorage && !externalStorage;

                  // allow subscribed on payg users change plan features
                  if (planId === 'payg' && activePlanId === 'payg') {
                    isDisabledByStorageType = false;
                  }

                  return (
                    <BillingPlan
                      key={planId}
                      planId={planId}
                      name={name}
                      description={description}
                      additionalDescription={additionalDescription}
                      content={content}
                      amount={amount}
                      activated={isActivated}
                      isUserSubscribed={isUserSubscribed}
                      checked={isChecked}
                      selectPlan={selectPlan}
                      disabled={isDisabledByPeriod || isDisabledByStorageType}
                    />
                  );
                })
              }
            </Otherwise>
          </Choose>
        </div>
        <If condition={plans.length}>
          <If condition={picsioStorage}>
            <BillingPlanButtons
              plans={plans}
              requestMoreStorage={requestMoreStorage}
              activePlanId={activePlanId}
            />
          </If>
          <BillingPlanFeatures plans={plans} />
        </If>
      </div>
      <If condition={isDowngradeOrFreePlan}>
        <div className="billingOverview__plan__alert">
          {'If you need to delete websites and/or teammates please contact '}
          <a className="picsioLink" href="mailto:support@pics.io">
            support@pics.io
          </a>
        </div>
      </If>
    </div>
  );
};

OverviewPlan.defaultProps = {
  plans: [],
  selectedPlanId: null,
  activePlanId: null,
  activePlanFullName: '',
  activePlanPrice: null,
  activePlanInterval: '',
  activePlanIsOld: null,
  trialEnds: null,
  subscription: {},
  isDowngradeOrFreePlan: false,
  picsioStorage: false,
  team: {},
};
OverviewPlan.propTypes = {
  loading: PropTypes.bool.isRequired,
  plans: PropTypes.arrayOf(PropTypes.shape(planPropTypes)),
  frequency: PropTypes.oneOf(frequencyTypes).isRequired,
  paygFeatures: PropTypes.shape(paygFeaturesPropTypes).isRequired,
  changePaygFeature: PropTypes.func.isRequired,
  selectedPlanId: PropTypes.string,
  selectPlan: PropTypes.func.isRequired,
  activePlanId: PropTypes.string,
  activePlanFullName: PropTypes.string,
  activePlanPrice: PropTypes.number,
  activePlanInterval: PropTypes.string,
  activePlanIsOld: PropTypes.bool,
  websitesCount: PropTypes.number.isRequired,
  teammatesCount: PropTypes.number.isRequired,
  buyCredits: PropTypes.func.isRequired,
  balance: PropTypes.number.isRequired,
  trialEnds: PropTypes.string,
  subscription: PropTypes.shape(subscriptionPropTypes),
  switchFrequency: PropTypes.func.isRequired,
  isDowngradeOrFreePlan: PropTypes.bool,
  requestMoreStorage: PropTypes.func.isRequired,
  picsioStorage: PropTypes.bool,
};

export default memo(OverviewPlan);
