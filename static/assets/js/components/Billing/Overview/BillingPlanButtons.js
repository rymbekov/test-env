import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@picsio/ui';
import localization from '../../../shared/strings';

const BillingPlanButtons = (props) => {
  const {
    plans,
    requestMoreStorage,
    activePlanId,
  } = props;

  const handleRequestMoreStorageClick = () => {
    requestMoreStorage();
  };

  return (
    <div className="billingOverviewList billingOverview__plan__buttons billingOverviewList--plan">
      {
        plans.map((plan) => {
          const { planId } = plan;
          const isActivated = planId === activePlanId;

          return (
            <div className="billingOverview__plan__buttons-column" key={planId}>
              <Choose>
                <When condition={isActivated}>
                  <Button
                    className="billingCard__button"
                    variant="contained"
                    component="button"
                    color="primary"
                    size="md"
                    onClick={handleRequestMoreStorageClick}
                    fullWidth
                  >
                    {localization.BILLING.textRequestMoreStorage}
                  </Button>
                </When>
                <Otherwise>{null}</Otherwise>
              </Choose>
            </div>
          );
        })
      }
    </div>

  );
};

BillingPlanButtons.defaultProps = {
  activePlanId: '',
};
BillingPlanButtons.propTypes = {
  activePlanId: PropTypes.string,
  requestMoreStorage: PropTypes.func.isRequired,
};

export default BillingPlanButtons;
