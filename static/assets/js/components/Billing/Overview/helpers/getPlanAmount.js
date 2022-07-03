import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';
import _get from 'lodash/get';

import getValidAmount from './getValidAmount';

const getPlanAmount = (plan, frequency, websitesCount, teammatesCount, perPrice = false) => {
  if (!_isEmpty(plan)) {
    const { planId, plans } = plan;
    let amount;
    if (planId !== 'payg') {
      const frequencyPlan = _size(plans) > 1 ? plans[frequency] : plans.month;
      if (perPrice) {
        amount = _get(frequencyPlan, 'metadata.ui:price', 0);
        return amount;
      }
      amount = _get(frequencyPlan, 'amount', 0);
    } else {
      const { websites, teammates } = plan;
      const websitesSum = websitesCount * _get(websites, 'month.amount', 0);
      const teammatesSum = teammatesCount * _get(teammates, 'month.amount', 0);

      amount = websitesSum + teammatesSum;
    }

    return getValidAmount(amount);
  }
  return 0;
};

export default getPlanAmount;
