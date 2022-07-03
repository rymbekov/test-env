import React from 'react';
import Icon from '../../Icon';
import localization from '../../../shared/strings';
import StripeFooter from '../StripeFooter';

export default function EmptyInvoices() {
  return (
    <div className="pageContainer">
      <div className="pageTabsContentInvoices">
        <div className="pageTabsContentInvoices__items">
          <div className="notice">
            <div className="notice__icon">
              <Icon name="invoice" />
            </div>
            <div className="notice__text">{localization.BILLING.invoiceNone}</div>
          </div>
        </div>
        <StripeFooter />
      </div>
    </div>
  );
}
