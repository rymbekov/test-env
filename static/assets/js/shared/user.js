import _get from 'lodash/get';
import convert from 'convert-units';

export const getUserStoragePlan = (user) => {
  const subscriptionItems = _get(user, 'team.stripeCustomer.subscriptions.data[0].items.data', []);

  return subscriptionItems.reduce((acc, item) => {
    const { plan } = item;
    const type = _get(plan, 'metadata.type', null)

    if (type && type === 'storage') {
      return plan;
    }
    return acc;
  }, null);
};

export const getUserStoragePlanSize = (user, unit = 'KB') => {
  const storagePlan = getUserStoragePlan(user);

  if (storagePlan) {
    const sizeGb = Number(_get(storagePlan, 'metadata.maxGB', 0));
  
    return convert(sizeGb).from('GB').to(unit);
  }
  return 0;
};