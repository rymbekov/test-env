import picsioConfig from '../../../../../../config';
import { showDownloadDialog } from '../../../helpers/fileDownloader';
import store from '../../../store/index';

/**
 * Start drag item
 * @param {MouseEvent} event
 * */
const handleDragStart = (event, assetId, isSelected, select, downloadFiles) => {
  if (picsioConfig.isProofing()) return;
  if (!window.dragElement) return;

  const { selectedItems } = store.getState().assets;
  // /** @type {boolean} */
  let selectedJustNow = false;
  if (!isSelected) {
    select(assetId, true);
    selectedJustNow = true;
  }

  /* if selected just now items length will change after receive new props */
  const selectedLength = selectedItems.length + Number(selectedJustNow);
  const wrapperTiles = document.querySelector('.wrapperTiles');

  window.dragElement.querySelector('.countDragElements').textContent = selectedLength;

  const dt = event.dataTransfer;
  /**
   * IE and Edge incomplete support setData and setDragImage
   * @link https://caniuse.com/#feat=dragndrop
   */
  if (typeof dt.setData === 'function')
    dt.setData('text/plain', picsioConfig.DRAG_ASSETS_EVENT_CONTENT);
  if (typeof dt.setDragImage === 'function') dt.setDragImage(window.dragElement, 0, 0);

  if (wrapperTiles) {
    wrapperTiles.classList.add('pointerEventsDisabled');
  }

  // show download dialog, if user draggedout asset from browser
  if (downloadFiles) {
    return;
  }

  const html = document.documentElement;
  let showDrag = false;
  let timeout = -1;
  let isModifiedKeyPressed = false;

  const handlerSetDragTrue = (e) => {
    isModifiedKeyPressed = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    showDrag = true;
  };
  const handlerDragLeave = () => {
    showDrag = false;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (!showDrag && !isModifiedKeyPressed) {
        showDownloadDialog();
        html.removeEventListener('dragenter', handlerSetDragTrue);
        html.removeEventListener('dragover', handlerSetDragTrue);
        html.removeEventListener('dragleave', handlerDragLeave);
      }
    }, 200);
  };

  html.addEventListener('dragenter', handlerSetDragTrue);
  html.addEventListener('dragover', handlerSetDragTrue);
  html.addEventListener('dragleave', handlerDragLeave);
};

export default handleDragStart;
