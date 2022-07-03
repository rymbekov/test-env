import TYPES from '../../action-types';
import reducer from '../main';

describe('reducers/main', () => {
  test('deault', () => {
    // prepare
    const state = {};
    const action = { type: 'unknownType', payload: {} };

    // invoke
    const expected = reducer(state, action);

    // expect
    expect(expected).toEqual(state);
  });
  test('TYPES.MAIN.CHANGE_TREE', () => {
    // prepare
    const state = {};
    const action = { type: TYPES.MAIN.CHANGE_TREE, payload: { name: 'myname' } };

    // invoke
    const expected = reducer(state, action);

    // expect
    expect(expected).toHaveProperty('importOpened', false);
    expect(expected).toHaveProperty('openedTree', 'myname');
    expect(expected).toHaveProperty('downloadListOpened', false);
  });

  test('TYPES.MAIN.RESIZE_PANEL', () => {
    // prepare
    const state = { panelsWidth: 99 };
    const action = {
      type: TYPES.MAIN.RESIZE_PANEL,
      payload: {
        panelsWidth: 100,
      },
    };

    // invoke
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('panelsWidth', 100);
  });

  test('TYPES.MAIN.RECALCULATE_PANEL_SIZE', () => {
    // prepare
    const state = { panelsWidth: 99 };
    const action = {
      type: TYPES.MAIN.RECALCULATE_PANEL_SIZE,
      payload: {
        newPanelsWidth: 100,
      },
    };
    // invoke
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('panelsWidth', 100);
  });

  test('TYPES.MAIN.CHANGE_CATALOG_VIEW_MODE', () => {
    // prepare
    const state = {};
    const action = {
      type: TYPES.MAIN.CHANGE_CATALOG_VIEW_MODE,
      payload: {
        type: 'mode',
      },
    };

    // invoke
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('catalogViewMode', 'mode');
  });

  test('TYPES.MAIN.OPEN_DETAILS', () => {
    // prepare
    const state = {};
    const action = {
      type: TYPES.MAIN.OPEN_DETAILS,
      payload: {
        status: 'opened',
      },
    };
    // invoke
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('isDetailsOpen', 'opened');
  });

  test('TYPES.MAIN.CLOSE_DETAILS', () => {
    // prepare
    const state = {};
    const action = {
      type: TYPES.MAIN.CLOSE_DETAILS,
      payload: {
        status: 'closed',
      },
    };
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('isDetailsOpen', 'closed');
  });

  test('TYPES.MAIN.OPEN_IMPORT', () => {
    // prepare
    const state = {
      importOpened: false,
      downloadListOpened: true,
    };
    const action = {
      type: TYPES.MAIN.OPEN_IMPORT,
      payload: {
      },
    };
    // invoke
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('importOpened', true);
    expect(expected).toHaveProperty('downloadListOpened', false);
  });
  test('TYPES.MAIN.CLOSE_IMPORT', () => {
    // prepare
    const state = {
      importOpened: true,
    };
    const action = {
      type: TYPES.MAIN.CLOSE_IMPORT,
      payload: {
      },
    };
    // invoke
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('importOpened', false);
  });

  test('TYPES.MAIN.SET_BACKLIGHT', () => {
    // prepare
    const state = {};
    const action = {
      type: TYPES.MAIN.SET_BACKLIGHT,
      payload: {
        value: 'backlight',
      },
    };
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('backlight', 'backlight');
  });

  test('TYPES.MAIN.OPEN_DOWNLOADLIST', () => {
    // prepare
    const state = {
      downloadListOpened: false,
    };
    const action = {
      type: TYPES.MAIN.OPEN_DOWNLOADLIST,
      payload: {
      },
    };
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('downloadListOpened', true);
  });
  test('TYPES.MAIN.CLOSE_DOWNLOADLIST', () => {
    // prepare
    const state = {
      downloadListOpened: true,
    };
    const action = {
      type: TYPES.MAIN.CLOSE_DOWNLOADLIST,
      payload: {
      },
    };
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('downloadListOpened', false);
  });
  test('TYPES.MAIN.SET_IS_WEBP_SUPPORTED', () => {
    // prepare
    const state = {};
    const action = {
      type: TYPES.MAIN.SET_IS_WEBP_SUPPORTED,
      payload: {
        isSupported: true,
      },
    };
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('isWebpSupported', true);
  });

  test('TYPES.MAIN.SET_MAP_VIEWPORT', () => {
    // prepare
    let state = {};
    let action = {
      type: TYPES.MAIN.SET_MAP_VIEWPORT,
      payload: {
        viewport: {
          a: 1,
          b: 2,
        },
      },
    };
    let expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('mapViewport');
    expect(expected.mapViewport).toHaveProperty('a', 1);
    expect(expected.mapViewport).toHaveProperty('b', 2);

    // unseter
    state = {};
    action = {
      type: TYPES.MAIN.SET_MAP_VIEWPORT,
      payload: {},
    };
    expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('mapViewport');
  });

  test('TYPES.MAIN.SET_ASSET_SCALE', () => {
    // prepare
    const state = {};
    const action = {
      type: TYPES.MAIN.SET_ASSET_SCALE,
      payload: {
        scale: 123,
      },
    };
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('assetScale', 123);
  });

  test('TYPES.MAIN.SET_MOBILE_MAIN_SCREEN', () => {
    // prepare
    const state = {};
    const action = {
      type: TYPES.MAIN.SET_MOBILE_MAIN_SCREEN,
      payload: {
        mobileMainScreenPanelActive: true,
        mobileMainScreenSlideWidth: 100,
      },
    };
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('mobileMainScreenPanelActive', true);
    expect(expected).toHaveProperty('mobileMainScreenSlideWidth', 100);
  });

  test('TYPES.MAIN.SET_MOBILE_ADDITIONAL_SCREEN', () => {
    // prepare
    const state = {};
    const action = {
      type: TYPES.MAIN.SET_MOBILE_ADDITIONAL_SCREEN,
      payload: {
        mobileAdditionalPanelActive: true,
      },
    };
    const expected = reducer(state, action);

    // assert
    expect(expected).toHaveProperty('mobileAdditionalPanelActive', true);
  });
});
