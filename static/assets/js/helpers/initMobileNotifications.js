import { bindActionCreators } from 'redux';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import store from '../store';
import { updateUser } from '../store/actions/user';
import sdk from '../sdk';
import Logger from '../services/Logger';
import { navigate } from './history';

const userActions = bindActionCreators({ updateUser }, store.dispatch);

// saveSubscription saves the subscription to the backend
const saveSubscription = async (token) => {
  try {
    await sdk.users.savePushSubscription({ token });
    Logger.log('UI', 'PushNotificationsSubscriptionSaved');
  } catch (err) {
    Logger.error(new Error('Can not save subscription tokens'), { error: err }, [
      'CantSaveSubscriptionTokens',
      (err && err.message) || 'NoMessage',
    ]);
  }
};

export default function initNotifications() {
  const isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications');

  if (isPushNotificationsAvailable) {
    Logger.info('Initializing notifications for Apple / Google');
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then((result) => {
      Logger.info('PushNotifications.requestPermissions result: ', JSON.stringify(result));
      if (result.granted || result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register()
          .then(() => {
            userActions.updateUser({ isPushNotificationsAvailable: true });
          })
          .catch((error) => {
            Logger.error(new Error('Can not get permission for Apple / Google notifications'), { error }, [
              'CantRegisterAppSubscription',
              (error && error.error || error.message) || 'NoMessage',
            ]);
          });
      } else {
        Logger.info('Can not get permission for Apple / Google notifications');
        userActions.updateUser({ isPushNotificationsAvailable: false });
      }
    });

    PushNotifications.addListener('registration', async (token) => {
      Logger.info('Registration notifications for Apple / Google');
      try {
        await saveSubscription(token.value);
        userActions.updateUser({
          pushSubscription: { token: token.value },
          isPushNotificationsGranted: true,
        });
      } catch (error) {
        Logger.error(new Error('Can not save subscription for Apple / Google'), { error }, [
          'CantSaveAppSubscription',
          (error && error.error || error.message) || 'NoMessage',
        ]);
        userActions.updateUser({
          isPushNotificationsGranted: false,
        });
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      Logger.info(`Error on registration: ${JSON.stringify(error)}`);
      Logger.error(new Error('Can not register subscription for Apple / Google'), { error }, [
        'CantRegisterAppSubscription',
        (error && error.error || error.message) || 'NoMessage',
      ]);
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      Logger.info(`Push received: ${JSON.stringify(notification)}`);
      if (window.cordova) {
        window.cordova.plugins.notification.badge.increase(1, (badge) => {
          Logger.info(`App badge increase [${badge}]`);
        });
      }
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      Logger.info(`Push action performed: ${JSON.stringify(notification)}`);
      const slug = notification?.notification?.data?.url?.split('.io').pop();
      if (slug) {
        Logger.log('User', 'AppPushUrlOpen', { slug });
        navigate(slug);
      }
    });
  } else {
    userActions.updateUser({ isPushNotificationsAvailable: false });
    Logger.info('PushNotifications does not have web implementation.');
  }
}
