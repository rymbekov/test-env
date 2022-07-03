import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import ReactBreakpoints from 'react-breakpoints';
import initServiceWorker from './helpers/initServiceWorker';
import app from './app';
import store from './store';
import appHistory, { reloadApp } from './helpers/history';
import AppRouterWithTheme from './AppRouter';
import LoginScreen from './components/LoginScreen';
import localization from './shared/strings';
import * as utils from './shared/utils';
import Logger from './services/Logger';
import { initShortcuts } from './components/Shortcuts';
import TwoFactorScreen from './components/TwoFactorScreen';
import { showDialog } from './components/dialog';
import * as api from './api';
import sdk from './sdk';
import ua from './ua';
import '../css/picsio.scss';

const breakpoints = {
  mobile: 320,
  mobileLandscape: 480,
  tablet: 768,
  tabletLandscape: 1024,
  desktop: 1230,
  desktopLarge: 1360,
  desktopWide: 1920,
};

/** Register worker */
initServiceWorker();

/** Start App */
async function loadApp() {
  if (ua.isMobileApp()) {
    const userToken = await utils.MobileStorage.get('picsio.userToken');

    if (!userToken) {
      /** remove initial spinner from HTML */
      const $initialSpinner = document.getElementById('start-up-spinner');
      if ($initialSpinner) document.body.removeChild($initialSpinner);
      ReactDOM.render(
        <LoginScreen onLogin={loadApp} />,
        document.querySelector('.wrapperPicsioApp'),
      );
      return;
    }

    api.instance.defaults.headers.common.Authorization = `Bearer ${userToken}`;
    sdk.axiosInstance.defaults.headers.common.Authorization = `Bearer ${userToken}`;
    const isTwoFactorAuthComplete = await utils.MobileStorage.get('picsio.twoFactorAuthComplete');
    if (isTwoFactorAuthComplete === 'false') {
      const twoFactorMode = await utils.MobileStorage.get('picsio.twoFactorAuthMode');
      /** remove initial spinner from HTML */
      const $initialSpinner = document.getElementById('start-up-spinner');
      if ($initialSpinner) document.body.removeChild($initialSpinner);

      ReactDOM.render(
        <TwoFactorScreen onLogin={loadApp} twoFactorMode={twoFactorMode} />,
        document.querySelector('.wrapperPicsioApp'),
      );
      return;
    }
  }

  try {
    await app.startMainApp();
    ReactDOM.render(
      <Provider store={store}>
        <ConnectedRouter history={appHistory}>
          <ReactBreakpoints breakpoints={breakpoints}>
            <AppRouterWithTheme />
          </ReactBreakpoints>
        </ConnectedRouter>
      </Provider>,
      document.querySelector('.wrapperPicsioApp'),
    );
    initShortcuts('catalog');
  } catch (err) {
    const errorStatus = utils.getStatusFromResponceError(err);
    if (errorStatus === 401) {
      // if token is not valid
      ReactDOM.render(
        <LoginScreen onLogin={loadApp} />,
        document.querySelector('.wrapperPicsioApp'),
      );
      return;
    }

    const text = localization.APP_START.DEFAULT_ERROR;

    Logger.log('UI', 'AppStartFailedDialog', { code: err.code });
    showDialog({
      title: 'Error',
      text,
      textBtnOk: 'Refresh',
      textBtnCancel: null,
      onOk: () => {
        Logger.log('User', 'AppStartFailedDialogOk');
        reloadApp();
      },
    });
    Logger.error(new Error('App start failed'), { error: err }, [
      'StartAppFailed',
      (err && err.message) || 'NoMessage',
    ]);
  }
}

loadApp();

window.mapsCallback = () => {
  window.dispatchEvent(new Event('gMapsInited'));
};
