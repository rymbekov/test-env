import { Capacitor } from '@capacitor/core';
import detect from './lib/detect.min';

const ua = detect.parse(navigator.userAgent);
ua.browser.prefix = ua.browser.family === 'Chrome' ? '-webkit-' : ua.browser.family === 'Firefox' ? '-moz-' : '';

ua.browser.isNotDesktop = function () {
  return ua.device.type === 'Mobile' || ua.device.type === 'Tablet' || ua.device.name === 'iPad';
};

ua.browser.isTablet = function () {
  return ua.device.type === 'Tablet' || ua.device.name === 'iPad';
};

ua.browser.isOldSafari = function () {
  return ua.browser.family === 'Safari' && +ua.browser.version < 10.1;
};

ua.os.isIOS = function () {
  return ua.os.family === 'iOS';
};

ua.isPWA = function () {
  return (
    window.navigator.standalone
    || window.matchMedia('(display-mode: standalone)').matches
    || document.referrer.includes('android-app://')
  );
};

ua.isMobileApp = function () {
  return Capacitor.isNative;
};

ua.getPlatform = function () {
  return Capacitor.getPlatform();
};

export default ua;
