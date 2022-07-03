import Logger from '@picsio/browser-logger';
import picsioConfig from '../../../../config';
import TrackingService from './TrackingService';

let amplitudeProdKey = picsioConfig.amplitude.externalKey;
let appName = 'Undefined';
if (picsioConfig.isMainApp()) {
  appName = 'Main';
  amplitudeProdKey = picsioConfig.amplitude.mainKey;
}
if (picsioConfig.isProofing()) {
  appName = 'Proofing';
}
if (picsioConfig.isSingleApp()) {
  appName = 'Sas';
}
if (picsioConfig.isInboxApp()) {
  appName = 'Inbox';
}

export default new Logger({
  env: picsioConfig.ENV,
  amplitudeSettings: {
    appName,
    key: picsioConfig.ENV === 'production' ? amplitudeProdKey : picsioConfig.amplitude.devKey,
  },
  sentrySettings: {
    appName,
    dsn: picsioConfig.sentry.dsn,
    env: picsioConfig.ENV,
  },
  trackingService: TrackingService,
});
