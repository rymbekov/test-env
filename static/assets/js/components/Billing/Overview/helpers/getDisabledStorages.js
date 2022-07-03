import _map from 'lodash/map';

import localization from '../../../../shared/strings';

function getDisabledStorages(selectedPlans, { storages }, usingGb) {
  const { plan } = selectedPlans;

  if (storages.length) {
    if (plan) {
      const { id } = plan;

      if (id === 'free') {
        return {
          disabled: [storages[0].name],
          message: localization.BILLING.storageDisabledByPlan,
        };
      }
    }
    if (usingGb) {
      const filtered = storages.filter(({ maxGB }) => {
        if (usingGb > maxGB) {
          return true;
        }
        return false;
      });
      const disabled = _map(filtered, 'name');

      if (disabled.length) {
        return {
          disabled,
          message: localization.BILLING.storageDisabledBySize,
        };
      }
    }
  }
  return {
    disabled: [],
    message: '',
  };
}

export default getDisabledStorages;
