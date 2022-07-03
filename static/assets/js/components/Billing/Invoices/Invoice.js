import React from 'react';
import {
  string, number, boolean, shape,
} from 'prop-types';

import Icon from '../../Icon';
import dayjs from 'dayjs';

import localization from '../../../shared/strings';

function handleDownloadClick(invoiceId) {
  window.open(`/billing/invoices/${invoiceId}`, '_blank');
}

export default function Invoice({ invoice }) {
  const date = dayjs(invoice.date * 1000).format('ll');
  const subscriptionData = invoice.lines.data.find((n) => n.type === 'subscription');
  const description = subscriptionData
    ? `${localization.BILLING.invoiceSubscriptionTo} ${subscriptionData.plan.name}`
    : `${localization.BILLING.invoiceInvoiceFrom} ${date}`;
  const upcoming = invoice.date * 1000 > Date.now();
  const refunded = invoice.charge && invoice.charge.amount_refunded && invoice.charge.amount_refunded > 0;

  let total = invoice.total + invoice.starting_balance;
  if (refunded) {
    total -= invoice.charge.amount_refunded;
  }
  if (total <= 0) total = 0;
  else total /= 100;

  const title = invoice.lines.data
    .map((n) => n.description)
    .filter((n) => n)
    .join('. ');

  return (
    <div className="pageTabsContentInvoices__item" title={title}>
      <div className="pageTabsContentInvoices__date">{date}</div>
      <div className="pageTabsContentInvoices__amount">{`$${total}`}</div>
      <div className="pageTabsContentInvoices__desc">{description}</div>
      <div
        className={`pageTabsContentInvoices__status pageTabsContentInvoices__status--${invoice.paid ? 'paid' : 'unpaid'
        }`}
      >
        <div>
          <Choose>
            <When condition={invoice.paid}>{localization.BILLING.statusPaid}</When>
            <When condition={upcoming}>{localization.BILLING.statusUpcoming}</When>
            <Otherwise>{localization.BILLING.statusUnpaid}</Otherwise>
          </Choose>
        </div>
        {invoice.id && (
        <div
          role="button"
          tabIndex={0}
          className="downloadInvoiceBtn"
          onClick={() => handleDownloadClick(invoice.id)}
          onKeyPress={() => handleDownloadClick(invoice.id)}
        >
          <Icon name="download" />
        </div>
        )}
      </div>
    </div>
  );
}

Invoice.propTypes = {
  invoice: shape({
    id: string,
    date: number,
    total: number,
    starting_balance: number,
    paid: boolean,
    charge: shape({
      amount_refunded: number,
    }),
  }).isRequired,
};
