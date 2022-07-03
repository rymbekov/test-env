import React from 'react';
import ErrorBoundary from '../../ErrorBoundary';
import sdk from '../../../sdk';
import localization from '../../../shared/strings';
import StripeFooter from '../StripeFooter';
import SkeletonInvoices from './SkeletonInvoices';
import EmptyInvoices from './EmptyInvoices';
import Invoice from './Invoice';

export default class Invoices extends React.Component {
  state = {
    invoices: null,
  };

  async componentDidMount() {
    const { invoices } = this.state;
    if (!invoices) {
      try {
        const { data: fetchedInvoices } = await sdk.users.fetchInvoices();
        this.setState({ invoices: fetchedInvoices });
      } catch (err) {
        console.error(err);
      }
    }
  }

  render() {
    const { invoices } = this.state;

    if (invoices === null) {
      return <SkeletonInvoices />;
    }

    if (!invoices || !invoices.length) {
      return <EmptyInvoices />;
    }
    return (
      <div className="pageContainer">
        <div className="pageTabsContentInvoices">
          <div className="pageItemTitle">{localization.BILLING.titleInvoices}</div>
          <div className="pageTabsContentInvoices__table">
            <div className="pageTabsContentInvoices__head">
              <div className="pageTabsContentInvoices__date">{localization.BILLING.invoiceThDate}</div>
              <div className="pageTabsContentInvoices__amount">{localization.BILLING.invoiceThAmount}</div>
              <div className="pageTabsContentInvoices__desc">{localization.BILLING.invoiceThDescription}</div>
              <div className="pageTabsContentInvoices__status">{localization.BILLING.invoiceThStatus}</div>
            </div>
            <div className="pageTabsContentInvoices__items">
              <ErrorBoundary className="errorBoundaryComponent">
                {invoices.map((invoice) => (<Invoice invoice={invoice} key={invoice.id} />))}
              </ErrorBoundary>
            </div>
          </div>
          <StripeFooter />
        </div>
      </div>
    );
  }
}
