function getCouponAmount(coupon) {
  if (coupon) {
    const { amount_off: amountOf, percent_off: percentOff } = coupon;

    if (amountOf) {
      return amountOf;
    }
    if (percentOff) {
      return percentOff;
    }
  }
  return 0;
}

export default getCouponAmount;
