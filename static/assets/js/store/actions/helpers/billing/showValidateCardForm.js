import config from '../../../../../../../config';
import localization from '../../../../shared/strings';
import UIBlocker from '../../../../services/UiBlocker';
import Logger from '../../../../services/Logger';

function showValidateCardForm(params) {
  return new Promise((res, rej) => {
    let error = '';

    if (!params) error = 'params is required.';
    if (!params.plan) error = 'params.plan is required.';
    if (!params.user) error = 'params.user is required.';

    const { email } = params.user;
    if (!email) error = 'params.user.email is required.';

    if (error) {
      rej(new Error(error));
    }
    const handler = StripeCheckout.configure({
      key: config.payments.stripe.PUBLISHABLE_KEY,
      image: config.payments.stripe.FORM_IMAGE,
      token(token) {
        if (!token) {
          rej(localization.BILLING.textCantValidateCard);
        } else {
          res(token);
        }
      },
      opened: UIBlocker.unblock.bind(UIBlocker),
      closed: UIBlocker.unblock.bind(UIBlocker),
    });

    // Open Checkout with options based on passed plan
    // need to prefill plan with current user email
    const checkoutConfig = params.plan;
    checkoutConfig.email = email;
    checkoutConfig.amount = params.amount;

    Logger.log('UI', 'ValidateCardFormDialog');
    handler.open(checkoutConfig);
  });
};

export default showValidateCardForm;
