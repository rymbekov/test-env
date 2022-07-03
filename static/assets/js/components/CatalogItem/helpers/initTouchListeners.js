import touchHandler from './touchHandler';

const initTouchListeners = () => {
  document.addEventListener('touchstart', touchHandler, true);
  document.addEventListener('touchmove', touchHandler, true);
  document.addEventListener('touchend', touchHandler, true);
  document.addEventListener('touchcancel', touchHandler, true);
};

export default initTouchListeners;
