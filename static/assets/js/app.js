/** For chunks */
// eslint-disable-line
// import { hot } from 'react-hot-loader/root';

// IMPORTANT: these libs should be imported firstly
import 'regenerator-runtime/runtime'; // need to use async await

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Device } from '@capacitor/device';
import { toast } from 'react-toastify';
import { bindActionCreators } from 'redux';
import Q from 'q';
import picsioConfig from '../../../config';
import PubSubService from './services/PubSubService';
import localization from './shared/strings';
import ua from './ua';
import * as utils from './shared/utils';
/** Store */
import store from './store';
import { getKeywords, sort } from './store/actions/keywords';
import { get } from './store/actions/customFields';
import {
  selectAll,
  deselectAll,
  changeFlag,
  changeRating,
  changeColor,
  getWatermarks,
} from './store/actions/assets';
import {
  toggleDetails,
  toggleImport,
  changeTree,
  setPanelSize,
  setIsWebpSupported,
} from './store/actions/main';
import { getLightboards } from './store/actions/lightboards';
import { getInboxes } from './store/inboxes/actions';
import { getNotifications, fetchJobsStatus } from './store/actions/notifications';
import { setRecursiveSearch, getCollections } from './store/actions/collections';
import { getSavedSearches } from './store/actions/savedSearches';
import { addToDownloadList } from './store/actions/downloadList';
import { getUser, updateUser } from './store/actions/user';
import { isHaveTeammatePermission, logout } from './store/helpers/user';
import { getRoles } from './store/reducers/roles';
import { getTeam } from './store/reducers/teammates';

import { showDownloadDialog } from './helpers/fileDownloader';
import checkUserEventSubscription from './helpers/checkUserEventSubscription';

import UiBlocker from './services/UiBlocker';
import Logger from './services/Logger';
import BrowserNotifications from './services/BrowserNotifications';

import initMobileNotifications from './helpers/initMobileNotifications';

import { setUserDateLocale } from './shared/dateLocale';
import { initShortcuts } from './components/Shortcuts';
import '../css/styles.scss';
import { navigate, replace, reloadApp } from './helpers/history';
import { showDialog } from './components/dialog';

const webRoot = document.getElementById('webRoot');
__webpack_public_path__ = webRoot ? webRoot.textContent : null;

const getCustomFieldsAction = bindActionCreators({ get }, store.dispatch).get;
const keywordsActions = bindActionCreators({ getKeywords, sort }, store.dispatch);
const lightboardsActions = bindActionCreators({ getLightboards }, store.dispatch);
const inboxesActions = bindActionCreators({ getInboxes }, store.dispatch);
const notificationsActions = bindActionCreators(
  { getNotifications, fetchJobsStatus },
  store.dispatch,
);
const collectionsActions = bindActionCreators(
  { getCollections, setRecursiveSearch },
  store.dispatch,
);
const savedSearchesActions = bindActionCreators({ getSavedSearches }, store.dispatch);
const userActions = bindActionCreators({ getUser, updateUser }, store.dispatch);
const rolesActions = bindActionCreators({ getRoles }, store.dispatch);
const teamActions = bindActionCreators({ getTeam }, store.dispatch);

const assetsActions = bindActionCreators(
  {
    selectAll, deselectAll, changeFlag, changeRating, changeColor, getWatermarks,
  },
  store.dispatch,
);
const mainActions = bindActionCreators(
  {
    toggleDetails, toggleImport, changeTree, setPanelSize, setIsWebpSupported,
  },
  store.dispatch,
);
const downloadListActions = bindActionCreators({ addToDownloadList }, store.dispatch);

function GetDataError(message, code, err) {
  this.name = 'GetDataError';
  this.message = message || 'Get data error';
  this.code = code || 'getDataError';
  this.err = err || null;
  this.stack = (new Error()).stack;
}
GetDataError.prototype = Object.create(Error.prototype);
GetDataError.prototype.constructor = GetDataError;

const app = {
  logout() {
    showDialog({
      title: localization.DIALOGS.LOGOUT_DIALOG.TITLE,
      text: localization.DIALOGS.LOGOUT_DIALOG.TEXT,
      textBtnCancel: localization.DIALOGS.LOGOUT_DIALOG.CANCEL_TEXT,
      textBtnOk: localization.DIALOGS.LOGOUT_DIALOG.OK_TEXT,
      onOk() {
        window.Intercom('shutdown');

        const detailsPanelEditable = utils.LocalStorage.get('picsio.detailsPanelEditable') || {};
        if (detailsPanelEditable.unlockLogout === true) {
          detailsPanelEditable.unlockLogout = false;
          detailsPanelEditable.lockAlways = true;
          utils.LocalStorage.set('picsio.detailsPanelEditable', detailsPanelEditable);
        }

        utils.setCookie('picsio.user_id', '');

        logout()
          .then(() => {
            /** wait until send event to analytics */
            setTimeout(() => {
              UiBlocker.unblock();
              if (ua.isPWA()) {
                window.location = '/app';
              } else if (ua.isMobileApp()) {
                window.location = '/appmobile';
              } else {
                window.location = '/';
              }
            }, 350);
          })
          .catch(console.error.bind(console));
      },
    });
  },

  /**
   * Upsert user at Intercom by opening session
   */
  startIntercomSession(user) {
    const { customer } = user;
    const { subscriptionFeatures } = user;

    // user_id or email is required by Intercom
    const payload = {
      user_id: user._id,
      name: user.displayName,
      email: user.email,
      created_at: new Date(user.createdAt).getTime() / 1000, // Signup date as a Unix timestamp
    };

    let deviceType = 'desktop';
    if (ua.isMobileApp()) {
      const platform = ua.getPlatform();
      if (platform) {
        deviceType = `${utils.capitalizeFirstLetter(platform)}App`;
      }
    } else if (window.innerWidth < 1024) {
      deviceType = 'mobile';
    }

    payload.device_type = deviceType;

    // to avoid uses interlapping, enable user hashing
    if (store.getState().user.intercomHMAC) {
      payload.user_hash = user.intercomHMAC;
    }

    // add extra info to payload to see this in Intercom admin
    payload['working folder'] = user.workingFolderId;

    if (customer) {
      payload.stripe_id = customer && customer.id;
      const currentPlan = utils.getUserPlan(customer) || {};
      payload.stripe_plan = currentPlan.name;
    }

    if (subscriptionFeatures) {
      payload['teammates count'] = subscriptionFeatures.teammatesCount || 0;
      payload['websites count'] = subscriptionFeatures.websitesCount || 0;
    }

    window.Intercom('update', payload);
    if (!store.getState().user.intercomUser) {
      userActions.updateUser({ intercomUser: true }, false);
    }
  },

  delegateGlobalEvents() {
    // enable Q long stack traces
    Q.longStackSupport = true;

    // when laptop wakes up and when connection was broken and then runs again
    const toastId = {};
    if (picsioConfig.isMainApp()) {
      window.addEventListener('online', () => {
        Logger.info('window online');
        toast.dismiss(toastId.current);
      });
    }

    window.addEventListener('offline', () => {
      Logger.info('window offline');
      toastId.current = toast.warn(
        'Seems you are offline. Please check your internet connection.',
        {
          toastId,
          autoClose: false,
        },
      );
    });

    window.addEventListener('images:dropped', assetsActions.deselectAll, false);

    window.addEventListener(
      'import:uploading:progress',
      (e) => this.renderToolbarProgress(e.detail),
      false,
    );
    window.addEventListener(
      'import:downloading:progress',
      (e) => this.renderToolbarProgress(e.detail),
      false,
    );
    window.addEventListener(
      'preview:uploading:progress',
      (e) => this.renderToolbarProgress(e.detail),
      false,
    );

    window.addEventListener('toolbar:ui:logout', this.logout, false);
    window.addEventListener('toolbar:ui:tutorials', this.tutorials, false);

    window.addEventListener(
      'toolbar:ui:liveSupport',
      () => {
        // to avoid automatic Intercom user creation at app visit
        // instead of this we are creating intercom user when they are open messenger for first time
        // this will save us a bit of bucks
        Logger.log('User', 'LiveChat', utils.getScreenUrl());
        if (picsioConfig.intercom.enabled) {
          this.startIntercomSession(store.getState().user);
        } else {
          window.open('mailto:flt8xv4y@incoming.intercom.io', '_blank');
        }
      },
      false,
    );

    window.addEventListener('hardError', (e) => this.onHardError(e.detail.data), false);
    window.addEventListener('softError', (e) => this.onSoftError(e.detail.data), false);
  },

  runHotkeysListeners() {
    window.addEventListener('hotkeys:catalog:commandA', this.cmdAselectedChecker, false);
    window.addEventListener('hotkeys:catalog:commandD', () => showDownloadDialog(), false);

    window.addEventListener(
      'hotkeys:catalog:commandP',
      this.setFlagForSelectedImages.bind(this, 'flagged'),
      false,
    );
    window.addEventListener(
      'hotkeys:catalog:commandX',
      this.setFlagForSelectedImages.bind(this, 'rejected'),
      false,
    );
    window.addEventListener(
      'hotkeys:catalog:commandU',
      this.setFlagForSelectedImages.bind(this, 'unflagged'),
      false,
    );

    window.addEventListener(
      'hotkeys:catalog:alt1',
      this.setRatingForSelectedImages.bind(this, 1),
      false,
    );
    window.addEventListener(
      'hotkeys:catalog:alt2',
      this.setRatingForSelectedImages.bind(this, 2),
      false,
    );
    window.addEventListener(
      'hotkeys:catalog:alt3',
      this.setRatingForSelectedImages.bind(this, 3),
      false,
    );
    window.addEventListener(
      'hotkeys:catalog:alt4',
      this.setRatingForSelectedImages.bind(this, 4),
      false,
    );
    window.addEventListener(
      'hotkeys:catalog:alt5',
      this.setRatingForSelectedImages.bind(this, 5),
      false,
    );

    if (ua.browser.family === 'Safari') {
      window.addEventListener(
        'hotkeys:catalog:alt6',
        this.setColorForSelectedImages.bind(this, 'red'),
        false,
      );
      window.addEventListener(
        'hotkeys:catalog:alt7',
        this.setColorForSelectedImages.bind(this, 'yellow'),
        false,
      );
      window.addEventListener(
        'hotkeys:catalog:alt8',
        this.setColorForSelectedImages.bind(this, 'green'),
        false,
      );
      window.addEventListener(
        'hotkeys:catalog:alt9',
        this.setColorForSelectedImages.bind(this, 'blue'),
        false,
      );
      window.addEventListener(
        'hotkeys:catalog:alt0',
        this.setColorForSelectedImages.bind(this, 'nocolor'),
        false,
      );
    } else {
      window.addEventListener(
        'hotkeys:catalog:command6',
        this.setColorForSelectedImages.bind(this, 'red'),
        false,
      );
      window.addEventListener(
        'hotkeys:catalog:command7',
        this.setColorForSelectedImages.bind(this, 'yellow'),
        false,
      );
      window.addEventListener(
        'hotkeys:catalog:command8',
        this.setColorForSelectedImages.bind(this, 'green'),
        false,
      );
      window.addEventListener(
        'hotkeys:catalog:command9',
        this.setColorForSelectedImages.bind(this, 'blue'),
        false,
      );
      window.addEventListener(
        'hotkeys:catalog:command0',
        this.setColorForSelectedImages.bind(this, 'nocolor'),
        false,
      );
    }

    window.addEventListener(
      'hotkeys:catalog:command/',
      () => navigate('/shortcuts'),
      false,
    );

    window.addEventListener('hotkeys:catalog:commandF', this.focusInputSearch, false);

    window.addEventListener(
      'hotkeys:catalog:commandC',
      () => {
        if (store.getState().main.openedTree === 'collections') {
          mainActions.changeTree('');
        } else {
          mainActions.changeTree('collections', picsioConfig.isProofing());
        }
      },
      false,
    );
    window.addEventListener(
      'hotkeys:catalog:commandM',
      () => {
        mainActions.toggleDetails();
      },
      false,
    );

    window.addEventListener(
      'hotkeys:catalog:commandI',
      () => {
        picsioConfig.isMainApp() && mainActions.toggleImport();
      },
      false,
    );

    window.addEventListener(
      'hotkeys:catalog:up',
      () => {
        const container = document.querySelector('.innerCatalog');
        container.scrollTop -= 200;
      },
      false,
    );
    window.addEventListener(
      'hotkeys:catalog:down',
      () => {
        const container = document.querySelector('.innerCatalog');
        container.scrollTop += 200;
      },
      false,
    );

    function scrollCatalogToBeginning() {
      const container = document.querySelector('.innerCatalog');
      container.scrollTop = 0;
    }

    function scrollCatalogToEnd() {
      const container = document.querySelector('.innerCatalog');
      container.scrollTop = container.scrollHeight - window.innerHeight * 2;
    }

    function scrollPageUp() {
      const container = document.querySelector('.innerCatalog');
      container.scrollTop -= container.clientHeight;
    }

    function scrollPadeDown() {
      const container = document.querySelector('.innerCatalog');
      container.scrollTop += container.clientHeight;
    }

    window.addEventListener('hotkeys:catalog:commandUp', scrollCatalogToBeginning, false);
    window.addEventListener('hotkeys:catalog:home', scrollCatalogToBeginning, false);

    window.addEventListener('hotkeys:catalog:commandDown', scrollCatalogToEnd, false);
    window.addEventListener('hotkeys:catalog:end', scrollCatalogToEnd, false);

    window.addEventListener('hotkeys:catalog:altUp', scrollPageUp, false);
    window.addEventListener('hotkeys:catalog:pageup', scrollPageUp, false);

    window.addEventListener('hotkeys:catalog:altDown', scrollPadeDown, false);
    window.addEventListener('hotkeys:catalog:pagedown', scrollPadeDown, false);
  },

  initIntercom() {
    const { user } = store.getState();
    const { chatSupport } = user.subscriptionFeatures;
    if (chatSupport) {
      window.Intercom('boot', {
        app_id: picsioConfig.intercom.appId,
        custom_launcher_selector: '#itemliveSupport',
      });
    }

    // We don't want to all users in Intercom, because of money, we lazy create them on webchat lauch.
    // Once user opened Intercom we will autostart Intercom session for they.
    // Other options is to signup only trial and subscribed users, others should be dropped after trial ends.
    if (user && user.intercomUser) {
      this.startIntercomSession(user);
    }

    window.Intercom('onUnreadCountChange', (unreadCount) => {
      Logger.info('Intercom unread count', unreadCount);

      const counter = document.querySelector('.liveSupportCounter');
      if (counter && unreadCount > 0) {
        counter.innerHTML = unreadCount;
      } else if (counter && unreadCount === 0) {
        counter.innerHTML = '';
      }
    });
  },

  initPubsub() {
    const id = picsioConfig.isMainApp()
      ? store.getState().user._id // user id
      : picsioConfig.isProofing()
        ? picsioConfig.access._id // website id
        : picsioConfig.isSingleApp()
          ? picsioConfig.access.assetId // asset id
          : null;

    PubSubService.init(id, store.getState().user.apiKey);
    let integrations;
    let pushSettings;
    let selectedEvents = [];
    let isAllowAllNotifications = true;
    if (picsioConfig.isMainApp()) {
      integrations = store.getState().user.integrations;
      pushSettings = integrations.find((item) => item.type === 'socket');
      selectedEvents = (pushSettings && pushSettings.eventTypes) || [];
      isAllowAllNotifications = (picsioConfig.allowBrowserPushBySocket
        && pushSettings
        && pushSettings.active
        && selectedEvents.length === 0)
        || pushSettings === undefined;
    }

    const isAllowSelectedNotifications = pushSettings && pushSettings.active && selectedEvents.length > 0;

    if (isAllowAllNotifications || isAllowSelectedNotifications) {
      PubSubService.subscribe('asset.comment.added', (params) => {
        const isUserUnsubscribed = checkUserEventSubscription(id, params, integrations, 'push');
        if (isUserUnsubscribed) return;
        if (id === (params.initiator && params.initiator._id)) return;
        if (isAllowSelectedNotifications && !selectedEvents.includes('asset.comment.added')) return;
        // now we will hardcode a workaround that will not show notifications from public websites
        if (!picsioConfig.isMainApp() && !params.initiator) {
          Logger.info('Comment comes from public. Skip');
          return;
        }

        BrowserNotifications.create({
          title: 'Comment added',
          body: params.data.comment.text,
          onclick() {
            try {
              navigate(`preview/${params.data.asset._id}`);
            } catch (err) {
              Logger.error(
                new Error('BrowserNotification: `comment added` click failed'),
                { assetId: params.data.asset._id, error: err },
                ['BrowserNotificationClickFailed', (err && err.message) || 'NoMessage'],
              );
            }
          },
        });
      });

      PubSubService.subscribe('asset.revision.created', (params) => {
        const isUserUnsubscribed = checkUserEventSubscription(id, params, integrations, 'push');
        if (isUserUnsubscribed) return;
        if (id === (params.initiator && params.initiator._id)) return;
        if (isAllowSelectedNotifications && !selectedEvents.includes('asset.revision.created')) { return; }

        BrowserNotifications.create({
          title: 'Revision added',
          body: 'New revision was added to image',
          onclick() {
            try {
              navigate(`preview/${params.data.asset._id}`);
            } catch (err) {
              Logger.error(
                new Error('BrowserNotification: `revision added` click failed'),
                { assetId: params.data.asset._id, error: err },
                ['BrowserNotificationClickFailed', (err && err.message) || 'NoMessage'],
              );
            }
          },
        });
      });
    }
  },

  checkIsBrowserWebpSupported() {
    const callback = (feature, result) => {
      if (result) {
        Logger.info('webp animation supported');
        mainActions.setIsWebpSupported(true);
      } else {
        Logger.info('webp animation not supported');
        mainActions.setIsWebpSupported(false);
      }
    };
    utils.checkWebpFeature('animation', callback);
  },

  /**
   * App should be started by user like in OS. User here should be already authorized.
   * @return {[type]}      [description]
   */
  async startMainApp() {
    try {
      const isSplashScreenAvailable = Capacitor.isPluginAvailable('SplashScreen');
      if (isSplashScreenAvailable) {
        SplashScreen.hide();
      }
      if (!window.navigator.cookieEnabled) {
        // need to move this dialog to separate file
        // takes too much space

        showDialog({
          title: 'Cookies are required',
          text:
            'Cookies aren\'t enabled on your browser. Please enable cookies in your browser preferences to continue<br /><br /><a href="#">Read how to</a>',
          textBtnCancel: null,
          textBtnOk: null,
          icon: 'warning',
        });

        return;
      }

      this.checkBrowser();

      /** remove initial spinner from HTML */
      const $initialSpinner = document.getElementById('start-up-spinner');
      if ($initialSpinner) document.body.removeChild($initialSpinner);

      this.spinnerStartApp = UiBlocker.block(localization.SPINNERS.STARTING_APPLICATION);

      !utils.getCookie('picsio.keywordsTree.sort')
        && utils.setCookie('picsio.keywordsTree.sort', 'azAsc'); // default keywords sort

      initShortcuts('catalog');
      this.runHotkeysListeners();

      this.spinnerStartApp.setTitle('Loading user data...');

      mainActions.setPanelSize();
      try {
        await userActions.getUser();
      } catch (err) {
        const connection = utils.getNavigatorConnectionInfo();
        Logger.error(new Error('Can not load user'), { error: err }, [
          'UserLoadFailed',
          { errorMessage: (err && err.message) || 'NoMessage', connection },
        ]);
        throw new GetDataError('Can not load user', 'getUserFailed', err);
      }

      try {
        await rolesActions.getRoles();
        await teamActions.getTeam();
      } catch (err) {
        Logger.error(new Error('Can not load user data'), { error: err }, [
          'UserDataLoadFailed',
          (err && err.message) || 'NoMessage',
        ]);
        UiBlocker.unblock();
        throw new GetDataError('Can not load user data', 'getUserDataFailed', err);
      }

      /** ****** start async functions ******* */
      try {
        await collectionsActions.getCollections();
      } catch (err) {
        Logger.error(new Error('Can not load collections data'), { error: err }, [
          'CollectionsDataLoadFailed',
          (err && err.message) || 'NoMessage',
        ]);
        throw new GetDataError('Can not load collections data', 'getCollectionsFailed', err);
      }

      const defaultCollectionsToFetch = [
        savedSearchesActions.getSavedSearches(),
        getCustomFieldsAction(),
      ];

      if (isHaveTeammatePermission('manageLightboards')) {
        defaultCollectionsToFetch.push(lightboardsActions.getLightboards());
      }

      if (isHaveTeammatePermission('manageInboxes')) {
        const { inboxes } = store.getState().user.subscriptionFeatures || {};
        if (inboxes) defaultCollectionsToFetch.push(inboxesActions.getInboxes());
      }
      this.spinnerStartApp.setTitle(localization.SPINNERS.LOADING_LIBRARY);
      try {
        await Q.all(defaultCollectionsToFetch);
      } catch (err) {
        throw new GetDataError('Can not load default collections', 'getDefaultCollectionsFailed', err);
      }
      keywordsActions.getKeywords();
      // set keywords sortType to keywords store, from user.keywordsSortType
      const { keywordsSortType } = store.getState().user;
      if (keywordsSortType && typeof keywordsSortType === 'object') {
        keywordsActions.sort(keywordsSortType);
      }
      assetsActions.getWatermarks();
      /** ****** end async functions ******* */

      // detect user date locale and set it to dayjs
      setUserDateLocale();

      this.delegateGlobalEvents();

      notificationsActions.getNotifications();
      notificationsActions.fetchJobsStatus();

      this.initIntercom();
      this.initPubsub();
      this.setSiteTitle();
      // check subscription
      const { subscriptionFeatures } = store.getState().user;
      if (!subscriptionFeatures.access) {
        replace('/billing?tab=overview');
        this.spinnerStartApp.destroy();
        return;
      }

      this.spinnerStartApp.setTitle(localization.SPINNERS.CONNECTING_STORAGES(store.getState().user.storageName));

      // Get and set status of recursive search from cookie when app starts not from catalog view, e.g Billing, myAccount
      if (utils.LocalStorage.get('picsio.recursiveSearch') === false) {
        const { lightboardId, tagId, keywords } = store.getState().router.location.query;
        if (!lightboardId && !tagId && !keywords) {
          collectionsActions.setRecursiveSearch(true);
        }
      }

      utils.setCookie('picsio.user_id', store.getState().user._id);

      Logger.log('UI', 'AppStarted', utils.getScreenUrl());
      if (ua.isPWA()) {
        Logger.log('User', 'PWAAppStarted');
      }

      if (ua.isMobileApp()) {
        const userPlatform = ua.getPlatform();
        const deviceInfo = await Device.getInfo() || {};
        Logger.log(
          'User',
          `${userPlatform ? utils.capitalizeFirstLetter(userPlatform) : 'Mobile'}AppStarted`,
          {
            ...deviceInfo,
          },
        );
        App.addListener('appStateChange', (state) => {
          Logger.log('User', `MobileApp${state.isActive ? 'Active' : 'Inactive'}`);
        });

        document.addEventListener(
          'deviceready',
          () => {
            if (window.cordova) {
              // cordova.plugins.notification.badge is now available
              window.cordova.plugins.notification.badge.hasPermission((granted) => {
                Logger.info(`Notification badge hasPermission: [${granted}]`);
                if (!granted) {
                  window.cordova.plugins.notification.badge.requestPermission((result) => {
                    Logger.info(`Notification badge requestPermission: [${result}]`);
                  });
                }
              });
            }
          },
          false,
        );

        /** Init mobile app notifications */
        initMobileNotifications();

        // Check 2FA for MobileApp user
        const { user } = store.getState();
        const { twoFactorEnabled, twoFactorConfigured } = user;
        if (twoFactorEnabled && !twoFactorConfigured) {
          Logger.log('UI', 'MobileRedirectUserToSecurity', { twoFactorEnabled, twoFactorConfigured });
          navigate('/users/me?tab=security');
        }
      }

      window.addEventListener('beforeunload', () => {
        Logger.log('User', 'AppRefreshed', utils.getScreenUrl());
      });

      // utils.preventPullToRefresh('.wrapperPicsioApp');
      const oldDownloadableItems = utils.LocalStorage.get('picsioDownloadingProgress');
      if (oldDownloadableItems && oldDownloadableItems.length) {
        const names = oldDownloadableItems.map((n) => n.name).slice(0, 3);
        const rest = oldDownloadableItems.length - 3;
        const more = rest > 0 ? ` and (${rest}) more` : '';

        showDialog({
          title: 'Resume download',
          text: `Recently you have started downloading the following assets: ${names.join(
            ', ',
          )}${more}`,
          textBtnOk: 'Continue',
          textBtnCancel: 'Discard',
          onOk() {
            utils.LocalStorage.remove('picsioDownloadingProgress');
            downloadListActions.addToDownloadList(oldDownloadableItems);
          },
          onCancel() {
            utils.LocalStorage.remove('picsioDownloadingProgress');
          },
          onClose() { }, // empty function - because we should just remove dialog, and show it again during next starting app
        });
      }

      this.checkIsBrowserWebpSupported();

      UiBlocker.unblock();
    } catch (err) {
      UiBlocker.unblock();
      throw err;
    }
  },

  async startProofingApp() {
    try {
      document.addEventListener('contextmenu', (e) => e.preventDefault(), false);
      Logger.setUser({ displayName: 'Web user', email: picsioConfig.access.alias });

      /** remove initial spinner from HTML */
      const $initialSpinner = document.getElementById('start-up-spinner');
      if ($initialSpinner) document.body.removeChild($initialSpinner);

      this.spinnerStartApp = UiBlocker.block();

      this.checkBrowser();

      /** ****** start async functions ******* */
      await getCustomFieldsAction();
      if (picsioConfig.access.tagsTreeShow) await collectionsActions.getCollections();
      /** ****** end async functions ******* */

      initShortcuts('catalog');
      this.delegateGlobalEvents();
      this.initPubsub();
      setUserDateLocale();
      utils.preventPullToRefresh('.wrapperPicsioApp');
      Logger.log('UI', 'ProofingStarted', utils.getScreenUrl());
      window.addEventListener('beforeunload', () => {
        Logger.log('User', 'ProofingRefreshed', utils.getScreenUrl());
      });
      const isConsentNeeded = window.websiteConfig.visitingConsentEnable;
      if (isConsentNeeded && !utils.getCookie(utils.getWebsiteCookieName('visiting'))) {
        Logger.log('UI', 'VisitingConsentDialog');
        showDialog({
          title: localization.DIALOGS.DOWNLOAD_CONSENT.TITLE(
            window.websiteConfig.visitingConsentTitle,
          ),
          text: localization.DIALOGS.DOWNLOAD_CONSENT.TEXT(
            window.websiteConfig.visitingConsentMessage,
          ),
          textBtnCancel: localization.DIALOGS.DOWNLOAD_CONSENT.CANCEL_TEXT,
          textBtnOk: localization.DIALOGS.DOWNLOAD_CONSENT.OK_TEXT,
          onOk: () => {
            Logger.log('User', 'VisitingConsentDialogConfirm');
          },
          onCancel: () => {
            Logger.log('User', 'VisitingConsentDialogReject');
            const consentUrl = utils.prepareUrlForConsent(window.websiteConfig.alias);
            window.open(consentUrl, '_self');
          },
        });
      }

      this.checkIsBrowserWebpSupported();

      this.spinnerStartApp.destroy();
    } catch (err) {
      const text = localization.APP_START.DEFAULT_ERROR;
      UiBlocker.unblock();
      showDialog({
        title: 'Error',
        text,
        textBtnOk: null,
        textBtnCancel: null,
      });
      Logger.error(new Error('App start failed'), { error: err }, [
        'StartProofingFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
  },

  async startSingleApp() {
    try {
      document.addEventListener('contextmenu', (e) => e.preventDefault(), false);
      Logger.setUser({ displayName: 'Web user', email: picsioConfig.access.alias });

      /** remove initial spinner from HTML */
      const $initialSpinner = document.getElementById('start-up-spinner');
      if ($initialSpinner) document.body.removeChild($initialSpinner);

      this.spinnerStartApp = UiBlocker.block();

      this.checkBrowser();

      /** ****** start async functions ******* */
      await getCustomFieldsAction();
      /** ****** end async functions ******* */

      this.delegateGlobalEvents();
      this.initPubsub();
      setUserDateLocale();
      Logger.log('UI', 'SasStarted', utils.getScreenUrl());
      window.addEventListener('beforeunload', () => {
        Logger.log('User', 'SasRefreshed', utils.getScreenUrl());
      });

      const isConsentNeeded = window.websiteConfig.visitingConsentEnable;
      if (isConsentNeeded && !utils.getCookie(utils.getWebsiteCookieName('visiting'))) {
        Logger.log('UI', 'VisitingConsentDialog');
        showDialog({
          title: localization.DIALOGS.DOWNLOAD_CONSENT.TITLE(
            window.websiteConfig.visitingConsentTitle,
          ),
          text: localization.DIALOGS.DOWNLOAD_CONSENT.TEXT(
            window.websiteConfig.visitingConsentMessage,
          ),
          textBtnCancel: localization.DIALOGS.DOWNLOAD_CONSENT.CANCEL_TEXT,
          textBtnOk: localization.DIALOGS.DOWNLOAD_CONSENT.OK_TEXT,
          onOk: () => {
            Logger.log('User', 'VisitingConsentDialogConfirm');
          },
          onCancel: () => {
            Logger.log('User', 'VisitingConsentDialogReject');
            const consentUrl = utils.prepareUrlForConsent(window.websiteConfig.alias);
            window.open(consentUrl, '_self');
          },
        });
      }

      this.spinnerStartApp.destroy();
    } catch (err) {
      const text = localization.APP_START.DEFAULT_ERROR;
      UiBlocker.unblock();
      showDialog({
        title: 'Error',
        text,
        textBtnOk: null,
        textBtnCancel: null,
      });

      Logger.error(new Error('App start failed'), { error: err }, [
        'StartSingleSharingFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
  },

  async startInboxApp() {
    try {
      Logger.setUser({ displayName: 'Web user', email: picsioConfig.access.alias });

      /** remove initial spinner from HTML */
      const $initialSpinner = document.getElementById('start-up-spinner');
      if ($initialSpinner) document.body.removeChild($initialSpinner);

      this.spinnerStartApp = UiBlocker.block();

      this.checkBrowser();

      Logger.log('UI', 'InboxStarted', utils.getScreenUrl());
      window.addEventListener('beforeunload', () => {
        Logger.log('User', 'InboxRefreshed', utils.getScreenUrl());
      });

      const isConsentNeeded = window.inbox.visitingConsentEnable;
      if (isConsentNeeded) {
        Logger.log('UI', 'VisitingConsentDialog');
        showDialog({
          title: localization.DIALOGS.DOWNLOAD_CONSENT.TITLE(window.inbox.visitingConsentTitle),
          text: localization.DIALOGS.DOWNLOAD_CONSENT.TEXT(window.inbox.visitingConsentMessage),
          textBtnCancel: localization.DIALOGS.DOWNLOAD_CONSENT.CANCEL_TEXT,
          textBtnOk: localization.DIALOGS.DOWNLOAD_CONSENT.OK_TEXT,
          onOk: () => {
            Logger.log('User', 'VisitingConsentDialogConfirm');
          },
          onCancel: () => {
            Logger.log('User', 'VisitingConsentDialogReject');
            const consentUrl = utils.prepareUrlForConsent(window.inbox.alias);
            window.open(consentUrl, '_self');
          },
        });
      }

      this.spinnerStartApp.destroy();
    } catch (err) {
      const text = localization.APP_START.DEFAULT_ERROR;
      UiBlocker.unblock();
      showDialog({
        title: 'Error',
        text,
        textBtnOk: null,
        textBtnCancel: null,
      });
      Logger.error(new Error('Inbox start failed'), { error: err }, [
        'StartInboxFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
  },

  focusInputSearch() {
    const searchInput = document.querySelector('.searchHeader input[type="text"]');
    if (searchInput) searchInput.focus();
  },

  tutorials() {
    Logger.log('Catalog', 'GetTutorial');
    window.open(picsioConfig.support.HELP_CENTER_URL, '_blank');
  },

  cmdAselectedChecker() {
    const assetsStore = store.getState().assets;
    if (assetsStore.selectedItems.length < assetsStore.total) {
      /** if selected items less than total */
      Logger.log('User', 'KeyboardSelectAll');
      assetsActions.selectAll();
    } else {
      Logger.log('User', 'KeyboardDeselectAll');
      assetsActions.deselectAll();
    }
  },

  setFlagForSelectedImages(value) {
    assetsActions.changeFlag(store.getState().assets.selectedItems, value);
  },

  setRatingForSelectedImages(value) {
    assetsActions.changeRating(store.getState().assets.selectedItems, value);
  },

  setColorForSelectedImages(value) {
    assetsActions.changeColor(store.getState().assets.selectedItems, value);
  },

  renderToolbarProgress(data) {
    const ElParent = document.querySelector(data.ElParent);
    const progressWrapper = document.querySelector(`${data.ElParent} .pProgressWrapper`);

    if (progressWrapper) {
      ElParent.removeChild(progressWrapper);
    }

    if (!ElParent || data.percantage === 0 || data.percantage === 100) {
      return;
    }

    // progressBar contains from 2 semicircles, when percantage more then 50 we fix first semicircle, and move second
    const template = [
      '<div class="pProgressWrapper">',
      `<div class="pProgressAnimation ${data.percantage > 50 ? 'alreadyCenter' : ''}">`,
      `<div class="pProgressAnimatedElem" style="transform: rotate(${(data.percantage * 360) / 100
      }deg);">`,
      '<div class="pProgressAnimatedInner"></div>',
      '</div>',
      data.percantage > 50
        ? '<div class="pProgressConstantElem" style="transform: rotate(180deg); position: absolute; top: 0;"><div class="pProgressAnimatedInner"></div></div>'
        : '',
      '</div>',
      '</div>',
    ].join('');
    ElParent.insertAdjacentHTML('afterbegin', template);
  },

  // this handler is needed to handle errors which break down application
  // so we should disallow users to do anything except reload application
  onHardError(data) {
    showDialog({
      title: 'Error',
      text: data.message,
      textBtnOk: data.btnTxt || 'Ok',
      textBtnCancel: null,
      onOk: reloadApp,
      onCancel() { },
    });
  },

  // this handler is needed to handle errors which DON'T break down application
  // so we should just show informational popup
  onSoftError(data) {
    showDialog({
      title: 'Error',
      text: data.message,
      textBtnCancel: null,
      onOk() { },
      onCancel() { },
    });
  },

  checkBrowser() {
    if (picsioConfig.browser[ua.browser.family] > ua.browser.major) {
      window.location = picsioConfig.OLD_BROWSER_URL;
    }
    if (ua.browser && ua.browser.family) {
      document.body.classList.add(ua.browser.family.replace(/\s/g, ''));
    }
    if (ua.browser.isNotDesktop()) {
      document.body.classList.add('mobile');
    }

    const isMobileApp = picsioConfig.isMainApp() && ua.isMobileApp();
    if (isMobileApp) {
      document.body.classList.add('isMobileApp');
    }

    const isIosMobileApp = (picsioConfig.isMainApp() && ua.isMobileApp() && ua.getPlatform() === 'ios') || false;
    if (isIosMobileApp) {
      document.body.classList.add('iosMobileApp');
    }
  },

  setSiteTitle() {
    const userName = store.getState().user.displayName;
    if (userName) {
      document.title = `Pics.io - ${userName}`;
    }
  },
};

window.app = app;

// export default hot(app);
export default app;
