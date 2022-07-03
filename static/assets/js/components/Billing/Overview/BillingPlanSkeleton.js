import React from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';

import WithSkeletonTheme from '../../WithSkeletonTheme';

const BillingPlanSkeleton = (props) => {
  const { type } = props;

  return (
    <div className="billingPlan billingPlan--skeleton">
      <WithSkeletonTheme>
        <Choose>
          <When condition={type === 'plan'}>
            <div className="billingPlan__name">
              <Skeleton width={100} />
            </div>
            <div className="billingPlan__content">
              <p>
                <Skeleton count={2} />
                <br />
                +
                <br />
                <Skeleton />
              </p>
            </div>
            <div className="billingPlan__amount">
              <Skeleton width={100} />
            </div>
          </When>
          <When condition={type === 'storage'}>
            <div className="billingPlan__name">
              <Skeleton width={100} />
            </div>
            <div className="billingPlan__amount">
              <Skeleton width={100} />
            </div>
          </When>
          <Otherwise>{null}</Otherwise>
        </Choose>
      </WithSkeletonTheme>
    </div>
  );
}

BillingPlanSkeleton.defaultProps = {
  type: 'plan',
};
BillingPlanSkeleton.propTypes = {
  type: PropTypes.oneOf(['plan', 'storage']),
};

export default BillingPlanSkeleton;
