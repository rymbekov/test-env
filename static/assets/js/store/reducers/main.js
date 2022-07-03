import ua from '../../ua';
import TYPES from '../action-types';

const isMobile = ua.browser.isNotDesktop();
let openedTree = JSON.parse(localStorage.getItem('picsio.treeOpened'));
const isDetailsOpen = JSON.parse(localStorage.getItem('picsio.detailsOpened'));
if (!openedTree && isMobile) {
  openedTree = 'collections';
}

const defaultState = {
  openedTree: openedTree === null ? 'collections' : openedTree,
  isDetailsOpen: isDetailsOpen === null ? true : isDetailsOpen,
  treeWidth: JSON.parse(localStorage.getItem('picsio.treeWidth')) || '300px',
  catalogViewMode: JSON.parse(localStorage.getItem('picsio.catalogViewMode')) || 'grid',
  catalogViewItemSize: parseFloat(localStorage.getItem('picsio.catalogViewItemSize')) || null,
  importOpened: false,
  backlight: false,
  panelsWidth: JSON.parse(localStorage.getItem('picsio.panelsWidth')) || {
    catalogView: { left: 300, right: 300 },
    previewView: { right: 300 },
  },
  downloadListOpened: false,
  mapViewport: null,
  assetScale: 1,
  mobileAdditionalPanelActive: 'Home',
  mobileMainScreenPanelActive: 'catalog',
  mobileMainScreenSlideWidth: 0,
  isWebpSupported: true,
};

export default function (state = defaultState, action) {
  const { type, payload } = action;
  switch (type) {
  case TYPES.MAIN.CHANGE_TREE: {
    return {
      ...state,
      importOpened: false,
      openedTree: payload.name,
      downloadListOpened: false,
    };
  }

  case TYPES.MAIN.RESIZE_PANEL: {
    return {
      ...state,
      panelsWidth: payload.panelsWidth,
    };
  }

  case TYPES.MAIN.RECALCULATE_PANEL_SIZE: {
    return {
      ...state,
      panelsWidth: payload.newPanelsWidth,
    };
  }

  case TYPES.MAIN.CHANGE_CATALOG_VIEW_MODE: {
    return {
      ...state,
      catalogViewMode: payload.type,
      catalogViewItemSize: null,
    };
  }

  case TYPES.MAIN.CHANGE_CATALOG_VIEW_MODE_SIZE: {
    return {
      ...state,
      catalogViewItemSize: payload.size,
    };
  }

  case TYPES.MAIN.OPEN_DETAILS: {
    return {
      ...state,
      isDetailsOpen: payload.status,
    };
  }

  case TYPES.MAIN.CLOSE_DETAILS: {
    return {
      ...state,
      isDetailsOpen: payload.status,
    };
  }

  case TYPES.MAIN.OPEN_IMPORT: {
    return {
      ...state,
      importOpened: true,
      downloadListOpened: false,
    };
  }

  case TYPES.MAIN.CLOSE_IMPORT: {
    return {
      ...state,
      importOpened: false,
    };
  }

  case TYPES.MAIN.SET_BACKLIGHT: {
    return {
      ...state,
      backlight: payload.value,
    };
  }

  case TYPES.MAIN.OPEN_DOWNLOADLIST: {
    return {
      ...state,
      downloadListOpened: true,
    };
  }

  case TYPES.MAIN.CLOSE_DOWNLOADLIST: {
    return {
      ...state,
      downloadListOpened: false,
    };
  }

  case TYPES.MAIN.SET_IS_WEBP_SUPPORTED: {
    return {
      ...state,
      isWebpSupported: payload.isSupported,
    };
  }

  case TYPES.MAIN.SET_MAP_VIEWPORT: {
    return {
      ...state,
      mapViewport: payload.viewport ? { ...payload.viewport } : null,
    };
  }

  case TYPES.MAIN.SET_ASSET_SCALE: {
    return {
      ...state,
      assetScale: payload.scale,
    };
  }

  case TYPES.MAIN.SET_MOBILE_MAIN_SCREEN: {
    return {
      ...state,
      mobileMainScreenPanelActive: payload.mobileMainScreenPanelActive,
      mobileMainScreenSlideWidth: payload.mobileMainScreenSlideWidth,
    };
  }

  case TYPES.MAIN.SET_MOBILE_ADDITIONAL_SCREEN: {
    return {
      ...state,
      mobileAdditionalPanelActive: payload.mobileAdditionalPanelActive,
    };
  }

  /* Default */
  default: {
    return state;
  }
  }
}
