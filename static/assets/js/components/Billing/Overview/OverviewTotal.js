import React, { memo } from 'react';
import PropTypes from 'prop-types';

import BillingAccount from './BillingAccount';
import BillingAccountSkeleton from './BillingAccountSkeleton';
import { totalAccountPropTypes } from './propTypes';

const OverviewTotal = (props) => {
  const {
    loading,
    totalAccount,
    selectedPlanId,
    activePlanId,
    unsubscribe,
    subscribe,
    redeemCoupon,
    disableSubmitButton,
  } = props;
  const { rows, sum } = totalAccount;

  return (
    <div className="billingOverview__total">
      <div className="billingOverview__total__account">
        <Choose>
          <When condition={loading}>
            <BillingAccountSkeleton />
          </When>
          <Otherwise>
            <BillingAccount
              rows={rows}
              sum={sum}
              selectedPlanId={selectedPlanId}
              activePlanId={activePlanId}
              unsubscribe={unsubscribe}
              subscribe={subscribe}
              redeemCoupon={redeemCoupon}
              disableSubmitButton={disableSubmitButton}
            />
          </Otherwise>
        </Choose>
      </div>
    </div>
  );
}

OverviewTotal.defaultProps = {
  selectedPlanId: null,
  activePlanId: null,
};
OverviewTotal.propTypes = {
  loading: PropTypes.bool.isRequired,
  totalAccount: PropTypes.shape(totalAccountPropTypes).isRequired,
  selectedPlanId: PropTypes.string,
  activePlanId: PropTypes.string,
  unsubscribe: PropTypes.func.isRequired,
  subscribe: PropTypes.func.isRequired,
  redeemCoupon: PropTypes.func.isRequired,
  disableSubmitButton: PropTypes.bool.isRequired,
};

export default memo(OverviewTotal);
