import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _findIndex from 'lodash/findIndex';
import _isEmpty from 'lodash/isEmpty';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';

import OverviewPlan from './OverviewPlan';
import OverviewStorage from './OverviewStorage';
import OverviewTotal from './OverviewTotal';
import { dataPropTypes, userPropTypes, activePlansPropTypes } from './propTypes';
import usePlansReducer from './reducers/usePlansReducer';
import { navigate } from '../../../helpers/history';
import { showDialog } from '../../dialog';

import {
  getTotalAccount,
  getDisabledStorages,
  getPlanForSubscription,
  getUsingGb,
} from './helpers';

const BillingOverview = (props) => {
  const {
    loading,
    data,
    activePlans,
    user,
    fetchProducts,
    subscribe,
    buyCredits,
    requestMoreStorage,
    redeemCoupon,
    changeCard,
  } = props;
  const { plans, storages } = data;
  const activePlanId = _get(activePlans, 'plan.product', null);
  const activePlanFullName = _get(activePlans, 'plan.fullName', null);
  const activeStorageId = _get(activePlans, 'storage.id', null);
  const activePlanPrice = _get(activePlans, 'plan.amount', null);
  const activePlanInterval = _get(activePlans, 'plan.interval', null);
  const activePlanIsOld = _get(activePlans, 'plan.oldPlan', null);
  const {
    picsioStorage,
    card,
    websitesCount,
    teammatesCountIncludingPending,
    teammatesLimit,
    websitesLimit,
    balance,
    coupon,
    totalSize,
    trialEnds,
    subscription,
    team,
  } = user;
  const usingGb = getUsingGb(totalSize);
  const isLoaded = !loading && plans.length;

  const [frequency, setFrequency] = useState('month');
  const [paygFeatures, setPaygFeatures] = useState({
    websites: websitesLimit,
    teammates: teammatesLimit,
  });

  const [buyCreditsButtonClicked, setBuyCreditsButtonClicked] = useState(false);
  const [selectedPlans, { selectPlan, selectStorage }] = usePlansReducer(plans, storages, picsioStorage, !!activeStorageId);
  const selectedPlanId = _get(selectedPlans, 'plan.planId', null);
  const selectedStorageSize = _get(selectedPlans, 'storage.maxGB', null);
  const disableSubmitButton = Boolean(frequency === 'year' && selectedPlanId === 'payg');

  useEffect(() => {
    // fetchProducts(picsioStorage); // uncomment to get Billing storages
    fetchProducts();
  }, [fetchProducts, picsioStorage]);

  useEffect(() => {
    const { plan } = activePlans;
    const { interval } = plan || {};

    if (plan && interval) {
      setFrequency(interval);
    }
  }, [activePlans]);

  useEffect(() => {
    setPaygFeatures({ websites: websitesLimit || 0, teammates: teammatesLimit || 0 });
  }, [websitesLimit, teammatesLimit]);

  const changePaygFeature = useCallback(({ target }) => {
    const { name, value, min } = target;
    const num = +value;
    const validValue = value ? Math.floor(num < min ? min : num) : value;

    setPaygFeatures((prevValue) => ({
      ...prevValue,
      [name]: validValue,
    }));
  }, []);

  useEffect(() => {
    if (isLoaded && !activePlanIsOld) {
      selectPlan(activePlanId, false);

      if (picsioStorage) {
        selectStorage(activeStorageId, false);
      }
    }
  }, [isLoaded, picsioStorage]); // eslint-disable-line

  const totalAccount = useMemo(() => {
    const result = getTotalAccount(selectedPlans, frequency, paygFeatures, coupon);

    return result;
  }, [selectedPlans, frequency, paygFeatures, coupon]);

  const disabledStorages = useMemo(() => {
    const result = getDisabledStorages(selectedPlans, data, usingGb);

    return result;
  }, [selectedPlans, data, usingGb]);

  const handleSwitchFrequency = useCallback(({ target }) => {
    const { checked } = target;
    const currentFrequency = checked ? 'year' : 'month';
    Logger.log('User', 'SettingsBillingSwitchFrequency', currentFrequency);

    setFrequency(currentFrequency);
  }, []);

  const handleUnsubscribe = useCallback(() => {
    Logger.log('User', 'SettingsBillingUnsubscribe');
    navigate('/billing/cancellation');
  }, []);

  const isDowngradeOrFreePlan = useMemo(() => {
    const { plan, storage } = selectedPlans;
    const isStorage = !!storage;
    const isStorageNotFree = isStorage && storage?.month?.amount > 0;

    if (plan) {
      const { planId: selectedProductId, id } = plan;
      if (id === 'free') {
        // check for Pics.io not free storage
        if (isStorage && isStorageNotFree) return false;

        return true;
      }

      const result = _findIndex(plans, { planId: selectedProductId }) < _findIndex(plans, { planId: activePlanId });

      return result;
    }
    return false;
  }, [plans, selectedPlans, activePlanId]);

  const isRequiresMarketplaceApproval = useMemo(() => {
    const { plan } = selectedPlans;
    if (plan) {
      const { metadata: { requiresMarketplaceApproval } } = plan;
      if (requiresMarketplaceApproval) {
        return true;
      }
    }

    return false;
  }, [selectedPlans]);

  const handleSubscribe = useCallback(async () => {
    const { websites, teammates } = paygFeatures;
    const { plan } = selectedPlans;
    const { planId: selectedProductId } = plan;
    const planForSubscription = getPlanForSubscription(selectedPlans, frequency, paygFeatures);
    const { planId, storagePlanId, fullName } = planForSubscription;
    Logger.log('User', 'SettingsBillingSubscribe', { name: fullName });

    if (isRequiresMarketplaceApproval) {
      navigate(`/billing/personal/${selectedProductId}`);
    } else if (isDowngradeOrFreePlan) {
      navigate(`/billing/downgrade/${selectedProductId}`);
    } else {
      const allowSubscribe = () => {
        subscribe({
          planId,
          storagePlanId,
          subscriptionOptions: {
            websitesLimit: websites,
            teammatesLimit: teammates,
          },
          plan: planForSubscription,
          totalAccount,
        });
      };

      if (!card) {
        allowSubscribe();
      } else {
        Logger.log('UI', 'SettingsBillingChangeSubscriptionDialog');
        showDialog({
          title: localization.BILLING.confirmationTitle,
          icon: 'notification',
          textBtnOk: localization.DIALOGS.btnYes,
          textBtnCancel: localization.DIALOGS.btnNo,
          text: localization.BILLING.confirmationChangePlan(fullName),
          onOk: () => {
            Logger.log('User', 'SettingsBillingChangeSubscriptionDialogOk');
            allowSubscribe();
          },
          onCancel: () => Logger.log('User', 'SettingsBillingChangeSubscriptionDialogCancel'),
        });
      }
    }
  }, [subscribe, isDowngradeOrFreePlan, card, frequency, selectedPlans, paygFeatures, totalAccount]);

  useEffect(() => {
    if (!_isEmpty(user.card) && buyCreditsButtonClicked) {
      showDialog({
        title: localization.BILLING.titleBuyCredits,
        text: localization.BILLING.textEnterAmount,
        input: {
          placeholder: localization.BILLING.placeholderNumber,
          value: '',
        },
        textBtnCancel: localization.DIALOGS.btnCancel,
        textBtnOk: localization.BILLING.textBuy,
        disableOk: ({ input }) => !input,
        onOk({ input }) {
          Logger.log('User', 'SettingsBillingBuyCreditsDialogOk');
          buyCredits(input);
        },
        onCancel: () => Logger.log('User', 'SettingsBillingBuyCreditsDialogCancel'),
      });
      setBuyCreditsButtonClicked(false);
    }
  }, [buyCreditsButtonClicked, user.card, buyCredits]);

  const handleAddCard = useCallback(() => {
    changeCard('add');
  }, [changeCard]);

  const handleBuyCredits = useCallback(() => {
    Logger.log('User', 'SettingsBillingBuyCredits');
    Logger.log('UI', 'SettingsBillingBuyCreditsDialog');
    if (_isEmpty(user.card)) {
      setBuyCreditsButtonClicked(true);
      handleAddCard();
    } else {
      showDialog({
        title: localization.BILLING.titleBuyCredits,
        text: localization.BILLING.textEnterAmount,
        input: {
          placeholder: localization.BILLING.placeholderNumber,
          value: '',
        },
        textBtnCancel: localization.DIALOGS.btnCancel,
        textBtnOk: localization.BILLING.textBuy,
        disableOk: ({ input }) => !input,
        onOk({ input }) {
          Logger.log('User', 'SettingsBillingBuyCreditsDialogOk');
          buyCredits(input);
        },
        onCancel: () => Logger.log('User', 'SettingsBillingBuyCreditsDialogCancel'),
      });
    }
  }, [buyCredits, user.card]);

  const handleRequestMoreStorage = useCallback(
    () => {
      const planForSubscription = getPlanForSubscription(selectedPlans, frequency, paygFeatures);
      const { fullName } = planForSubscription;
      Logger.log('User', 'SettingsBillingRequestStorage', { name: fullName });
      requestMoreStorage({ fullName });
    },
    [requestMoreStorage, frequency, paygFeatures, selectedPlans],
  );

  return (
    <div className="billingOverview">
      <OverviewPlan
        loading={loading}
        plans={plans}
        activePlanId={activePlanId}
        activePlanFullName={activePlanFullName}
        activePlanPrice={activePlanPrice}
        activePlanInterval={activePlanInterval}
        activePlanIsOld={activePlanIsOld}
        selectedPlanId={selectedPlanId}
        selectPlan={selectPlan}
        frequency={frequency}
        paygFeatures={paygFeatures}
        changePaygFeature={changePaygFeature}
        websitesCount={websitesCount}
        teammatesCount={teammatesCountIncludingPending}
        buyCredits={handleBuyCredits}
        balance={balance}
        trialEnds={trialEnds}
        subscription={subscription}
        switchFrequency={handleSwitchFrequency}
        isDowngradeOrFreePlan={isDowngradeOrFreePlan}
        requestMoreStorage={handleRequestMoreStorage}
        picsioStorage={picsioStorage}
        team={team}
      />
      <If condition={false && picsioStorage}> {/* remove false to show OverviewStorage */}
        <OverviewStorage
          loading={loading}
          storages={storages}
          activeStorageId={activeStorageId}
          selectedStorageSize={selectedStorageSize}
          selectStorage={selectStorage}
          frequency={frequency}
          disabledStorages={disabledStorages}
          totalSize={totalSize}
        />
      </If>
      <OverviewTotal
        loading={loading}
        totalAccount={totalAccount}
        selectedPlanId={selectedPlanId}
        activePlanId={activePlanId}
        unsubscribe={handleUnsubscribe}
        subscribe={handleSubscribe}
        redeemCoupon={redeemCoupon}
        disableSubmitButton={disableSubmitButton}
      />
    </div>
  );
};

BillingOverview.defaultProps = {
  activePlans: {},
  user: {},
};
BillingOverview.propTypes = {
  loading: PropTypes.bool.isRequired,
  data: PropTypes.shape(dataPropTypes).isRequired,
  fetchProducts: PropTypes.func.isRequired,
  activePlans: PropTypes.shape(activePlansPropTypes),
  user: PropTypes.shape(userPropTypes),
  subscribe: PropTypes.func.isRequired,
  buyCredits: PropTypes.func.isRequired,
  requestMoreStorage: PropTypes.func.isRequired,
  redeemCoupon: PropTypes.func.isRequired,
  changeCard: PropTypes.func.isRequired,
};

export default BillingOverview;
