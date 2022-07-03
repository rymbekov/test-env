import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import cronstrue from 'cronstrue';
import _find from 'lodash/find';

import Skeleton from 'react-loading-skeleton';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';

import ScreenWarning from '../ScreenWarning';
import WithSkeletonTheme from '../WithSkeletonTheme';

import { dataPropTypes, userPropTypes, activePlansPropTypes } from '../Billing/Overview/propTypes';

const getDiscountText = (coupon) => {
  let discountText = null;

  if (coupon) {
    if (coupon.amount_off) {
      discountText = `$${coupon.amount_off / 100}`;
    } else if (coupon.percent_off) {
      discountText = `${coupon.percent_off}%`;
    }
  }
  return discountText;
};

const checkPlanSelected = (plan, subscription = {}) => (plan && !subscription.cancelPeriodEnd);

const getTextButton = (isFreePlan, isPlanSelected) => {
  if (isFreePlan) {
    if (isPlanSelected) {
      return 'Request downgrade to Free plan';
    }
    return 'Request subscribing to Free plan';
  }
  return 'Downgrade';
};

const getPlanMetadata = (selectedPlan) => {
  if (selectedPlan) {
    const { id, plans, websites } = selectedPlan;

    if (id === 'payg') {
      return websites.month.metadata;
    }
    return plans.month.metadata;
  }
  return {};
};

function ScreenPlanDowngrade(props) {
  const {
    loading,
    downgrading,
    error,
    data: {
      plans,
    },
    activePlans,
    user,
    fetchProducts,
    downgrade,
  } = props;
  const url = window.location.pathname;
  const routePlanId = url.substring(url.lastIndexOf('/') + 1);
  const { plan } = activePlans;
  const selectedPlan = _find(plans, { planId: routePlanId });
  const { id, name } = selectedPlan || {};
  const metadata = getPlanMetadata(selectedPlan);
  const isFreePlan = id === 'free';
  const isPaygPlan = id === 'payg';
  const { subscription, coupon } = user;

  const discountText = getDiscountText(coupon);
  const isPlanSelected = checkPlanSelected(plan, subscription);
  const textButton = getTextButton(isFreePlan, isPlanSelected);

  useEffect(() => {
    fetchProducts(false);

    Logger.log('UI', 'BillingDowngradeWarningScreen', utils.getScreenUrl());
  }, [fetchProducts]);

  const onSubmit = () => {
    let currentPlanName = '';
    if (plan) {
      currentPlanName = plan.name;
    }

    downgrade({
      currentPlanName, newPlanName: name, isFreePlan, isPlanSelected,
    });
  };

  const renderSkeleton = () => (
    <WithSkeletonTheme>
      <p>
        <Skeleton count={2} />
      </p>
      <ul className="warningList">
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
      </ul>
      <p>
        <Skeleton count={2} />
      </p>
      <p>
        <Skeleton count={2} />
      </p>
    </WithSkeletonTheme>
  );

  const renderFreePlanText = () => (
    <>
      <Choose>
        <When condition={isPlanSelected}>
          <p>
            Please note that you’re going to downgrade to the {name} plan which is different from your current
            package and has a huge range of limitations in the functionalities:
          </p>
        </When>
        <Otherwise>
          <p>
            You’re going to subscribe to the Free package. Please note some of the functionalities are limited/disabled on
            the Free plan and differ from the ones available during your trial period. Please carefully explore the plan’s
            characteristics before subscribing. You will lose access to the following features:
          </p>
        </Otherwise>
      </Choose>
      <ul className="warningList">
        <li>No teammates are included in the plan</li>
        <li>No websites are included in the plan</li>
        <li>Number of assets in your account is limited to {metadata.assetsLimit / 1000}k</li>
        <li>Number of keywords is limited to {metadata.keywordsLimit}</li>
        {isPlanSelected && <li>AI keywording for ${metadata.pricePer1000Keywords / 100}/1000 images</li>}
        <li>Inboxes feature is disabled</li>
        <li>Analytics & reporting functionality is not available</li>
        <li>Single asset sharing functionality is not available</li>
        <li>Custom fields functionality is not available</li>
        <li>Comparison tool is not available</li>
        <li>Only Google Drive generated thumbnails are available</li>
        <li>
          Metadata included in files is not captured and saved to Pics.io during uploading or synchronizing your files
        </li>
        <li>Any changes made on your assets in Pics.io are not saved back to the original Google Drive files</li>
        <li>No auto-sync functionality</li>
        <li>Manual sync is available every {metadata.manualSyncFreezePeriodInMinutes} minutes</li>
        <li>Amazon S3 storage option is not available</li>
        <li>Integrations with third-party apps is not available</li>
        <li>No chat support</li>
        <li>Email support with 72 hours turnaround.</li>
      </ul>
      <If condition={discountText}>
        <p>
          Besides, the special discount of {discountText} on your current package won’t be applied to a new billing
          plan.
        </p>
      </If>
      <Choose>
        <When condition={isPlanSelected}>
          <p>
            If you’re not sure about your decision, please contact our Support Team, so we can discuss your business needs
            and suggest the best option for you.
            <br />
            <br />
            In case you agree to the above-mentioned conditions and understand all the consequences, click on ‘Request
            downgrade to Free plan’.
          </p>
        </When>
        <Otherwise>
          <p>
            If you still want to proceed with subscribing to the Free plan, click ‘Request subscribing to Free plan‘.
            <br />
            <br />
            In case you’re not sure about your decision, feel free to contact us at{' '}
            <a href="mailto:support@pics.io" className="picsioLink">
              support@pics.io
            </a>{' '}
            with any questions.
          </p>
        </Otherwise>
      </Choose>
    </>
  );

  const renderPaygPlanText = () => (
    <>
      <p>
        You’re going to downgrade to the Pay as you go plan, which is different from your current package and has a
        range of limitations in the functionalities:
      </p>
      <ul className="warningList">
        <li>Each additional teammate will cost $18/month</li>
        <li>Each additional website will cost $12/month</li>
        <li>Single asset sharing is limited to 10</li>
        <li>AI keywording for $20/1000 images</li>
        {metadata.inboxes === 'false' && <li>Inboxes feature is not available</li>}
        {metadata.assetAnalytics === 'false' && <li>Analytics & reporting functionality is not available</li>}
        <li>No auto-sync functionality</li>
        <li>Manual sync is available every {metadata.manualSyncFreezePeriodInMinutes} minutes</li>
        <li>Amazon S3 storage option is not available</li>
        <li>Integrations with Slack, Zapier, Webhooks and Google Workspace tools are only available </li>
        <li>No customer success manager support</li>
        <li>Online chat is available with 4 hours turnaround</li>
      </ul>
    </>
  );

  const renderStandartPlanText = () => (
    <>
      <p>
        You’re going to downgrade to {name} plan which has a range of different limitations. The following
        restrictions will be applied upon downgrading:
      </p>
      <ul className="warningList">
        <li>Number of teammates is limited to {metadata.teammatesLimit}</li>
        <li>Number of websites is limited to {metadata.websitesLimit}</li>
        <li>Number of inboxes is limited to {metadata.inboxesLimit}</li>
        {metadata.branding === 'false' && <li>No Branding feature is available</li>}
        {metadata.scheduledAutoSyncCron === 'false' && (
          <>
            <li>No auto-sync functionality</li>
            <li>Manual sync is available every {metadata.manualSyncFreezePeriodInMinutes} minutes</li>
          </>
        )}
        {metadata.scheduledAutoSyncCron && (
          <li>Auto-sync occurs {cronstrue.toString(metadata.scheduledAutoSyncCron).toLowerCase()}</li>
        )}
        <li>
          Activity logs are kept for{' '}
          {metadata.retentionPeriod === '7'
            ? '7 days'
            : pluralize('month', Math.round(metadata.retentionPeriod / 30), true)}
        </li>
        {metadata.teammateAnalytics === 'false' && <li>Analytics is not available on Team and Asset levels</li>}
        <li>AI keywording for ${metadata.pricePer1000Keywords / 100}/1000 images</li>
      </ul>
    </>
  );

  const text = (
    <>
      {error ? (
        localization.SERVER_ERROR.title + localization.SERVER_ERROR.text
      ) : (
        <>
          {loading || downgrading ? (
            renderSkeleton()
          ) : (
            <>
              {isFreePlan ? (
                renderFreePlanText()
              ) : (
                <>
                  {isPaygPlan ? renderPaygPlanText() : renderStandartPlanText()}

                  {discountText && (
                    <p>
                      Besides, the special discount of {discountText} on your current package won’t be applied to a new
                      billing plan.
                    </p>
                  )}
                  <p>
                    If you’re not sure about your decision, we can suggest a special discount that exactly suits your
                    business needs. Please contact us at{' '}
                    <a href="mailto:support@pics.io" className="picsioLink">
                      support@pics.io
                    </a>{' '}
                    to discuss the details.
                  </p>
                  <p>
                    If you agree to the above-mentioned conditions and understand all the consequences, click on
                    ‘Downgrade’.
                  </p>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );

  return (
    <ScreenWarning
      warningTitle={isFreePlan ? 'Free plan limitations!' : 'Subscription downgrade warning!'}
      warningIcon="error"
      text={text}
      screenTitle={isFreePlan ? 'Request free plan' : 'Request downgrade'}
      textBtnOk={textButton}
      textBtnCancel="Cancel"
      onOk={onSubmit}
    />
  );
}

ScreenPlanDowngrade.defaultProps = {
  activePlans: {},
  user: {},
};
ScreenPlanDowngrade.propTypes = {
  loading: PropTypes.bool.isRequired,
  downgrading: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  data: PropTypes.shape(dataPropTypes).isRequired,
  fetchProducts: PropTypes.func.isRequired,
  activePlans: PropTypes.shape(activePlansPropTypes),
  user: PropTypes.shape(userPropTypes),
  downgrade: PropTypes.func.isRequired,
};

export default ScreenPlanDowngrade;
