import _map from 'lodash/map';
import _filter from 'lodash/filter';

import TYPES from '../action-types';
import * as helpers from '../helpers/collections';
import { getTreeWithCollections } from './helpers/archive';
import * as utils from '../../shared/utils';

const qs = window.location.search.replace(/^\?/, '');
const notRecursiveSearch = !!utils.deconstructQueryString(qs).recursive || false;

const defaultState = {
	isLoaded: false,
	collections: null,
	activeCollectionID: null,
	activeCollection: null,
	error: null,
	search: {
		query: '',
		collections: null,
		isSearching: false,
	},
	notRecursiveSearch,
	activeCollectionHasChild: null,
};

export default function(state = defaultState, action) {
	const { type, payload, error } = action;

	const unsetActive = (actionType) => {
		if (actionType === 'archive/setActiveCollection'
			|| actionType === 'lightboards/setActiveLightboard'
			|| actionType === 'inboxes/setActiveInbox') {
			return actionType;
		}
		return null;
	};

	switch (type) {
		/* Get collections */
		case TYPES.COLLECTIONS.FETCH.START: {
			return {
				...state,
				isLoaded: false,
				error: null,
			};
		}
		case TYPES.COLLECTIONS.FETCH.COMPLETE: {
			return {
				...state,
				isLoaded: true,
				error: null,
				collections: payload.tree,
			};
		}
		case TYPES.COLLECTIONS.FETCH.FAILED: {
			return {
				...state,
				isLoaded: true,
				error,
				collections: null,
			};
		}

		/* Get children */
		case TYPES.COLLECTIONS.FETCH_CHILDREN.START: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionID, 'isFetching', true),
			};
		}
		case TYPES.COLLECTIONS.FETCH_CHILDREN.COMPLETE: {
			const collections = helpers.setChildNodes(state.collections, payload.collectionID, payload.nodes);

			return {
				...state,
				collections,
				activeCollectionHasChild:
					state.activeCollectionHasChild === null
						? helpers.hasCollectionChild(collections, state.activeCollection?._id)
						: state.activeCollectionHasChild,
			};
		}
		case TYPES.COLLECTIONS.FETCH_CHILDREN.FAILED: {
			return { ...state, error };
		}

		/* Rename collection */
		case TYPES.COLLECTIONS.RENAME.START: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionID, 'isRenaming', true),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionID, 'isRenaming', true)
							: null,
				},
			};
		}
		case TYPES.COLLECTIONS.RENAME.COMPLETE: {
			return {
				...state,
				collections: helpers.renameTag(state.collections, payload.collectionID, payload.newName, payload.notify),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.renameTag(state.search.collections, payload.collectionID, payload.newName, payload.notify)
							: null,
				},
			};
		}
		case TYPES.COLLECTIONS.RENAME.FAILED: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionID, 'isRenaming', false),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionID, 'isRenaming', false)
							: null,
				},
				error,
			};
		}

		/* Search */
		case TYPES.COLLECTIONS.SEARCH.SET: {
			return {
				...state,
				search: {
					...state.search,
					query: payload.value,
					collections: payload.value.length < 3 ? null : state.search.collections,
					isSearching: payload.value.length < 3 ? false : state.search.isSearching,
				},
			};
		}
		case TYPES.COLLECTIONS.SEARCH.START: {
			return {
				...state,
				search: { ...state.search, isSearching: true },
			};
		}
		case TYPES.COLLECTIONS.SEARCH.COMPLETE: {
			return {
				...state,
				search: {
					...state.search,
					isSearching: state.search.query === payload.value ? false : state.search.isSearching,
					collections:
						state.search.query === payload.value
							? helpers.handleSearchResult(state.collections, payload.collections)
							: state.search.collections,
				},
			};
		}
		case TYPES.COLLECTIONS.SEARCH.FAILED: {
			return {
				...state,
				search: { ...state.search, isSearching: false },
				error,
			};
		}

		/* Add collection */
		case TYPES.COLLECTIONS.ADD.START: {
			return state;
		}
		case TYPES.COLLECTIONS.ADD.COMPLETE: {
			return {
				...state,
				collections: helpers.addCollection(state.collections, payload.parentID, payload.collection),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.addCollection(state.search.collections, payload.parentID, payload.collection)
							: null,
				},
			};
		}
		case TYPES.COLLECTIONS.ADD.FAILED: {
			return { ...state, error };
		}

		/** Push collections */
		case TYPES.COLLECTIONS.PUSH: {
			return {
				...state,
				collections: helpers.pushCollections(state.collections, payload.collections, payload.replace),
			};
		}

		/* Remove collection */
		case TYPES.COLLECTIONS.REMOVE.START: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionID, 'isBusy', true),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionID, 'isBusy', true)
							: null,
				},
			};
		}
		case TYPES.COLLECTIONS.REMOVE.COMPLETE: {
			return {
				...state,
				collections: helpers.removeCollection(state.collections, payload.collectionID),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.removeCollection(state.search.collections, payload.collectionID)
							: null,
				},
			};
		}
		case TYPES.COLLECTIONS.REMOVE.FAILED: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionID, 'isBusy', false),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionID, 'isBusy', false)
							: null,
				},
			};
		}

		case TYPES.COLLECTIONS.REMOVE.INPROGRESS: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionID, 'deletedByTeammate', true),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionID, 'deletedByTeammate', true)
							: null,
				},
			};
		}

		/* Add to favorites */
		case TYPES.COLLECTIONS.FAVORITE.START: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionID, 'isBusy', true),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionID, 'isBusy', true)
							: null,
				},
			};
		}
		case TYPES.COLLECTIONS.FAVORITE.COMPLETE: {
			return {
				...state,
				collections: helpers.changeFavorites(state.collections, payload.collectionID, payload.value),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.changeFavorites(state.search.collections, payload.collectionID, payload.value)
							: null,
				},
			};
		}
		case TYPES.COLLECTIONS.FAVORITE.FAILED: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionID, 'isBusy', false),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionID, 'isBusy', false)
							: null,
				},
			};
		}

		/* Change total assets count */
		case TYPES.COLLECTIONS.CHANGE_ASSETS_COUNT: {
			return {
				...state,
				collections: {
					...state.collections,
					my: {
						...state.collections.my,
						count: state.collections.my.count + payload.count,
					},
				},
			};
		}

		/* Set active collection id */
		// Deprected
		case TYPES.COLLECTIONS.SET_ACTIVE: {
			return {
				...state,
				activeCollectionID: payload.collectionID,
			};
		}

		/* Set sort type */
		case TYPES.COLLECTIONS.SET_SORT_TYPE.START: {
			return {
				...state,
				sortTypeUpdating: true,
			};
		}

		case TYPES.COLLECTIONS.SET_SORT_TYPE.COMPLETE: {
			return {
				...state,
				sortType: payload.sortType,
				sortTypeUpdating: false,
				collections: helpers.setField(state.collections, payload.collectionID, 'sortType', payload.sortType),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionID, 'sortType', payload.sortType)
							: null,
				},
				activeCollection:
					state.activeCollection._id === payload.collectionID
						? {
								...state.activeCollection,
								sortType: payload.sortType,
							}
						: {
								...state.activeCollection,
							},
			};
		}

		case TYPES.COLLECTIONS.SET_SORT_TYPE.FAILED: {
			return {
				...state,
				sortTypeUpdating: false,
			};
		}

		/* Set website */
		case TYPES.COLLECTIONS.SET_WEBSITE: {
			return {
				...state,
				collections: helpers.changeWebsite(state.collections, payload.collectionID, payload.value, payload.notify),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.changeWebsite(state.search.collections, payload.collectionID, payload.value, payload.notify)
							: null,
				},
			};
		}

		/* Set recursive search */
		case TYPES.COLLECTIONS.RECURSIVE_SEARCH_TOGGLE: {
			return {
				...state,
				notRecursiveSearch: payload.value,
			};
		}

		/* Reset recursive search */
		case TYPES.COLLECTIONS.RECURSIVE_SEARCH_SET: {
			return {
				...state,
				notRecursiveSearch: payload.value,
			};
		}

		case TYPES.COLLECTIONS.UPDATE_ROOT_COLLECTION_NAME: {
			return {
				...state,
				collections: {
					...state.collections,
					my: {
						...state.collections.my,
						name: `${payload.teamName  } library`,
					},
				},
			};
		}

		/* Add collection */
		case TYPES.COLLECTIONS.MOVE.START: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.targetCollectionId, 'isBusy', true),
			};
		}
		case TYPES.COLLECTIONS.MOVE.COMPLETE: {
			let collectionToMove = helpers.findCollection(state.collections, 'my', { _id: payload.collectionIdToMove });
			if (!collectionToMove) {
				collectionToMove = helpers.findCollection(state.search.collections, null, { _id: payload.collectionIdToMove });
			}
			let collectionToMoveParent = helpers.getParent(state.collections, 'my', { _id: payload.collectionIdToMove });
			if (!collectionToMoveParent) {
				collectionToMoveParent = helpers.getParent(state.search.collections, null, { _id: payload.collectionIdToMove });
			}
			return {
				...state,
				collections: helpers.moveCollection(
					state.collections,
					payload.targetCollectionId,
					collectionToMove,
					collectionToMoveParent,
					payload.needsFetchChildren
				),
			};
		}
		case TYPES.COLLECTIONS.MOVE.FAILED: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.targetCollectionId, 'isBusy', false),
			};
		}

		/* Change collection color */
		case TYPES.COLLECTIONS.CHANGE_COLOR.START: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionId, 'isBusy', true),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionId, 'isBusy', true)
							: null,
				},
			};
		}

		case TYPES.COLLECTIONS.CHANGE_COLOR.COMPLETE: {
			const activeCollection = {...state.activeCollection};
			if (activeCollection?._id === payload.collectionId) {
				activeCollection.color = payload.color;
			}

			return {
				...state,
				collections: helpers.setFields(
					state.collections,
					payload.collectionId,
					['color', 'isBusy'],
					[payload.color, false],
				),
				activeCollection,
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setFields(
									state.search.collections,
									payload.collectionId,
									['color', 'isBusy'],
									[payload.color, false],
								)
							: null,
				},
			};
		}

		case TYPES.COLLECTIONS.CHANGE_COLOR.FAILED: {
			return {
				...state,
				collections: helpers.setField(state.collections, payload.collectionId, 'isBusy', false),
				search: {
					...state.search,
					collections:
						state.search.collections !== null
							? helpers.setField(state.search.collections, payload.collectionId, 'isBusy', false)
							: null,
				},
			};
		}

		/* Change collection description */
		case TYPES.COLLECTIONS.CHANGE_DESCRIPTION.START: {
			const activeCollection = {...state.activeCollection};
			if (activeCollection?._id === payload.collectionId) {
				activeCollection.isDescriptionChanging = true;
			}
			return {
				...state,
				collections: helpers.setField(
					state.collections,
					payload.collectionId,
					'isDescriptionChanging',
					true
				),
			};
		}

		case TYPES.COLLECTIONS.CHANGE_DESCRIPTION.COMPLETE: {
			const activeCollection = {...state.activeCollection};
			if (activeCollection?._id === payload.collectionId) {
				activeCollection.description = payload.description;
				activeCollection.isDescriptionChanging = false;
			}
			return {
				...state,
				activeCollection,
				collections: helpers.setFields(
					state.collections,
					payload.collectionId,
					['description', 'isDescriptionChanging'],
					[payload.description, false]
				),
			};
		}

		case TYPES.COLLECTIONS.CHANGE_DESCRIPTION.FAILED: {
			const activeCollection = {...state.activeCollection};
			if (activeCollection?._id === payload.collectionId) {
				activeCollection.isDescriptionChanging = false;
			}
			return {
				...state,
				collections: helpers.setField(
					state.collections,
					payload.collectionId,
					'isDescriptionChanging',
					false
				),
			};
		}

		case 'archive/setActiveCollectionId': {
			if (payload) {
				return {
					...state,
					activeCollectionID: null
				};
			}
			return state;
		}

		case 'archive/addCollections': {
			const { collections, search } = state;
			const { collections: newCollections } = payload;
			const ids = _map(_filter(newCollections, { archived: true }), '_id');

			return {
				...state,
				collections: helpers.removeCollections(collections, ids),
				search: {
					...search,
					collections: search.collections ? helpers.removeCollections(search.collections, ids) : null,
				},
			};
		}

		case 'archive/deleteCollections': {
			const { collections, parents = [], user } = payload;
			const newCollections = _filter([...parents, ...collections], { unarchived: true });
			const options = { childsKey: 'nodes', user };
			const myCollections = getTreeWithCollections([state.collections.my], newCollections, options)[0];

			return {
				...state,
				collections: {
					...state.collections,
					my: myCollections,
				},
			};
		}

		case 'collections/incrementCount':
		case 'collections/decrementCount': {
			const { count } = state.collections.my;
			const nextCount = action.type.includes('increment') ? count + payload : count - payload;

			return {
				...state,
				collections: {
					...state.collections,
					my: {
						...state.collections.my,
						count: nextCount,
					},
				},
			};
		}

		case 'collections/setActiveCollection': {
			const { collection } = payload;

			return {
				...state,
				activeCollection: collection,
			};
		}

		case unsetActive(type): {
			if (state.activeCollection) {
				return {
					...state,
					activeCollection: null,
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
