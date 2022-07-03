import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import { InputControlLabel } from '@picsio/ui';

const BillingPlanAmount = forwardRef((props, ref) => {
  const {
    className,
    name,
    label,
    discountLabel,
    value,
    disabled,
    onChange,
  } = props;
  const classNames = clsx('billingPlan__amount', className);

  return (
    <div ref={ref} className={classNames}>
      <If condition={discountLabel}>
        <div className="discount">
          {discountLabel}
        </div>
      </If>
      <InputControlLabel
        className="billingPlan__amount__label"
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        color="inherit"
        control="radio"
      />
    </div>
  );
});

BillingPlanAmount.defaultProps = {
  className: '',
  value: false,
  discountLabel: null,
  disabled: false,
};
BillingPlanAmount.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  discountLabel: PropTypes.string,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export default BillingPlanAmount;
