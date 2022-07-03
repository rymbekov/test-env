import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import Tooltip from '../../Tooltip';
import Logger from '../../../services/Logger';
import * as utils from '../../../shared/utils';

import BillingPlanAmount from './BillingPlanAmount';

import getAmountWithSign from './helpers/getAmountWithSign';

const BillingPlan = (props) => {
  const {
    className,
    planId,
    name,
    additionalDescription,
    description,
    content,
    amount,
    activated,
    checked,
    disabled,
    selectPlan,
    helperText,
    tooltip,
    discount,
    isUserSubscribed,
  } = props;
  const isDiscountAllowed = discount && typeof amount === 'number' && amount;
  const isBestOffer = !isUserSubscribed && name.toLowerCase() === 'micro';
  const classNames = clsx('billingPlan', className, {
    'billingPlan--activated': activated,
    'billingPlan--checked': checked,
    'billingPlan--disabled': disabled,
    'billingPlan--discount': isDiscountAllowed,
    'billingPlan--best': isBestOffer,
  });
  const label = getAmountWithSign(amount);
  const discountLabel = isDiscountAllowed ? getAmountWithSign((amount * discount) / 100) : null;

  const handleChange = () => {
    Logger.log('User', 'SettingsBillingSwitchPlan', name);
    selectPlan(planId);
  };

  const billingAmountRender = (
    <div className="billingPlan__footer">
      <BillingPlanAmount
        label={label}
        discountLabel={discountLabel}
        name={planId}
        onChange={handleChange}
        value={checked}
        disabled={disabled}
      />
      <If condition={additionalDescription}>
        <div className="billingPlan__content-additional">
          <p dangerouslySetInnerHTML={{ __html: utils.sanitizeXSS(additionalDescription) }} />
        </div>
      </If>
    </div>
  );

  return (
    <div className={classNames} role="presentation">
      <If condition={isBestOffer}>
        <div className="billingPlan__caption">Best offer</div>
      </If>
      <div className="billingPlan__name">
        <h3>{name}</h3>
      </div>
      <div className="billingPlan__content">
        <If condition={description}>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: description }} />
        </If>
        <If condition={content}>{content}</If>
      </div>
      <Choose>
        <When condition={tooltip}>
          <Tooltip
            className="billingPlan__tooltip"
            content={<p dangerouslySetInnerHTML={{ __html: tooltip }} />}
            placement="top"
          >
            {billingAmountRender}
          </Tooltip>
        </When>
        <Otherwise>{billingAmountRender}</Otherwise>
      </Choose>
      <If condition={helperText}>
        <div className="billingPlan__helperText">{helperText}</div>
      </If>
    </div>
  );
};

BillingPlan.defaultProps = {
  className: '',
  additionalDescription: '',
  description: '',
  content: null,
  amount: null,
  activated: false,
  checked: false,
  disabled: false,
  helperText: '',
  tooltip: null,
  discount: 0,
  externalStorage: false,
  isUserSubscribed: false,
};
BillingPlan.propTypes = {
  className: PropTypes.string,
  planId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  additionalDescription: PropTypes.string,
  description: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  activated: PropTypes.bool,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  selectPlan: PropTypes.func.isRequired,
  helperText: PropTypes.string,
  tooltip: PropTypes.string,
  discount: PropTypes.number,
  externalStorage: PropTypes.bool,
  isUserSubscribed: PropTypes.bool,
};

export default BillingPlan;
