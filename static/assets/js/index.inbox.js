import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import ScreenInboxImport from './components/ScreenInboxImport';
import app from './app';
import store from './store/inboxApp';
import picsioConfig from '../../../config';

import '../css/public-sharing.scss';

picsioConfig.access = window.inbox;

(async () => {
  await app.startInboxApp();

  ReactDOM.render(
    <Provider store={store}>
      <ScreenInboxImport />
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
    </Provider>,
    document.querySelector('.wrapperPicsioApp'),
  );
})();
