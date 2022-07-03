import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useStore } from 'react-redux';
import pluralize from 'pluralize';
import sdk from '../../sdk';
import ScreenWarning from '../ScreenWarning';
import Logger from '../../services/Logger';
import WithSkeletonTheme from '../WithSkeletonTheme';
import * as utils from '../../shared/utils';
import { back } from '../../helpers/history';
import { showDialog } from '../dialog';

export default function () {
  const [isProcessing, setProcessing] = useState(false);
  const store = useStore();
  const assetsCount = store.getState().collections.collections.my.count || 0;
  const websitesCount = store.getState().collections.collections.websites.nodes.length || 0;
  const customFieldsCount = store.getState().customFields.items.length;
  const keywordsCount = store.getState().keywords.all.length;
  const teammatesCount = store.getState().teammates.items.length;

  const { user } = store.getState();
  const { discount } = user.customer;
  let discountText = null;
  if (discount && discount.coupon) {
    if (discount.coupon.amount_off) {
      discountText = `$${discount.coupon.amount_off / 100}`;
    } else if (discount.coupon.percent_off) {
      discountText = `${discount.coupon.percent_off}%`;
    }
  }

  useEffect(() => {
    Logger.log('UI', 'BillingCancellationWarningScreen');
  }, []);

  const showSuccessDialog = () => {
    Logger.log('UI', 'BillingCancellationWarningSuccessDialog');
    const text = 'We’ve received your cancellation request. Our Support Team will contact you shortly.';

    showDialog({
      title: 'Attention!',
      text,
      textBtnCancel: null,
      onOk: () => {
        Logger.log('User', 'BillingCancellationWarningSuccessDialogOk');
        back('/search');
      },
    });
  };

  const onSubmit = async () => {
    const { subscription } = user.customer;
    const currentPlan = utils.getUserPlan(user.customer);
    let planName = currentPlan && (currentPlan.name || currentPlan.nickname);
    if (subscription.metadata && subscription.metadata.type === 'payg') planName = 'Pay as you go';
    if (!planName) planName = 'Unknown';

    try {
      setProcessing(true);
      await sdk.users.planCancellation({ name: planName });
      setProcessing(false);
      showSuccessDialog();
    } catch (error) {
      Logger.error(
        new Error('Error processing plan cancellation request'),
        { error, showDialog: true },
        'PlanCancellationFails',
        (error && error.message) || 'NoMessage',
      );
    }
  };

  const renderSkeleton = () => (
    <WithSkeletonTheme>
      <p>
        <Skeleton count={2} />
      </p>
      <ul className="warningList">
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
        <li>
          <Skeleton />
        </li>
      </ul>
      <p>
        <Skeleton count={2} />
      </p>
      <p>
        <Skeleton count={2} />
      </p>
    </WithSkeletonTheme>
  );

  const text = (
    <>
      {isProcessing ? (
        renderSkeleton()
      ) : (
        <>
          <p>
            You’re going to unsubscribe from Pics.io service. Please note that cancelling your billing plan will cause
            the following:
          </p>
          <ul className="warningList">
            <li>your account will be deactivated;</li>
            <li>ALL THE DATA related to your and your teammates’ profiles will be deleted beyond retrieval;</li>
            <li>
              you will lose access to {assetsCount > 1 && 'all'} {pluralize('asset', assetsCount, true)} within your
              library;
            </li>
            <li>
              your {pluralize('custom field', customFieldsCount, true)} and {pluralize('keyword', keywordsCount, true)}{' '}
              will be removed from our database without a possibility of restoration;
            </li>
            <li>
              all the information created within the system (settings, revisions, comments, roles, saved searches) will
              be deleted forever;
            </li>
            <li>
              {websitesCount > 1 && 'all'} your {pluralize('website', websitesCount, true)} will stop working once the
              subscription is cancelled;
            </li>
            <li>your {pluralize('teammate', teammatesCount, true)} will lose access to the system;</li>
            <li>you won’t be able to renew your current billing plan if the pricing increases in future;</li>
            {discountText && (
              <li>you won’t be able to use your special discount of {discountText} on your current billing plan;</li>
            )}
          </ul>
          <p>
            If you agree to all the above-mentioned information and understand the consequences, click on ‘Request
            account cancellation’.
          </p>
          <p>
            We strongly recommend contacting us at{' '}
            <a href="mailto:support@pics.io" className="picsioLink">
              support@pics.io
            </a>{' '}
            for further discussion before making the final decision on your subscription cancellation.
          </p>
        </>
      )}
    </>
  );
  return (
    <ScreenWarning
      warningTitle="Subscription cancellation warning!"
      warningIcon="error"
      text={text}
      screenTitle="Request account cancellation"
      textBtnOk="Request account cancellation"
      textBtnCancel="Close"
      onOk={onSubmit}
    />
  );
}
