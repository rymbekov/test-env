import ua from '../../../ua';

// needs for Drag & Drop on iPad
const handleContextMenu = (event) => {
  if (ua.browser.family === 'Safari' && event.type === 'contextmenu') {
    event.target.classList.add('is-onContextMenu');
  }
};

export default handleContextMenu;
