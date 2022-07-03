import React from 'react';
import localization from '../../../shared/strings';
import * as utils from '../../../shared/utils';
import './stripeFooter.scss';

export default function StripeFooter() {
  return (
    <div className="stripeFooter">
      <div className="stripeFooterHolder">
        <div className="stripeFooterLogo">
          <span className="stripeFooterLogoTop">{localization.BILLING.textPoweredBy}</span>
          <span className="stripeFooterLogoBottom">Stripe</span>
        </div>
        <div
          className="stripeFooterText"
          dangerouslySetInnerHTML={{
            __html: utils.sanitizeXSS(
              `${localization.BILLING.textPaymentNote} ${localization.BILLING.textPaymentNoteHandled}<br /><br />${localization.BILLING.textInfo}`,
            ),
          }}
        />
      </div>
    </div>
  );
}
