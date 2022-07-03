import PropTypes from 'prop-types';

export const frequencyTypes = ['month', 'year'];

export const planPropTypes = {
  id: PropTypes.string.isRequired,
  planId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  metadata: PropTypes.shape({
    status: PropTypes.string.isRequired,
    sortIndex: PropTypes.string.isRequired,
  }).isRequired,
  features: PropTypes.shape({
    color: PropTypes.string,
    value: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  plans: PropTypes.shape({
    month: PropTypes.objectOf(PropTypes.any),
    year: PropTypes.objectOf(PropTypes.any),
  }),
  // This two types available only in Payg
  websites: PropTypes.shape({
    month: PropTypes.objectOf(PropTypes.any),
  }),
  teammates: PropTypes.shape({
    month: PropTypes.objectOf(PropTypes.any),
  }),
};

export const storagePropTypes = {
  name: PropTypes.string.isRequired,
  maxGB: PropTypes.number.isRequired,
  month: PropTypes.shape({
    id: PropTypes.string.isRequired,
    product: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
  }).isRequired,
  year: PropTypes.shape({
    id: PropTypes.string.isRequired,
    product: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
  }).isRequired,
};

export const dataPropTypes = {
  plans: PropTypes.arrayOf(PropTypes.shape(planPropTypes)),
  storages: PropTypes.arrayOf(PropTypes.shape(storagePropTypes)),
};

export const paygFeaturesPropTypes = {
  websites: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  teammates: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export const accountRowPropTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  text: PropTypes.string,
  discount: PropTypes.number,
  discountText: PropTypes.string,
};

export const totalAccountPropTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape(accountRowPropTypes)),
  sum: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export const disabledStoragesPropTypes = {
  disabled: PropTypes.arrayOf(PropTypes.string),
  message: PropTypes.string,
};

export const cardPropTypes = {
  funding: PropTypes.string,
  brand: PropTypes.string,
  last4: PropTypes.string,
};

export const couponPropTypes = {
  id: PropTypes.string,
  duration: PropTypes.string,
  amount_off: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  percent_off: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export const subscriptionPropTypes = {
  currentPeriodEnd: PropTypes.number,
  cancellation: PropTypes.bool,
};

export const userPropTypes = {
  trialEnds: PropTypes.string,
  email: PropTypes.string,
  card: PropTypes.shape(cardPropTypes),
  balance: PropTypes.number,
  websitesCount: PropTypes.number,
  teammatesCount: PropTypes.number,
  picsioStorage: PropTypes.bool,
  totalSize: PropTypes.number,
  coupon: PropTypes.shape(couponPropTypes),
  subscription: PropTypes.shape(subscriptionPropTypes),
};

const activePlanPropTypes = {
  id: PropTypes.string,
  product: PropTypes.string,
  name: PropTypes.string,
};

export const activePlansPropTypes = {
  plan: PropTypes.shape(activePlanPropTypes),
  storage: PropTypes.shape(activePlanPropTypes),
};
