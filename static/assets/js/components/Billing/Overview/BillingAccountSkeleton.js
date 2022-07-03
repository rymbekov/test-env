import React from 'react';
import Skeleton from 'react-loading-skeleton';

import WithSkeletonTheme from '../../WithSkeletonTheme';

const BillingAccountSkeleton = () => (
  <div className="billingAccount billingAccount--skeleton">
    <WithSkeletonTheme>
      <div className="billingAccount__row">
        <Skeleton width={200} />
      </div>
      <div className="billingAccount__row">
        <Skeleton width={200} />
      </div>
      <div className="billingAccount__row coupon">
        <Skeleton width={200} />
      </div>
      <div className="billingAccount__total">
        <Skeleton width={100} />
      </div>
      <div className="billingAccount__actions">
        <Skeleton width={100} count={2} />
      </div>
    </WithSkeletonTheme>
  </div>
);

BillingAccountSkeleton.defaultProps = {};
BillingAccountSkeleton.propTypes = {};

export default BillingAccountSkeleton;
