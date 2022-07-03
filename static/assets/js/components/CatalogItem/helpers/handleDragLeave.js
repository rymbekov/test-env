import * as utils from '../../../shared/utils';

const handleDragLeave = () => {
  utils.css(document.querySelector('.cursorReorderImages'), { display: 'none' });
};

export default handleDragLeave;
