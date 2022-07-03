import picsioConfig from '../../../../config';
import { showDialog } from '../components/dialog';
import Logger from '../services/Logger';
import localization from '../shared/strings';
import ua from '../ua';

function setUseProxy() {
  Logger.log('UI', 'UsesProxy', 'Used proxy for download');
  window.useProxy = true;
}

// urlBase64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// saveSubscription saves the subscription to the backend
const saveSubscription = async (subscription) => {
  const url = '/users/savePushSubscription';

  try {
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    return response.json();
  } catch (err) {
    Logger.error(new Error('Can not save subscription'), { error: err }, [
      'CantSaveSubscription',
      (err && err.message) || 'NoMessage',
    ]);
  }
};

export default function initServiceWorker() {
  if ('serviceWorker' in navigator && picsioConfig.isMainApp()) {
    window.addEventListener('load', async () => {
      try {
        const worker = await navigator.serviceWorker.register('/worker.js');
        Logger.info(`==[ ServiceWorker registration successful with scope: ${worker.scope} ]==`);

        /** init messaging with service worker */
        const messageChannel = new MessageChannel();
        const reg = await navigator.serviceWorker.ready;

        // Create and save subscription for push messages
        if ('Notification' in window) {
          const notificationPermission = await Notification.requestPermission();
          if (notificationPermission !== 'denied' && notificationPermission !== 'default') {
            if ('pushManager' in reg) {
              try {
                let subscription = await reg.pushManager.getSubscription();
                if (!subscription) {
                  Logger.info('==[ ServiceWorker create subscription ]==');
                  const vapidPublicKey = picsioConfig.vapid.publicKey;
                  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                  subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey,
                  });
                }
                await saveSubscription(subscription);
              } catch (err) {
                Logger.error(
                  new Error('Service worker saving subscription failed'),
                  { error: err },
                  ['WorkerSavingSubscriptionFailed', (err && err.message) || 'NoMessage'],
                );
              }
            }
          }
        } else {
          Logger.info('==[ This browser does not support desktop notification ]==');
        }

        if (navigator.serviceWorker.controller === null) {
          /** reload window if no controller ( after hard reload ) */
          Logger.log('UI', 'HasWorkerButNoController', 'May be after hard reload');
          if (ua.isMobileApp()) {
            setUseProxy();
          } else {
            const {
              TITLE,
              TEXT,
              OK_TEXT,
              CANCEL_TEXT,
            } = localization.DIALOGS.HAS_WORKER_BUT_NO_CONTROLLER;
            showDialog({
              title: TITLE,
              text: TEXT,
              textBtnOk: OK_TEXT,
              textBtnCancel: CANCEL_TEXT,
              onOk: () => {
                Logger.log('UI', 'FixNoController', 'Dialog Ok. Reload window');
                window.location.reload();
              },
              onCancel: () => {
                Logger.log('UI', 'UsedProxyForDownload', 'Dialog cancel');
                setUseProxy();
              },
            });
          }
        }
        Logger.info('INIT_MESSAGE_CHANNEL');
        reg.active.postMessage({ type: 'INIT_MESSAGE_CHANNEL' }, [messageChannel.port2]);

        /** listen to messages from worker */
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.log && Array.isArray(event.data.log)) {
            Logger.info('=[', ...event.data.log, ']=');
          }
        };
      } catch (err) {
        Logger.warn(new Error('Service worker registration failed'), { error: err }, [
          'WorkerRegistrationFailed',
          'Use proxy for download files',
        ]);
        setUseProxy();
      }
    });
  }
  if (!('serviceWorker' in navigator)) {
    Logger.warn(new Error('No service worker in navigator'), { navigator }, [
      'NoWorkerInNavigator',
      'Use proxy for download files',
    ]);
    setUseProxy();
  }
}
