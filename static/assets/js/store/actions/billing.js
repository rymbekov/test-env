import { createAsyncThunk } from '@reduxjs/toolkit';

import { isUnauthorized } from '../helpers/user';
import { back, navigate, reloadApp } from '../../helpers/history';
import { showDialog, showErrorDialog } from '../../components/dialog';

import {
  normalizeProducts,
  showValidateCardForm,
  sendDataToTrackerService,
} from './helpers/billing';

export const fetchProducts = createAsyncThunk(
  'billing/fetchProducts',
  async (payload, { extra: { api } }) => {
    const result = await api.billing.getProducts(payload);

    if (payload) {
      return normalizeProducts(result);
    }
    return normalizeProducts({ products: result });
  },
);

export const subscribe = createAsyncThunk(
  'billing/subscribe',
  async (
    payload,
    {
      getState, rejectWithValue, extra: {
        api, utils, localization, UiBlocker, Toast, Logger,
      },
    },
  ) => {
    Logger.log('User', 'SettingsBillingChangeSubscribe');
    const { plan, totalAccount, ...data } = payload;
    const {
      id: planId, name: planName, interval, amount,
    } = plan;
    const { sum } = totalAccount;
    const stripePlan = {
      panelLabel: localization.BILLING.checkoutSubscribe,
      name: planName,
      amount,
    };
    const { user } = getState();
    const {
      customer: { card },
    } = user;

    try {
      UiBlocker.block(localization.BILLING.textPaymentLoadingDetails);

      if (!card) {
        const { id: tokenId } = await showValidateCardForm({
          user,
          plan: stripePlan,
          amount: sum * 100,
        });

        if (tokenId) {
          data.tokenId = tokenId;
        } else {
          throw new Error('tokenId is undefined');
        }
      }

      UiBlocker.block(localization.BILLING.textPaymentFinishing);

      const subscription = await api.billing.subscribe(data);
      const { id } = subscription;

      sendDataToTrackerService(id, planId, planName, interval, sum);

      if (isUnauthorized(user)) {
        const userDialogueMessage = localization.BILLING.textTextSubcriptionRenewed;
        Logger.log('UI', 'ChangeSubscribeSuccessDialog', { userDialogueMessage });
        showDialog({
          title: localization.BILLING.textTitleThanks,
          text: userDialogueMessage,
          textBtnCancel: null,
          textBtnOk: localization.BILLING.textBtnGoToLibrary,
          onOk: () => reloadApp(),
          onCancel: () => reloadApp(),
        });
      } else {
        const userDialogueMessage = localization.BILLING.textPlanChangedSuccess;
        Logger.log('UI', 'ChangeSubscribeSuccess', { userDialogueMessage });
        Toast(userDialogueMessage);
      }

      UiBlocker.block(localization.BILLING.textDetailsSaving);

      const result = {
        subscription,
      };

      if (data.planId === 'payg') {
        result.subscriptionFeatures = {
          ...user.subscriptionFeatures,
          ...data.subscriptionOptions,
        };
      }

      return result;
    } catch (err) {
      const errorSubcode = utils.getDataFromResponceError(err, 'subcode');
      let userDialogueMessage = '';
      if (errorSubcode === 'NextPlanLimitsError') {
        userDialogueMessage = localization.BILLING.DIALOG_LIMITS_EXCEEDED.text;
        const dialogData = {
          title: localization.BILLING.DIALOG_LIMITS_EXCEEDED.title,
          text: userDialogueMessage,
          textBtnCancel: localization.DIALOGS.btnOk,
          textBtnOk: null,
        };
        if (user?.subscriptionFeatures?.chatSupport) {
          dialogData.textBtnCancel = localization.DIALOGS.btnCancel;
          dialogData.textBtnOk = localization.BILLING.DIALOG_LIMITS_EXCEEDED.btnOk;
          dialogData.onOk = () => window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
          dialogData.id = 'itemliveSupport';
        }
        Logger.log('User', 'ChangeSubscribeFailedDialog', { userDialogueMessage });
        showDialog(dialogData);
      }
      if (err.message === 'tokenId is undefined') {
        userDialogueMessage = localization.BILLING.textCardCantCheck;
        Logger.log('User', 'ChangeSubscribeFailedDialog', { userDialogueMessage });
        showErrorDialog(userDialogueMessage);
      }
      Logger.error(new Error('Subscribe to plan failed'), { error: err }, [
        'SubscribeBillingPlanFailed',
        { errorMessage: (err && err.message) || 'NoMessage', userDialogueMessage },
      ]);
      return rejectWithValue(err);
    } finally {
      UiBlocker.unblock();
    }
  },
);

export const unsubscribe = createAsyncThunk(
  'billing/unsubscribe',
  async (payload, { extra: { api, Logger } }) => {
    Logger.log('User', 'SettingsBillingChangeUnsubscribe');
    const result = await api.billing.unsubscribe(payload);

    return result;
  },
);

export const changeCard = createAsyncThunk(
  'billing/changeCard',
  async (
    payload,
    {
      getState, rejectWithValue, extra: {
        api, UiBlocker, Toast, localization, utils, Logger,
      },
    },
  ) => {
    const { user } = getState();

    const stripePlan = {
      id: 'validatecard',
      name: !payload ? localization.BILLING.textCardChange : localization.BILLING.textCardAdd,
      allowRememberMe: false,
      amount: 0,
      panelLabel: localization.BILLING.textValidate,
    };

    try {
      UiBlocker.block(localization.BILLING.textCardDetailsLoading);
      Logger.log('UI', 'SettingsBillingCardAddDialog');
      const card = await showValidateCardForm({ user, plan: stripePlan });
      if (!card) {
        throw new Error('card is undefined');
      }

      UiBlocker.block(localization.BILLING.textCardSaving);

      const { customer, errors, msg } = await api.billing.changeCard(card);
      if (errors) {
        throw new Error(msg);
      }

      Logger.log('UI', 'SettingsBillingCardAdded');
      Toast(localization.BILLING.textCardChanged);

      return customer;
    } catch (e) {
      const userDialogueMessage = localization.BILLING.textCardCantCheck;
      Logger.log('UI', 'SettingsBillingCantCheckCardDialog', {
        userDialogueMessage,
      });
      showErrorDialog(userDialogueMessage);

      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  },
);

export const buyCredits = createAsyncThunk(
  'billing/buyCredits',
  async (payload, {
    rejectWithValue, extra: {
      api, localization, utils, Spinner, Logger,
    },
  }) => {
    const spinner = new Spinner({
      parentEl: document.querySelector('.wrapperPicsioApp'),
      classList: ['partial'],
      styleList: {
        'z-index': '1100',
      },
    });

    try {
      const { resultBalance } = await api.billing.credits(payload);

      const userDialogueMessage = `${localization.BILLING.textYouBought(payload)} $${
        (resultBalance * -1) / 100
      }`;
      Logger.log('UI', 'SettingsBillingBuyCreditsCompleteDialog', { userDialogueMessage });
      showDialog({
        title: localization.BILLING.titleTransactionComplete,
        text: userDialogueMessage,
        textBtnCancel: null,
      });

      return resultBalance;
    } catch (e) {
      const errorMessage = utils.getDataFromResponceError(e, 'msg');
      const userDialogueMessage = errorMessage || localization.BILLING.textTryAgain;
      Logger.log('UI', 'SettingsBillingBuyCreditsFailedDialog', { userDialogueMessage });
      showDialog({
        title: localization.BILLING.titleTransactionFailed,
        text: userDialogueMessage,
        textBtnCancel: null,
      });

      return rejectWithValue(e);
    } finally {
      spinner.destroy();
    }
  },
);

export const redeemCoupon = createAsyncThunk(
  'billing/redeemCoupon',
  async (
    coupon,
    {
      getState, rejectWithValue, extra: {
        api, utils, UiBlocker, Toast, localization, Logger,
      },
    },
  ) => {
    try {
      UiBlocker.block(localization.BILLING.textCouponApplying);

      if (coupon === '15FPOFF' || coupon === '10FPOFF' || coupon === '5FPOFF') {
        const { user } = getState();
        const { isTeammate, team } = user;
        const currentUser = isTeammate ? team : user;
        const {
          createdAt,
          subscriptionFeatures: { planId },
        } = currentUser;
        const today = new Date();
        const startDate = -today.daysAgo(createdAt) < 30;

        if (planId !== 'trial' && !startDate) {
          throw new Error('coupon is expired');
        }
      }
      const result = await api.billing.redeemCoupon(coupon);

      Logger.log('UI', 'SettingsBillingAddCouponSuccess');
      Toast(
        `${localization.BILLING.textCoupon} ${coupon} ${localization.BILLING.textCouponSuccess}`,
      );

      return result;
    } catch (e) {
      if (e.message === 'coupon is expired') {
        const userDialogueMessage = `${localization.BILLING.textCoupon} ${coupon} ${localization.BILLING.textCouponCant}`;
        Logger.log('UI', 'SettingsBillingAddCouponFailedDialog', { userDialogueMessage });
        showErrorDialog(userDialogueMessage);
      } else {
        const userDialogueMessage = `${localization.BILLING.textCoupon} ${coupon} ${localization.BILLING.textCouponCant2}`;
        Logger.log('UI', 'SettingsBillingAddCouponFailedDialog', { userDialogueMessage });
        showErrorDialog(userDialogueMessage);
      }
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  },
);

export const downgrade = createAsyncThunk(
  'billing/downgrade',
  async (payload, { rejectWithValue, extra: { api, utils, Logger } }) => {
    const {
      currentPlanName, newPlanName, isFreePlan, isPlanSelected,
    } = payload;

    try {
      if (isFreePlan && !isPlanSelected) {
        await api.billing.freeRequest(newPlanName);
      } else {
        await api.billing.downgrade(currentPlanName, newPlanName);
      }
      // eslint-disable-next-line no-nested-ternary
      const action = isFreePlan
        ? isPlanSelected
          ? 'downgrade to Free plan'
          : 'subscribing to Free plan'
        : 'plan downgrade';
      const text = `We’ve received your ${action} request. Our Support Team will contact you shortly.`;

      Logger.log('UI', 'BillingDowngradeWarningSuccessDialog', { userDialogueMessage: text });
      showDialog({
        title: 'Attention!',
        text,
        textBtnCancel: null,
        onOk: () => {
          Logger.log('User', 'BillingDowngradeWarningSuccessDialogOk');

          if (isFreePlan) {
            navigate('/billing?tab=overview');
          } else {
            back('/search');
          }
        },
        onCancel: () => Logger.log('User', 'BillingDowngradeWarningSuccessDialogCancel'),
      });

      return true;
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

export const requestMoreStorage = createAsyncThunk(
  'billing/requestMoreStorage',
  async (payload = {}, {
    getState, rejectWithValue, extra: {
      api, Logger, localization, UiBlocker, Toast,
    },
  }) => {
    const { fullName } = payload;
    const { user: { subscriptionFeatures } } = getState();
    let planName = fullName;

    if (!planName) {
      planName = subscriptionFeatures.planName;
    }

    try {
      UiBlocker.block(localization.BILLING.textProcessingRequest);
      await api.billing.storageRequest(planName);

      const userDialogueMessage = localization.BILLING.textStorageRequest;
      Logger.log('UI', 'BillingRequestStorageSuccessDialog', { userDialogueMessage });

      if (subscriptionFeatures?.chatSupport) {
        Toast(userDialogueMessage, { position: 'top-right' });
        window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
        window.Intercom('show');
      } else {
        Toast(userDialogueMessage);
      }

      return true;
    } catch (e) {
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  },
);

export const requestMigration = createAsyncThunk(
  'billing/requestMigration',
  async (payload, {
    getState, rejectWithValue, extra: {
      api, Logger, localization, UiBlocker, Toast,
    },
  }) => {
    const { storageName } = payload;

    try {
      UiBlocker.block(localization.BILLING.textProcessingRequest);
      await api.billing.migrationRequest(storageName);
      const userDialogueMessage = localization.STORAGE.textMigrationRequestSent();
      Logger.log('UI', 'BillingRequestMigrationSuccessToast');

      const { user: { subscriptionFeatures } } = getState();
      if (subscriptionFeatures?.chatSupport) {
        Toast(userDialogueMessage, { position: 'top-right' });
        window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
        window.Intercom('show');
      } else {
        Toast(userDialogueMessage);
      }

      return true;
    } catch (e) {
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  },
);

export const buyKeywords = createAsyncThunk(
  'billing/buyKeywords',
  async (payload, {
    rejectWithValue, extra: {
      api, localization, UiBlocker, Logger, Toast,
    },
  }) => {
    try {
      UiBlocker.block(localization.BILLING.textProcessingRequest);
      const newKeywordsAmount = await api.billing.buyKeywords(payload);
      if (newKeywordsAmount) {
        Logger.log('UI', 'CreditsPurchaseSuccessToast');
        Toast(localization.STORAGE.textCreditsBuySuccess(payload));
      }
      return newKeywordsAmount;
    } catch (e) {
      return rejectWithValue(e);
    } finally {
      UiBlocker.unblock();
    }
  },
);

export default {
  fetchProducts,
  subscribe,
  unsubscribe,
  changeCard,
  buyCredits,
  redeemCoupon,
  downgrade,
  requestMoreStorage,
  buyKeywords,
};
