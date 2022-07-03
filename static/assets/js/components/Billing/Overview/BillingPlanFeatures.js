import React from 'react';
import { useToggle } from 'react-use';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import { Icon } from '@picsio/ui';
import { Ok, Close } from '@picsio/ui/dist/icons';
import Logger from '../../../services/Logger';
import planFeatures from '../configs/planFeatures';
import { planPropTypes } from './propTypes';

const BillingPlanFeatures = (props) => {
  const [opened, toggleopened] = useToggle(false);
  const {
    plans,
  } = props;

  const handleOpener = (e) => {
    e.stopPropagation();
    Logger.log('User', 'TogglePlanFeatures', !opened);
    toggleopened();
  };

  return (
    <div className="billingOverview__plan__features">
      <If condition={opened}>
        {
          Object.keys(planFeatures).map((key) => (
            <div
              className="billingOverview__plan__features-row billingOverviewList billingOverviewList--plan"
              data-name={planFeatures[key].name}
              key={key}
            >
              {plans.map((plan) => {
                const { plans: { month: { features = {} } = {} } = {} } = plan;

                return (
                  <div className="billingOverview__plan__features-column" key={plan.planId + key}>
                    <Choose>
                      <When condition={features[key]?.value === 'true'}>
                        <Icon className="planFeatureOk" size="md" color="inherit">
                          <Ok />
                        </Icon>
                      </When>
                      <When condition={features[key]?.value === 'false'}>
                        <Icon className="planFeatureFalse" size="lg" color="inherit">
                          <Close />
                        </Icon>
                      </When>
                      <Otherwise>
                        <span className={clsx({ planFeatureFalse: features[key]?.color === 'negative' })}>
                          {features[key]?.value}
                        </span>
                      </Otherwise>
                    </Choose>
                  </div>
                );
              })}
            </div>
          ))
        }
      </If>
      <div className="billingOverview__plan__features-opener" onClick={handleOpener}>
        <span
          onClick={handleOpener}
          onKeyPress={handleOpener}
          role="button"
          tabIndex={0}
        >
          <Choose>
            <When condition={opened}>less details</When>
            <Otherwise>more details</Otherwise>
          </Choose>
        </span>
      </div>
    </div>
  );
};

BillingPlanFeatures.defaultProps = {};
BillingPlanFeatures.propTypes = {
  plans: PropTypes.arrayOf(PropTypes.shape(planPropTypes)).isRequired,
};

export default BillingPlanFeatures;
