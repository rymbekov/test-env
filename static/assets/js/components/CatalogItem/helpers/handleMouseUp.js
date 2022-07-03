import handleDragEnd from './handleDragEnd';

const handleMouseUp = () => {
  if (window.dragElement) {
    if (window.dragElement.parentNode) {
      window.dragElement.parentNode.removeChild(window.dragElement);
    }
    handleDragEnd();
  }
};

export default handleMouseUp;
