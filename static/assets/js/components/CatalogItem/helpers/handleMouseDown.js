import ua from '../../../ua';

const handleMouseDown = (event, catalogItemRef, trashed) => {
  /** disable drag assets inside trash */
  const insideTrash = Boolean(trashed);
  if (insideTrash) return event.preventDefault();

  if (
    ua.browser.family === 'Safari' &&
    event.target.parentNode.classList.contains('is-onContextMenu')
  ) {
    event.target.parentNode.classList.remove('is-onContextMenu');
  }

  const newDragElement = document.createElement('div');
  const countElement = document.createElement('span');
  const innerDragElement = document.createElement('div');
  const imgTag = catalogItemRef.current.querySelector('.catalogItem__media img');
  const src = imgTag ? imgTag.getAttribute('src') : '';

  newDragElement.classList.add('dragElement');
  countElement.classList.add('countDragElements');
  innerDragElement.classList.add('innerDragElement');

  if (src) {
    innerDragElement.style.backgroundImage = `url("${src}")`;
  } else {
    innerDragElement.style.backgroundColor = '#1c1c1c';
  }

  newDragElement.appendChild(countElement);
  newDragElement.appendChild(innerDragElement);
  window.dragElement = newDragElement;
  document.body.appendChild(newDragElement);
};

export default handleMouseDown;
