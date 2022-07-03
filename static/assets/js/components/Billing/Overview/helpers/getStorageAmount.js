import _isEmpty from 'lodash/isEmpty';

import getValidAmount from './getValidAmount';

const getPlanAmount = (storage, frequency) => {
  if (!_isEmpty(storage)) {
    const { amount } = storage[frequency];

    if (!amount) {
      return 'Free';
    }
    return getValidAmount(amount);
  }
  return 0;
};

export default getPlanAmount;
