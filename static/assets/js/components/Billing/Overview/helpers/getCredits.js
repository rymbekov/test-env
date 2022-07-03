import getAmountWithSign from './getAmountWithSign';

function getCredits(balance) {
  return getAmountWithSign(Math.abs(Math.round(balance / 100)) || 0);
}

export default getCredits;
