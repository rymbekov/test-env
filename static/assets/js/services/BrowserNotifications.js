import ua from '../ua';
import Logger from './Logger';

class BrowserNotifications {
  icon = 'https://assets.pics.io/img/logoBigPicsio.png';

  /** Try to show browser notification */
  show({ title, body, onclick }) {
    const { icon } = this;
    const notification = new Notification(title, { body, icon });
    notification.onclick = onclick;
    notification.onshow = () => setTimeout(notification.close.bind(notification), 5000);
  }

  /**
   * Check notification support and show if permission granted
   * @param {Object} params
   * @param {string} params.title
   * @param {string} params.body
   * @param {Function} params.onclick
   */
  create(params) {
    // added by NightNei - ua.browser.isNotDesktop()
    // because chrome on android has this variable but it can't be called via "new" or like a function,
    // so I disallow show notification on mobile
    if (!('Notification' in window) || ua.browser.isNotDesktop()) {
      Logger.info('Notification is not suported in the browser.');
    } else if (Notification.permission === 'granted') {
      this.show(params);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission((permission) => {
        // If the user is okay, let's show a notification
        if (permission === 'granted') this.show(params);
      });
    }
  }
}

export default new BrowserNotifications();
