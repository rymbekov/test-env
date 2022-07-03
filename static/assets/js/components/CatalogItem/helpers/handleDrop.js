import picsioConfig from '../../../../../../config';
import * as utils from '../../../shared/utils';
import * as UtilsCollections from '../../../store/utils/collections';
import { isRouteFiltering } from '../../../helpers/history';

/** Drop item
 * @param {MouseEvent} event
 */
const handleDrop = (event, isListViewMode, number, reorder) => {
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

  let putItBefore;
  if (isListViewMode) {
    const elHeight = event.currentTarget.offsetHeight;
    const windowCursorY = event.clientY;
    const { scrollTop } = document.querySelector('.innerCatalog');

    const top = event.currentTarget.offsetTop - 2;
    const cursorYRelativeEl = windowCursorY - 50 + scrollTop - top;

    putItBefore = cursorYRelativeEl < elHeight / 2;
  } else {
    const elWidth = event.currentTarget.offsetWidth;
    const windowCursorX = event.clientX;
    const elOutherOffsetLeft = event.currentTarget.getBoundingClientRect().left;
    const cursorXRelativeEl = windowCursorX - elOutherOffsetLeft;

    putItBefore = cursorXRelativeEl < elWidth / 2;
  }

  const assetIndex = number - 1;
  // if BEFORE image - current index, else next index
  const putToPosition = putItBefore ? assetIndex : assetIndex + 1;
  reorder(putToPosition);

  // set active sort item inside topRightToolbar
  window.dispatchEvent(new Event('images:dropped'));
  utils.css(document.querySelector('.cursorReorderImages'), { display: 'none' });
};

export default handleDrop;
