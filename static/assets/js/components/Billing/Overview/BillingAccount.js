import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@picsio/ui';
import clsx from 'classnames';

import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';

import { accountRowPropTypes } from './propTypes';
import getAmountWithSign from './helpers/getAmountWithSign';
import { showDialog } from '../../dialog';

const BillingAccount = (props) => {
  const {
    rows,
    sum,
    activePlanId,
    unsubscribe,
    subscribe,
    redeemCoupon,
    disableSubmitButton,
  } = props;
  const isFreePlan = rows[0].title === 'Free plan';
  const isDisabled = (rows.length === 1 && rows[0].id === 'trial') || (!isFreePlan && sum === 0) || disableSubmitButton;

  const handleAddCoupon = useCallback(() => {
    Logger.log('User', 'SettingsBillingAddCoupon');
    Logger.log('UI', 'SettingsBillingAddCouponDialog');
    showDialog({
      title: localization.BILLING.textCouponDialogTitle,
      input: true,
      disableOk: ({ input }) => !input,
      onOk: ({ input }) => {
        Logger.log('User', 'SettingsBillingAddCouponDialogOk');
        redeemCoupon(input);
      },
      onCancel: () => Logger.log('User', 'SettingsBillingAddCouponDialogCancel'),
    });
  }, [redeemCoupon]);

  return (
    <div className="billingAccount">
      {
        rows.map(({ id, title, text, discount, discountText }) => (
          <div key={id} className={clsx('billingAccount__row', { 'billingAccount__row--discount': !!discount })}>
            <span className="billingAccount__row__name">{title}</span>
            <If condition={!!discount}>
            <span className="billingAccount__row__discount">{discountText}</span>
            </If>
            <span className="billingAccount__row__amount">{text}</span>
          </div>
        ))
      }
      <div className="billingAccount__row coupon">
        <Button onClick={handleAddCoupon} variant="text" color="primary">{localization.BILLING.textAddCoupon}</Button>
      </div>
      <div className="billingAccount__total">
        <span>{getAmountWithSign(sum)}</span>
      </div>
      <div className="billingAccount__actions">
        <If condition={activePlanId}>
          <Button onClick={unsubscribe} variant="text" size="md" color="primary">{localization.BILLING.textUnsubscribe}</Button>
        </If>
        <Button
          className="subscribeAction"
          onClick={subscribe}
          variant="contained"
          size="md"
          color="primary"
          disabled={isDisabled}
        >
          {!activePlanId ? localization.BILLING.textSelectPlan : localization.BILLING.textChangePlan}
        </Button>
      </div>
    </div>
  );
}

BillingAccount.defaultProps = {
  rows: [],
  sum: 0,
  activePlanId: null,
};
BillingAccount.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape(accountRowPropTypes)),
  sum: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  activePlanId: PropTypes.string,
  disableSubmitButton: PropTypes.bool.isRequired,
  unsubscribe: PropTypes.func.isRequired,
  subscribe: PropTypes.func.isRequired,
  redeemCoupon: PropTypes.func.isRequired,
};

export default BillingAccount;
