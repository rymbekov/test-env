import * as utils from '../../../shared/utils';

const handleDragEnd = () => {
  const elem = window.dragElement;
  const cursorReorderImages = document.querySelector('.cursorReorderImages');
  const wrapperTiles = document.querySelector('.wrapperTiles');

  if (elem && elem.parentNode) {
    elem.parentNode.removeChild(elem);
  }
  if (cursorReorderImages) {
    utils.css(cursorReorderImages, { display: 'none' })
  }
  if (wrapperTiles) {
    wrapperTiles.classList.remove('pointerEventsDisabled');
  }

  window.dragElement = null;
};

export default handleDragEnd;
