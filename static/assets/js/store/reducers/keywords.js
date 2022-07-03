import uniqBy from 'lodash.uniqby';
import TYPES from '../action-types';
import * as helpers from '../helpers/keywords';

const defaultState = {
  isLoaded: false,
  isBusy: false,
  tree: null,
  all: [],
  activeKeywords: [],
  selectedKeywords: [],
  searchQuery: '',
  sortType: { type: 'createdAt', order: 'asc' },
  error: null,
};

export default function (state = defaultState, action) {
  const { type, payload, error } = action;

  switch (type) {
  /* Get keywords */
  case TYPES.KEYWORDS.FETCH.START: {
    return {
      ...state,
      isLoaded: false,
      isLoading: true,
      tree: null,
      all: [],
      error: null,
    };
  }
  case TYPES.KEYWORDS.FETCH.COMPLETE: {
    return {
      ...state,
      isLoaded: true,
      isLoading: false,
      selectedKeywords: [],
      error: null,
      tree: helpers.makeTree(payload.all, state.sortType),
      all: payload.all,
    };
  }
  case TYPES.KEYWORDS.FETCH.FAILED: {
    return {
      ...state,
      isLoaded: false,
      isLoading: false,
      error,
      tree: null,
      all: [],
    };
  }

  /* Add keyword */
  case TYPES.KEYWORDS.ADD.START: {
    return {
      ...state,
      isBusy: true,
    };
  }
  case TYPES.KEYWORDS.ADD.COMPLETE: {
    return {
      ...state,
      isBusy: false,
      tree: helpers.addKeyword(state.tree, payload.parentID, payload.keyword, state.sortType),
      all: uniqBy([...state.all, payload.keyword], '_id'),
    };
  }
  case TYPES.KEYWORDS.ADD.FAILED: {
    return { ...state, isBusy: false, error };
  }

  /* Rename keyword */
  case TYPES.KEYWORDS.RENAME.START: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isRenaming', true),
    };
  }
  case TYPES.KEYWORDS.RENAME.COMPLETE: {
    const { all, favorites, keywords } = helpers.rename(
      state.tree,
      state.all,
      payload.id,
      payload.name,
      state.sortType,
    );
    return {
      ...state,
      tree: { favorites, keywords },
      all,
    };
  }
  case TYPES.KEYWORDS.RENAME.FAILED: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isRenaming', false),
      error,
    };
  }

  /* Add to favorites */
  case TYPES.KEYWORDS.FAVORITE.START: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isBusy', true),
    };
  }
  case TYPES.KEYWORDS.FAVORITE.COMPLETE: {
    const { all, keywords, favorites } = helpers.changeFavorites(
      state.tree,
      state.all,
      payload.id,
      payload.value,
      state.sortType,
    );
    return {
      ...state,
      tree: { keywords, favorites },
      all,
    };
  }
  case TYPES.KEYWORDS.FAVORITE.FAILED: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isBusy', false),
    };
  }

  /* Remove keyword */
  case TYPES.KEYWORDS.REMOVE.INPROGRESS: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'deletedByTeammate', true),
    };
  }

  /* Move keyword */
  case TYPES.KEYWORDS.MOVE.START: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isBusy', true),
    };
  }
  case TYPES.KEYWORDS.MOVE.COMPLETE: {
    const {
      all,
      favorites,
      keywords,
    } = helpers.move(state.tree, state.all, payload.id, payload.parentID, state.sortType);
    return {
      ...state,
      tree: { favorites, keywords },
      all,
    };
  }
  case TYPES.KEYWORDS.MOVE.FAILED: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isBusy', false),
      error,
    };
  }

  /* Search */
  case TYPES.KEYWORDS.SEARCH: {
    return {
      ...state,
      searchQuery: payload.value,
      /** clear selected keywords when search */
      selectedKeywords: state.selectedKeywords.length ? [] : state.selectedKeywords,
      tree: payload.value
        ? helpers.makeSearchTree(state.all, payload.value, state.sortType)
        : helpers.makeTree(state.all, state.sortType),
    };
  }

  /* Set active */
  case TYPES.KEYWORDS.SET_ACTIVE: {
    return {
      ...state,
      activeKeywords: payload.ids,
    };
  }

  /* Sort */
  case TYPES.KEYWORDS.SORT: {
    if (state.tree) {
      return {
        ...state,
        sortType: payload.type,
        tree: {
          favorites: { ...state.tree.favorites, nodes: helpers.sort(state.tree.favorites.nodes, payload.type) },
          keywords: { ...state.tree.keywords, nodes: helpers.sort(state.tree.keywords.nodes, payload.type) },
        },
      };
    }
    return {
      ...state,
      sortType: payload.type,
    };
  }

  /* Add multiple */
  case TYPES.KEYWORDS.ADD_MULTIPLE: {
    const all = [...state.all, ...payload.keywords];
    return {
      ...state,
      isBusy: false,
      all,
      tree: helpers.makeTree(all, state.sortType),
    };
  }

  /* Set usedAt */
  case TYPES.KEYWORDS.UPDATE_USED_AT: {
    let tree = helpers.setField(state.tree, payload.id, 'usedAt', payload.value);
    // if sort by createdAt
    if (state.sortType.type === 'createdAt') {
      tree = {
        favorites: { ...tree.favorites, nodes: helpers.sort(tree.favorites.nodes, state.sortType) },
        keywords: { ...tree.keywords, nodes: helpers.sort(tree.keywords.nodes, state.sortType) },
      };
    }
    return {
      ...state,
      all: state.all.map((item) => (item._id === payload.id ? { ...item, usedAt: payload.value } : item)),
      tree,
    };
  }

  /* Update count */
  case TYPES.KEYWORDS.UPDATE_COUNT: {
    let tree = helpers.updateCount(state.tree, payload.id, payload.value);
    // if sort by count
    if (state.sortType.type === 'count') {
      tree = {
        favorites: { ...tree.favorites, nodes: helpers.sort(tree.favorites.nodes, state.sortType) },
        keywords: { ...tree.keywords, nodes: helpers.sort(tree.keywords.nodes, state.sortType) },
      };
    }
    return {
      ...state,
      all: state.all.map((item) => (item._id === payload.id ? { ...item, count: item.count + payload.value } : item)),
      tree,
    };
  }

  case 'keywords/setSelectedKeywords': {
    const { ids } = payload;

    return {
      ...state,
      selectedKeywords: ids.length === 0 ? [] : helpers.addManyToSelection(state.all, ids),
    };
  }

  case 'keywords/selectOne': {
    const { _id } = payload;
    const selectedKeywords = helpers.addToSelection(state.all, state.selectedKeywords, _id);
    return {
      ...state,
      selectedKeywords,
    };
  }

  case 'keywords/deselectOne': {
    const { _id } = payload;
    const selectedKeywords = helpers.removeFromSelection(state.all, state.selectedKeywords, _id);
    return {
      ...state,
      selectedKeywords,
    };
  }

  // DELETE Selected keywords
  case 'keywords/deleteSelectedKeywords/start': {
    const { ids } = payload;
    const { favorites, keywords } = helpers.updateKeywords(state.tree, ids, { isBusy: true });

    return {
      ...state,
      tree: { favorites, keywords },
    };
  }

  case 'keywords/deleteSelectedKeywords/complete': {
    const { ids } = payload;
    const { all, favorites, keywords } = helpers.removeKeywords(state.tree, state.all, ids);

    return {
      ...state,
      tree: { favorites, keywords },
      all,
      selectedKeywords: [],
    };
  }

  case 'keywords/deleteSelectedKeywords/failed': {
    const { ids } = payload;
    const { favorites, keywords } = helpers.updateKeywords(state.tree, ids, { isBusy: false });

    return {
      ...state,
      tree: { favorites, keywords },
      error,
    };
  }

  // MERGE Selected keywords
  case 'keywords/mergeSelectedKeywords/start': {
    const { ids } = payload;
    const { favorites, keywords } = helpers.updateKeywords(state.tree, ids, { isBusy: true });

    return {
      ...state,
      tree: { favorites, keywords },
    };
  }

  case 'keywords/mergeSelectedKeywords/complete': {
    const { ids, notMergedIds } = payload;
    const {
      all,
      favorites: favoritesRemoved,
      keywords: keywordsRemoved,
    } = helpers.removeKeywords(state.tree, state.all, ids);
    /** Remove `busy` status on children keywords, that been selected */
    const {
      favorites,
      keywords,
    } = helpers.updateKeywords(
      { favorites: favoritesRemoved, keywords: keywordsRemoved },
      notMergedIds || [],
      { isBusy: false },
    );

    return {
      ...state,
      tree: { favorites, keywords },
      all,
      selectedKeywords: [],
    };
  }

  case 'keywords/mergeSelectedKeywords/failed': {
    const { ids } = payload;
    const { favorites, keywords } = helpers.updateKeywords(state.tree, ids, { isBusy: false });

    return {
      ...state,
      tree: { favorites, keywords },
      error,
    };
  }

  /* Default */
  default: {
    return state;
  }
  }
}
