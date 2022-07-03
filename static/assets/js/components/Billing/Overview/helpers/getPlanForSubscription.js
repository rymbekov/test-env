import _get from 'lodash/get';

function getPlanForSubscription({ plan, storage }, frequency, { websites, teammates }) {
  const { id, name } = plan;
  const storagePlanId = _get(storage, [frequency, 'id'], null);
  const storageAmount = _get(storage, [frequency, 'amount'], 0);
  const isFree = id === 'free';
  const isPayg = id === 'payg';
  const fullName = isFree || isPayg
    ? name
    : `${name} ${frequency === 'month' ? '(Monthly)' : '(Yearly)'}`;

  if (isPayg) {
    const {
      websites: {
        month: {
          amount: mounthAmount,
        },
      },
      teammates: {
        month: {
          amount: teamAmount,
        },
      },
    } = plan;
    const amount = (websites * mounthAmount) + (teammates * teamAmount) + storageAmount;

    return {
      id,
      planId: id,
      storagePlanId,
      fullName,
      name: fullName,
      amount,
      interval: 'month',
    };
  }

  const { plans } = plan;
  const { id: planId, amount, interval } = plans[frequency] || plans.month;

  return {
    id,
    planId,
    storagePlanId,
    fullName,
    name,
    amount: amount + storageAmount,
    interval,
  };
}

export default getPlanForSubscription;
