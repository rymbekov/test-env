import reducer from '../keywords';

const S = '→';
/**
 * |-one
 * | |-two
 * | | |-three
 * | | | |-four
 * |-five
 * | |-six
 * | | |-seven
 */
const keywords = [{
  _id: 'one',
  path: `${S}one`,
}, {
  _id: 'two',
  path: `${S}one${S}two`,
}, {
  _id: 'three',
  path: `${S}one${S}two${S}three`,
}, {
  _id: 'four',
  path: `${S}one${S}two${S}three${S}four`,
}, {
  _id: 'five',
  path: `${S}five`,
}, {
  _id: 'six',
  path: `${S}five${S}six`,
}, {
  _id: 'seven',
  path: `${S}five${S}six${S}seven`,
}];

describe('reducers/keywords', () => {
  test('default', () => {
    const state = {};
    const action = { type: 'unknown', payload: {} };
    const expected = reducer(state, action);

    expect(expected).toEqual(state);
  });

  test('selectOne', () => {
    const state = {
      all: [...keywords],
      selectedKeywords: [],
    };
    const actionForOneSelected = { type: 'keywords/selectOne', payload: { _id: 'four' } };
    const actionForTwoSelected = { type: 'keywords/selectOne', payload: { _id: 'three' } };
    const actionForFourSelected = { type: 'keywords/selectOne', payload: { _id: 'one' } };

    expect(reducer(state, actionForOneSelected).selectedKeywords.length).toBe(1);
    expect(reducer(state, actionForFourSelected).selectedKeywords.length).toBe(4);
    expect(reducer(state, actionForTwoSelected).selectedKeywords.length).toBe(2);
  });

  test('Should select one of two with the same beginning', () => {
    const state = {
      all: [
        ...keywords,
        { _id: 'four', path: `${S}beginning` },
        { _id: 'five', path: `${S}beginning_and_another` },
      ],
      selectedKeywords: [],
    };

    const action = {
      type: 'keywords/selectOne',
      payload: { _id: 'four' },
    };

    expect(reducer(state, action).selectedKeywords.length).toBe(1);
  });

  test('deselectOne', () => {
    const state = {
      all: [...keywords],
      selectedKeywords: ['one', 'two', 'three'],
    };
    const actionForNoSelected = { type: 'keywords/deselectOne', payload: { _id: 'three' } };
    const actionForTwoSelected = { type: 'keywords/deselectOne', payload: { _id: 'one' } };
    const actionForOneSelected = { type: 'keywords/deselectOne', payload: { _id: 'two' } };

    expect(reducer(state, actionForNoSelected).selectedKeywords.length).toBe(0);
    expect(reducer(state, actionForTwoSelected).selectedKeywords.length).toBe(2);
    expect(reducer(state, actionForOneSelected).selectedKeywords.length).toBe(1);
  });

  test('setSelected', () => {
    const state = {
      all: [...keywords],
      selectedKeywords: ['four'],
    };
    const actionForNoSelected = {
      type: 'keywords/setSelectedKeywords', payload: { ids: [] },
    };
    const actionForSevenSelected = {
      type: 'keywords/setSelectedKeywords', payload: { ids: ['one', 'five'] },
    };
    const actionForFourSelected = {
      type: 'keywords/setSelectedKeywords', payload: { ids: ['six', 'three'] },
    };
    const actionForTwoSelected = {
      type: 'keywords/setSelectedKeywords', payload: { ids: ['seven', 'four'] },
    };
    const actionForThreeSelected = {
      type: 'keywords/setSelectedKeywords', payload: { ids: ['five'] },
    };

    expect(reducer(state, actionForNoSelected).selectedKeywords.length).toBe(0);
    expect(reducer(state, actionForSevenSelected).selectedKeywords.length).toBe(7);
    expect(reducer(state, actionForFourSelected).selectedKeywords.length).toBe(4);
    expect(reducer(state, actionForTwoSelected).selectedKeywords.length).toBe(2);
    expect(reducer(state, actionForThreeSelected).selectedKeywords.length).toBe(3);
  });
});
