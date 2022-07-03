import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

import config from '../../../../../config';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import UiBlocker from '../../services/UiBlocker';

import middlewares from '../middlewares';
import Toast from '../../components/Toast';

import reducer from './reducer';

const thunkExtra = {
  utils,
  localization,
  UiBlocker,
  Toast,
};

const store = configureStore({
  reducer,
  middleware: [thunk.withExtraArgument(thunkExtra), ...middlewares],
  devTools: config.ENV === 'development',
});

export default store;
