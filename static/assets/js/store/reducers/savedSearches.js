import TYPES from '../action-types';
import * as helpers from '../helpers/savedSearches';

const defaultState = {
  isLoaded: false,
  isAdding: false,
  tree: null,
  all: [],
  searchQuery: '',
  activeSavedSearch: null,
  error: null,
};

export default function (state = defaultState, action) {
  const { type, payload, error } = action;

  const unsetActive = (actionType) => {
    if (actionType === TYPES.COLLECTIONS.SET_ACTIVE
      || actionType === TYPES.LIGHTBOARDS.SET_ACTIVE
      || actionType === 'archive/setActiveCollection'
      || actionType === 'collections/setActiveCollection'
      || actionType === 'lightboards/setActiveLightboard'
      || actionType === 'inboxes/setActiveInbox') {
      return actionType;
    }
    return null;
  };

  switch (type) {
  /* Get savedSearches */
  case TYPES.SAVEDSEARCHES.FETCH.START: {
    return {
      ...state,
      isLoaded: false,
      isLoading: true,
      tree: null,
      all: [],
      error: null,
    };
  }
  case TYPES.SAVEDSEARCHES.FETCH.COMPLETE: {
    return {
      ...state,
      isLoaded: true,
      isLoading: false,
      error: null,
      tree: helpers.makeTree(payload.savedSearches?.nodes, payload.userId),
      all: payload.savedSearches.nodes,
    };
  }
  case TYPES.SAVEDSEARCHES.FETCH.FAILED: {
    return {
      ...state,
      isLoaded: false,
      isLoading: false,
      error,
      tree: null,
      all: null,
    };
  }

  /* Add savedSearch */
  case TYPES.SAVEDSEARCHES.ADD.START: {
    return {
      ...state,
      isAdding: true,
    };
  }
  case TYPES.SAVEDSEARCHES.ADD.COMPLETE: {
    return {
      ...state,
      isAdding: false,
      tree: {
        ...state.tree,
        savedSearches: {
          ...state.tree.savedSearches,
          nodes: [...state.tree.savedSearches.nodes, payload.newItem],
        },
      },
      all: [...state.all, payload.newItem],
    };
  }
  case TYPES.SAVEDSEARCHES.ADD.FAILED: {
    return {
      ...state,
      isAdding: false,
    };
  }

  /* Remove savedSearch */
  case TYPES.SAVEDSEARCHES.REMOVE.START: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isBusy', true),
    };
  }
  case TYPES.SAVEDSEARCHES.REMOVE.COMPLETE: {
    const {
      all,
      favorites,
      savedSearches,
    } = helpers.removeSavedSearches(state.tree, state.all, payload.id);
    return {
      ...state,
      tree: { favorites, savedSearches },
      all,
    };
  }
  case TYPES.SAVEDSEARCHES.REMOVE.FAILED: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isBusy', false),
      error,
    };
  }

  /* Add to favorites */
  case TYPES.SAVEDSEARCHES.FAVORITE.START: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isBusy', true),
    };
  }
  case TYPES.SAVEDSEARCHES.FAVORITE.COMPLETE: {
    const { all, savedSearches, favorites } = helpers.changeFavorites(
      state.tree,
      state.all,
      payload.id,
      payload.userId,
    );
    return {
      ...state,
      tree: { savedSearches, favorites },
      all,
    };
  }
  case TYPES.SAVEDSEARCHES.FAVORITE.FAILED: {
    return {
      ...state,
      tree: helpers.setField(state.tree, payload.id, 'isBusy', false),
    };
  }

  /* Search */
  case TYPES.SAVEDSEARCHES.SEARCH: {
    return {
      ...state,
      searchQuery: payload.value,
      tree: payload.value
        ? helpers.makeSearchTree(state.all, payload.value, payload.userId)
        : helpers.makeTree(state.all, payload.userId),
    };
  }

  /* Set active */
  case TYPES.SAVEDSEARCHES.SET_ACTIVE: {
    return {
      ...state,
      activeSavedSearch: { ...payload.activeSavedSearch },
    };
  }

  case unsetActive(type): {
    if (state.activeSavedSearch) {
      return {
        ...state,
        activeSavedSearch: null,
      };
    }
  }

  /* Default */
  // eslint-disable-next-line no-fallthrough
  default: {
    return state;
  }
  }
}
