import touchHandler from './touchHandler';

const removeTouchListeners = () => {
  document.removeEventListener('touchstart', touchHandler, true);
  document.removeEventListener('touchmove', touchHandler, true);
  document.removeEventListener('touchend', touchHandler, true);
  document.removeEventListener('touchcancel', touchHandler, true);
};

export default removeTouchListeners;
