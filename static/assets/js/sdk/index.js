import initSdk from '@picsio/sdk';
import config from '../../../../config';

// Value will be injected by Webpack DefinePlugin constant from Webpack
// eslint-disable-next-line jsx-control-statements/jsx-jcs-no-undef
const isMobileApp = __IS_MOBILE__;

const sdk = initSdk({
  appId: config.APP_ID,
  host: config.getApiBaseUrl(),
  saveAuth: Boolean(isMobileApp),
});

export default sdk;
