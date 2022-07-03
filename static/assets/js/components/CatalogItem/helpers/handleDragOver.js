import picsioConfig from '../../../../../../config';
import * as utils from '../../../shared/utils';
import * as UtilsCollections from '../../../store/utils/collections';
import { isRouteFiltering } from '../../../helpers/history';

let dragOverTimeout = null;
/**
 * Drag over item
 * @param {MouseEvent} event
 */
const handleDragOver = (event, isListViewMode, styles) => {
  const { clientX, clientY } = event;
  const elementLeft = event.currentTarget.getBoundingClientRect().left;

  if (
    picsioConfig.isProofing() ||
    isRouteFiltering() ||
    UtilsCollections.isRootActive()
  )
    return;

  // "indexOf" is contained in Chrome and Safari, so IF it's Chrome or Safari AND it's file from OS THEN it isn't REORDERING
  if (event.dataTransfer.types.indexOf && ~event.dataTransfer.types.indexOf('Files')) return;

  // "contains" is contained in Firefox, so IF it's Firefox AND it's file from OS THEN it isn't REORDERING
  if (
    event.dataTransfer.types.contains &&
    event.dataTransfer.types.contains('application/x-moz-file')
  )
    return;

  if (dragOverTimeout) return;

  /* debounce */
  dragOverTimeout = setTimeout(() => {
    dragOverTimeout = null;
    const cursorReorderImages = document.querySelector('.cursorReorderImages');

    if (isListViewMode) {
      /* if list mode */
      const { scrollTop } = document.querySelector('.innerCatalog');
      let top = styles.translateY;
      if (styles.height / 2 < clientY - 50 + scrollTop - top) top += styles.height;

      utils.css(cursorReorderImages, { display: 'block', top });
    } else {
      /* if grid mode */
      let left = styles.translateX - 2;
      if (elementLeft + styles.width / 2 < clientX) left += styles.width;

      if (window.dragElement) {
        utils.css(cursorReorderImages, {
          display: 'block',
          top: styles.translateY + 2,
          left,
          height: styles.height - 4,
        });
      }
    }
  }, 50);
};

export default handleDragOver;
