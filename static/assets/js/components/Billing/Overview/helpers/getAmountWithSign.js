const getAmountWithSign = (amount, sign = '$', position = 'start') => {
  if (typeof amount === 'string') {
    return amount;
  }
  if (position === 'start') {
    return `${sign}${amount}`;
  }
  return `${amount}${sign}`;
};

export default getAmountWithSign;
