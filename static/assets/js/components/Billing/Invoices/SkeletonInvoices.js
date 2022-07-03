import React from 'react';
import Skeleton from 'react-loading-skeleton';
import WithSkeletonTheme from '../../WithSkeletonTheme';
import localization from '../../../shared/strings';

export default function SkeletonInvoices() {
  return (
    <div className="pageContainer">
      <div className="pageItemTitle">{localization.BILLING.titleInvoices}</div>
      <WithSkeletonTheme>
        <div className="pageTabsContentInvoices">
          <div className="pageTabsContentInvoices__table">
            <div className="pageTabsContentInvoices__head">
              <div className="pageTabsContentInvoices__date">
                <Skeleton width={35} />
              </div>
              <div className="pageTabsContentInvoices__amount">
                <Skeleton width={60} />
              </div>
              <div className="pageTabsContentInvoices__desc">
                <Skeleton width={75} />
              </div>
              <div className="pageTabsContentInvoices__status">
                <Skeleton width={40} />
              </div>
            </div>
            <div className="pageTabsContentInvoices__items">
              {[1, 2, 3].map((item) => (
                <SkeletonInvoice key={item} />
              ))}
            </div>
          </div>
        </div>
      </WithSkeletonTheme>
    </div>
  );
}

function SkeletonInvoice() {
  return (
    <div className="pageTabsContentInvoices__item">
      <div className="pageTabsContentInvoices__date">
        <Skeleton height={16} />
      </div>
      <div className="pageTabsContentInvoices__amount">
        <Skeleton />
      </div>
      <div className="pageTabsContentInvoices__desc">
        <Skeleton />
      </div>
      <div className="pageTabsContentInvoices__status">
        <Skeleton />
      </div>
    </div>
  );
}
