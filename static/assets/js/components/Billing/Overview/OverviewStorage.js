import React, { memo } from 'react';
import PropTypes from 'prop-types';

import localization from '../../../shared/strings';
import * as utils from '../../../shared/utils';

import BillingPlan from './BillingPlan';
import BillingPlanSkeleton from './BillingPlanSkeleton';
import { storagePropTypes, frequencyTypes, disabledStoragesPropTypes } from './propTypes';

import getStorageAmount from './helpers/getStorageAmount';


const OverviewStorage = (props) => {
  const {
    loading,
    storages,
    activeStorageId,
    selectedStorageSize,
    selectStorage,
    frequency,
    disabledStorages,
    totalSize,
  } = props;
  const { disabled, message } = disabledStorages;

  return (
    <div className="billingOverview__storage">
      <div className="billingOverview__storage__toolbar billingOverviewToolbar">
        <h3 className="pageItemTitle">Storage</h3>
      </div>
      <div className="billingOverview__storage__list billingOverviewList billingOverviewList--storage">
        <Choose>
          <When condition={loading || !storages.length}>
            {
              Array.from({ length: 5 }, (_, i) => (
                <BillingPlanSkeleton key={i} type="storage" />
              ))
            }
          </When>
          <Otherwise>
            {
              storages.map((storage) => {
                const { name, maxGB } = storage;
                const { planId } = storage[frequency];
                const amount = getStorageAmount(storage, frequency);
                const isActivated = storage.month.planId  === activeStorageId || storage.year.planId  === activeStorageId;
                const isChecked = maxGB === selectedStorageSize;
                const isDisabled = disabled.includes(name);
                const tooltip = isDisabled ? message : null;
                const isGB = maxGB <= 200;
                const size = utils.convertUnit(totalSize, 'B', isGB ? 'GB' : 'TB', 2);
                const helperText = isChecked ? localization.BILLING.storageSizeUserUsing(size, isGB ? 'GB' : 'TB') : null;

                return (
                  <BillingPlan
                    key={planId}
                    planId={planId}
                    name={name}
                    amount={amount}
                    activated={isActivated}
                    checked={isChecked}
                    disabled={isDisabled}
                    selectPlan={selectStorage}
                    tooltip={tooltip}
                    helperText={helperText}
                  />
                );
              })
            }
          </Otherwise>
        </Choose>
      </div>
    </div>
  );
}

OverviewStorage.defaultProps = {
  storages: [],
  activeStorageId: null,
  selectedStorageSize: null,
  disabledStorages: [],
  totalSize: 0,
};
OverviewStorage.propTypes = {
  loading: PropTypes.bool.isRequired,
  storages: PropTypes.arrayOf(PropTypes.shape(storagePropTypes)),
  activeStorageId: PropTypes.string,
  selectedStorageSize: PropTypes.number,
  selectStorage: PropTypes.func.isRequired,
  frequency: PropTypes.oneOf(frequencyTypes).isRequired,
  disabledStorages: PropTypes.shape(disabledStoragesPropTypes),
  totalSize: PropTypes.number,
};

export default memo(OverviewStorage);
