import { createSelector } from 'reselect';
import _get from 'lodash/get';
import _find from 'lodash/find';

const userSelector = (state) => state.user;
const billingPlansSelector = (state) => _get(state, 'billing.data.plans', []);
const subscriptionItemsSelector = (state) => _get(state, 'user.customer.subscription.items.data', []);

export const getActivePlansSelector = createSelector(
  subscriptionItemsSelector,
  billingPlansSelector,
  (subscriptionItems, billingPlans) => {
    const activePlans = subscriptionItems.reduce((acc, item) => {
      const { plan } = item;
      const {
        id, product, metadata, amount, interval,
      } = plan;
      const { type } = metadata;
      const isPayg = type === 'payg';
      const isStorage = type === 'storage';

      const planId = isPayg ? 'payg' : id;
      const oldPlan = !isPayg && !billingPlans.find((p) => (p.planId === plan.id
        || p.plans[interval]?.id === plan.id));
      const productId = isPayg ? planId : product;
      const billingPlan = _find(billingPlans, { planId: productId }) || {};
      const { id: billingPlanId, name } = billingPlan;
      // @TODO: we can not to found plan name for old plans (< 2019).
      // When we remove all old planes we need to uncomment second line and remove first

      let fullName = plan.name;
      if (name) {
        if (billingPlanId === 'free' || billingPlanId === 'payg') {
          fullName = name;
        } else {
          fullName = `${name} ${interval === 'month' ? '(Monthly)' : '(Yearly)'}`;
        }
      }

      if (isStorage) {
        return {
          ...acc,
          storage: {
            id: planId,
            product: productId,
            metadata,
            interval,
          },
        };
      }
      return {
        ...acc,
        plan: {
          id: planId,
          product: productId,
          name,
          fullName,
          metadata,
          interval,
          oldPlan,
          amount,
        },
      };
    }, {});

    return activePlans;
  },
);

export const getUser = createSelector(userSelector, (user) => {
  const {
    trialEnds,
    email,
    picsioStorage,
    subscriptionFeatures: {
      teammatesCount = 0,
      teammatesCountIncludingPending = 0,
      websitesCount = 0,
      teammatesLimit = 0,
      websitesLimit = 0,
      totalSize = 0,
    },
    customer: {
      balance, discount, card = {}, subscription = {},
    },
    team,
  } = user;
  const { coupon } = discount || {};
  const {
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: cancelPeriodEnd,
  } = subscription;

  return {
    trialEnds,
    email,
    picsioStorage,
    card,
    coupon,
    // uncomment for coupon testing
    // coupon: {"id":"PICSIO_STORAGE_50POFF_ONEYEAR","object":"coupon","amount_off":null,"created":1615891753,"currency":null,"duration":"repeating","duration_in_months":12,"livemode":false,"max_redemptions":null,"metadata":{},"name":"PICSIO_STORAGE_50POFF_ONEYEAR","percent_off":50,"redeem_by":null,"times_redeemed":10,"valid":true},
    teammatesCount,
    teammatesCountIncludingPending,
    websitesCount,
    teammatesLimit,
    websitesLimit,
    balance,
    totalSize,
    subscription: {
      currentPeriodEnd,
      cancelPeriodEnd,
    },
    team,
  };
});

export default {
  getActivePlansSelector,
  getUser,
};
