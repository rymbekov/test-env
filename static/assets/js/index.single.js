import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import AppRouter from 'AppRouter';
import { ToastContainer } from 'react-toastify';
import app from './app';
import store from './store';
import appHistory from './helpers/history';
import picsioConfig from '../../../config';

import '../css/singleSharing.scss';

picsioConfig.access = window.websiteConfig;

(async () => {
  await app.startSingleApp();

  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={appHistory}>
        <AppRouter />
        <ToastContainer
          position="bottom-right"
          autoClose={15000}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnHover
          pauseOnFocusLoss
          draggable
        />
      </ConnectedRouter>
    </Provider>,
    document.querySelector('.wrapperPicsioApp'),
  );
})();

window.mapsCallback = () => {
  window.dispatchEvent(new Event('gMapsInited'));
};
