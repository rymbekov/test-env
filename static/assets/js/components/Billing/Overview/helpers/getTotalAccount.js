import getPlanAmount from './getPlanAmount';
import getStorageAmount from './getStorageAmount';
import getCouponAmount from './getCouponAmount';
import getAmountWithSign from './getAmountWithSign';

const getCouponDiscount = (coupon) => {
  if (coupon) {
    const amount = getCouponAmount(coupon);
    const isPlanDiscount = coupon.id.includes('PLAN');
    const isStorageDiscount = coupon.id.includes('STORAGE');

    return {
      amount,
      forPlan: isPlanDiscount,
      forStorage: isStorageDiscount,
      percentOff: coupon.percent_off,
    };
  }
  return {
    amount: 0,
  };
}

const getDiscount = (id, amount, couponDiscount) => {
  const forPlan = id === 'plan';
  const { amount: discountAmount, percentOff } = couponDiscount;

  if (forPlan && couponDiscount.forPlan || !forPlan && couponDiscount.forStorage) {
    if (percentOff) {
      return amount - (amount * (discountAmount / 100));
    }
    return amount - discountAmount;
  }
  return 0;
}

const getSum = (rows) => rows.reduce((acc, row) => {
  if (row.id === 'discount') {
    return acc;
  }
  if (row.discount) {
    return acc + row.discount;
  }
  return acc + row.amount;
}, 0);

function getTotalAccount(plans, frequency, paygFeatures, coupon) {
  const { websites, teammates } = paygFeatures;
  const { plan, storage } = plans;
  const couponDiscount = getCouponDiscount(coupon);
  const rows = [];

  if (plan) {
    const amount = getPlanAmount(plan, frequency, websites, teammates);
    const discount = getDiscount('plan', amount, couponDiscount);

    rows.push({
      id: 'plan',
      title: `${plan.name} plan`,
      amount,
      text: getAmountWithSign(amount),
      discount,
      discountText: getAmountWithSign(discount),
    });
  } else {
    rows.push({
      id: 'trial',
      title: 'Trial',
      amount: getAmountWithSign(0),
    });
  }

  if (storage) {
    const amount = getStorageAmount(storage, frequency);
    const validAmount = typeof amount === 'string' ? 0 : amount;
    const discount = getDiscount('storage', amount, couponDiscount);

    rows.push({
      id: 'storage',
      title: `${storage.name} Pics.io storage`,
      amount: validAmount,
      text: getAmountWithSign(validAmount),
      discount,
      discountText: getAmountWithSign(discount),
    });
  }
  if (coupon) {
    const isPercent = couponDiscount.percentOff;
    const sign = !isPercent ? '$' : '%';
    const position = !isPercent ? 'start' : 'end';
    const { amount } = couponDiscount;

    rows.push({
      id: 'discount',
      title: `Discount`,
      amount,
      text: `${getAmountWithSign(couponDiscount.amount, sign, position)}`,
    });
  }
  const sum = getSum(rows);

  return { rows, sum };
};

export default getTotalAccount;
