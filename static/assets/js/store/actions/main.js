import TYPES from '../action-types';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import sendEventToIntercom from '../../services/IntercomEventService';

/**
 * Change active tree
 */
export function changeTree(name, dontWriteCookie) {
  return (dispatch, getAll) => {
    const oldName = getAll().main.openedTree;
    const { isDetailsOpen } = getAll().main;
    const { downloadListOpened } = getAll().main;

    if (name === 'inbox') {
      sendEventToIntercom('Inboxes list');
    }

    if (downloadListOpened) {
      dispatch({
        type: TYPES.MAIN.CHANGE_TREE,
        payload: { name },
      });
    } else if (oldName === name) {
      if (!dontWriteCookie) {
        utils.LocalStorage.set('picsio.treeOpened', '');
      }

      dispatch({
        type: TYPES.MAIN.CHANGE_TREE,
        payload: { name: null },
      });

      const eventName = utils.capitalizeFirstLetter(oldName);
      Logger.log('User', `${eventName}PanelHide`);
    } else {
      if (!dontWriteCookie) {
        utils.LocalStorage.set('picsio.treeOpened', name);
      }

      dispatch({
        type: TYPES.MAIN.CHANGE_TREE,
        payload: { name },
      });

      if (name) {
        const eventName = utils.capitalizeFirstLetter(name);
        Logger.log('User', `${eventName}PanelShow`);
      }
      if (isDetailsOpen) {
        recalculatePanelSize()(dispatch, getAll);
      }
    }
  };
}

/**
 * Change panel's width
 */
export function resizePanel(event, panelName) {
  return (dispatch, getAll) => {
    document.body.classList.add('noselect', 'resizing');
    const windowWidth = window.innerWidth;
    const resizer = event.currentTarget;
    const panel = resizer.parentElement;
    const { panelsWidth } = getAll().main;
    const isTreeOpen = !!getAll().main.openedTree;
    const { isDetailsOpen } = getAll().main;
    const resizeRatio = panelName === 'previewView.multipage' ? 3 : isTreeOpen && isDetailsOpen ? 3 : 1.6666;

    return new Promise((resolve) => {
      const fnMousemove = (event) => {
        const proposalWidth =					panelName === 'left' || panelName === 'previewView.multipage'
          ? event.clientX - 50
          : windowWidth - event.clientX;
        const minWidthPanel = panelName === 'previewView.multipage' ? '100' : '300';
        panel.style.width = `${proposalWidth < minWidthPanel
          ? minWidthPanel
          : proposalWidth > windowWidth / resizeRatio
            ? windowWidth / resizeRatio
            : proposalWidth}px`;
      };
      const fnMouseup = () => {
        document.body.classList.remove('noselect', 'resizing');
        document.removeEventListener('mousemove', fnMousemove);
        document.removeEventListener('mouseup', fnMouseup);

        if (panelName === 'previewView.right') {
          panelsWidth.previewView.right = parseInt(panel.style.width, 10);
        } else if (panelName === 'previewView.multipage') {
          panelsWidth.previewView.multipage = parseInt(panel.style.width, 10);
        } else {
          panelsWidth.catalogView[panelName] = parseInt(panel.style.width, 10);
        }

        utils.LocalStorage.set('picsio.panelsWidth', panelsWidth);

        if (panelName === 'previewView.right' || 'right') {
          window.dispatchEvent(new Event('preview:ui:resize'));
        }
        dispatch({
          type: TYPES.MAIN.RESIZE_PANEL,
          payload: { panelsWidth },
        });
        resolve();
      };

      document.addEventListener('mousemove', fnMousemove);
      document.addEventListener('mouseup', fnMouseup);
    });
  };
}

/**
 * Set panels size
 */
export function setPanelSize() {
  return (dispatch) => {
    const panelsWidth = utils.LocalStorage && utils.LocalStorage.get('picsio.panelsWidth');
    if (panelsWidth) {
      dispatch({
        type: TYPES.MAIN.RECALCULATE_PANEL_SIZE,
        payload: { newPanelsWidth: panelsWidth },
      });
    }
  };
}

/**
 * Recalculate panels size
 */
export function recalculatePanelSize() {
  return (dispatch, getAll) => {
    const windowWidth = window.innerWidth;
    const { panelsWidth } = getAll().main;
    const isTreeOpen = !!getAll().main.openedTree;
    const { isDetailsOpen } = getAll().main;
    const resizeRatio = isTreeOpen && isDetailsOpen ? 3 : 1.6666;
    const optimalWidth = windowWidth / resizeRatio > 300 ? Math.floor(windowWidth / resizeRatio) : 300;
    const currentWidthLeftPanel = panelsWidth.catalogView.left;
    const currentWidthRightPanel = panelsWidth.catalogView.right;

    const newPanelsWidth = { ...panelsWidth };
    if (currentWidthLeftPanel + 50 + currentWidthRightPanel > (windowWidth / 100) * 70) {
      newPanelsWidth.catalogView.left = currentWidthLeftPanel < optimalWidth ? currentWidthLeftPanel : optimalWidth;
      newPanelsWidth.catalogView.right = currentWidthRightPanel < optimalWidth ? currentWidthRightPanel : optimalWidth;
      utils.LocalStorage.set('picsio.panelsWidth', panelsWidth);
      window.dispatchEvent(new Event('preview:ui:resize'));

      dispatch({
        type: TYPES.MAIN.RECALCULATE_PANEL_SIZE,
        payload: { newPanelsWidth },
      });
    }
  };
}

/**
 * Change catalog view mode
 */
export function changeCatalogViewMode(type) {
  return (dispatch) => {
    utils.LocalStorage.set('picsio.catalogViewMode', type);
    utils.LocalStorage.set('picsio.catalogViewItemSize', 0);

    dispatch({
      type: TYPES.MAIN.CHANGE_CATALOG_VIEW_MODE,
      payload: { type },
    });
  };
}

/**
 * Change catalog view mode size
 */

export function changeCatalogViewItemSize(size) {
  return (dispatch) => {
    utils.LocalStorage.set('picsio.catalogViewItemSize', size);

    dispatch({
      type: TYPES.MAIN.CHANGE_CATALOG_VIEW_MODE_SIZE,
      payload: { size },
    });
  };
}

/**
 * Open details panel at Catalog view
 */
export function openDetails() {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.OPEN_DETAILS,
      payload: { status: true },
    });

    utils.LocalStorage.set('picsio.detailsOpened', true);
  };
}

/**
 * Close details panel at Catalog view
 */
export function closeDetails() {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.CLOSE_DETAILS,
      payload: { status: false },
    });
    utils.LocalStorage.set('picsio.detailsOpened', false);
  };
}

/**
 * Toggle details panel at Catalog view
 */
export function toggleDetails() {
  return (dispatch, getAll) => {
    const selectedAssets = getAll().assets.selectedItems.length;
    const isTreeOpen = !!getAll().main.openedTree;

    if (getAll().main.isDetailsOpen) {
      closeDetails()(dispatch);
      Logger.log('User', 'InfoPanelHide');
    } else {
      openDetails()(dispatch);
      if (isTreeOpen) {
        recalculatePanelSize()(dispatch, getAll);
      }
      Logger.log('User', 'InfoPanelShow', selectedAssets);
    }
  };
}

/**
 * Open import panel
 */
export function openImport() {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.OPEN_IMPORT,
    });
  };
}

/**
 * Close import panel
 */
export function closeImport() {
  return (dispatch, getAll) => {
    dispatch({
      type: TYPES.MAIN.CLOSE_IMPORT,
    });

    // close Upload additional panel on mobile
    if (getAll().main.mobileAdditionalPanelActive === 'Upload') {
      setMobileAdditionalScreenPanel()(dispatch);
    }
  };
}

/**
 * Toggle import panel
 */
export function toggleImport() {
  return (dispatch, getAll) => {
    if (getAll().main.importOpened) {
      closeImport()(dispatch, getAll);
    } else {
      openImport()(dispatch);
      Logger.log('UI', 'AppUploadPanel');
    }
  };
}

/**
 * Set backlight
 */
export function setBacklight(value) {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.SET_BACKLIGHT,
      payload: { value },
    });
  };
}

/**
 * Open download list panel
 */
export function openDownloadList() {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.OPEN_DOWNLOADLIST,
    });
  };
}

/**
 * Close download list panel
 */
export function closeDownloadList() {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.CLOSE_DOWNLOADLIST,
    });
  };
}

/**
 * Toggle download list panel
 */
export function toggleDownloadList() {
  return (dispatch, getAll) => {
    if (getAll().main.downloadListOpened) {
      closeDownloadList()(dispatch);
    } else {
      openDownloadList()(dispatch);
      Logger.log('UI', 'AppDownloadPanel');
    }
  };
}

/**
 * Set viewport of the map
 */
export function setIsWebpSupported(isSupported) {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.SET_IS_WEBP_SUPPORTED,
      payload: { isSupported },
    });
  };
}

/**
 * Set viewport of the map
 */
export function setMapViewport(viewport) {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.SET_MAP_VIEWPORT,
      payload: { viewport },
    });
  };
}

/**
 * Set asset scale
 */
export function setAssetScale(scale) {
  return (dispatch, getAll) => {
    if (getAll().main.assetScale !== scale) {
      dispatch({
        type: TYPES.MAIN.SET_ASSET_SCALE,
        payload: { scale },
      });
    }
  };
}

/**
 * Set mobile app catalog slide
 */
export function setMobileMainScreenPanel(panel = 'catalog') {
  let mobileMainScreenSlideWidth = 0;
  switch (panel) {
  case 'details':
    mobileMainScreenSlideWidth = 'calc(-100vw + 50px)';
    break;
  case 'trees':
    document.body.classList.add('noselect-mobile');
    mobileMainScreenSlideWidth = 'calc(100vw - 50px)';
    break;
  default:
    document.body.classList.remove('noselect-mobile');
    break;
  }

  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.SET_MOBILE_MAIN_SCREEN,
      payload: {
        mobileMainScreenPanelActive: panel,
        mobileMainScreenSlideWidth,
      },
    });
  };
}

/**
 * Set mobile app catalog slide
 */
export function setMobileAdditionalScreenPanel(panel = 'Home') {
  return (dispatch) => {
    dispatch({
      type: TYPES.MAIN.SET_MOBILE_ADDITIONAL_SCREEN,
      payload: {
        mobileAdditionalPanelActive: panel,
      },
    });
  };
}
