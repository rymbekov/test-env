import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';
import _get from 'lodash/get';

const getPlanAdditionalField = (product, frequency, fieldName) => {
  if (!_isEmpty(product)) {
    const { plans } = product;

    const frequencyPlan = _size(plans) > 1 ? plans[frequency] : plans.month;

    return _get(frequencyPlan, fieldName, '');
  }

  return '';
};

export default getPlanAdditionalField;
