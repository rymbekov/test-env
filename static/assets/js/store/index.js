import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

import config from '../../../../config';
import * as utils from '../shared/utils';
import localization from '../shared/strings';
import UiBlocker from '../services/UiBlocker';
import Spinner from '../components/spinner';
import Logger from '../services/Logger';
import { showErrorDialog } from '../components/dialog';

import reducers from './reducers';
import middlewares from './middlewares';
import Toast from '../components/Toast';

import api from '../api/main';
import sdk from '../sdk';
import appHistory from '../helpers/history';

const thunkExtra = {
  api, /** deprecated */
  sdk,
  utils,
  localization,
  UiBlocker,
  Toast,
  Spinner,
  Logger,
  showErrorDialog,
};

const store = configureStore({
  reducer: reducers(appHistory),
  middleware: [thunk.withExtraArgument(thunkExtra), ...middlewares],
  devTools: config.ENV === 'development',
});

export default store;
