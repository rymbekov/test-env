import TYPES from "../action-types";

const defaultState = {
	isLoaded: false,
	lightboards: [],
	filtredLightboards: null,
	activeLightboardID: null,
	activeLightboard: null,
	searchQuery: '',
	error: null,
	isBusy: false,
};

const SEPARATOR = '→';

export default function(state = defaultState, action) {
	const { type, payload, error } = action;

	const unsetActive = (actionType) => {
		if (actionType === TYPES.COLLECTIONS.SET_ACTIVE
			// || actionType === TYPES.KEYWORDS.SET_ACTIVE
			|| actionType === TYPES.SAVEDSEARCHES.SET_ACTIVE
			|| actionType === 'archive/setActiveCollection'
			|| actionType === 'collections/setActiveCollection'
			|| actionType === 'inboxes/setActiveInbox') {
			return actionType;
		}
		return null;
	};

	switch (type) {
		/* Get lightboards */
		case TYPES.LIGHTBOARDS.FETCH.START: {
			return {
				...state,
				isLoaded: false,
				isLoading: true,
				error: null,
			};
		}
		case TYPES.LIGHTBOARDS.FETCH.COMPLETE: {
			return {
				...state,
				isLoaded: true,
				isLoading: false,
				error: null,
				lightboards: payload.lightboards,
			};
		}
		case TYPES.LIGHTBOARDS.FETCH.FAILED: {
			return {
				...state,
				isLoaded: false,
				isLoading: false,
				error,
				lightboards: [],
			};
		}

		/* Set sort type */
		case TYPES.LIGHTBOARDS.SET_SORT_TYPE: {
			return {
				...state,
				sortType: payload.value,
				lightboards: state.lightboards.map((lightboard) => {
					const copy = { ...lightboard };
					if (payload.lightboardID === copy._id) {
						copy.sortType = payload.value;
					}
					return copy;
				}),
				activeLightboard:
					state.activeLightboard._id === payload.lightboardID
						? {
								...state.activeLightboard,
								sortType: payload.value,
							}
						: {
								...state.activeLightboard,
							},
			};
		}

		/* Rename */
		case TYPES.LIGHTBOARDS.RENAME.START: {
			return {
				...state,
				lightboards: state.lightboards.map(lightboard => {
					const copy = { ...lightboard };
					if (payload.lightboardID === copy._id) {
						copy.isBusy = true;
					}
					return copy;
				})
			};
		}
		case TYPES.LIGHTBOARDS.RENAME.COMPLETE: {
			return {
				...state,
				lightboards: state.lightboards.map(lightboard => {
					const copy = { ...lightboard };
					if (payload.lightboardID === copy._id) {
						copy.isBusy = false;
						copy.path = payload.path;
					}
					return copy;
				})
			};
		}
		case TYPES.LIGHTBOARDS.RENAME.FAILED: {
			return {
				...state,
				lightboards: state.lightboards.map(lightboard => {
					const copy = { ...lightboard };
					if (payload.lightboardID === copy._id) {
						copy.isBusy = false;
					}
					return copy;
				}),
				error: payload.error
			};
		}

		/* Remove */
		case TYPES.LIGHTBOARDS.REMOVE.START: {
			return {
				...state,
				lightboards: state.lightboards.map(lightboard => {
					const copy = { ...lightboard };
					if (payload.lightboardID === copy._id) {
						copy.isBusy = true;
					}
					return copy;
				})
			};
		}
		case TYPES.LIGHTBOARDS.REMOVE.COMPLETE: {
			return {
				...state,
				lightboards: state.lightboards.filter(lb => lb._id !== payload.id)
			};
		}
		case TYPES.LIGHTBOARDS.REMOVE.FAILED: {
			return {
				...state,
				lightboards: state.lightboards.map(lightboard => {
					const copy = { ...lightboard };
					if (payload.lightboardID === copy._id) {
						copy.isBusy = false;
					}
					return copy;
				}),
				error: payload.error,
			};
		}

		/* Add */
		case TYPES.LIGHTBOARDS.ADD.START: {
			const { optimisticResponse } = payload;

			return {
				...state,
				isBusy: true,
				lightboards: [...state.lightboards, optimisticResponse],
			};
		}
		case TYPES.LIGHTBOARDS.ADD.COMPLETE: {
			const { lightboard, optimiticId } = payload;

			return {
				...state,
				isBusy: false,
				lightboards: state.lightboards.map(item => {
					const { _id } = item;

					if (_id === optimiticId) {
						return lightboard;
					}
					return item;
				}),
			};
		}
		case TYPES.LIGHTBOARDS.ADD.FAILED: {
			return {
				...state,
				isBusy: false,
				error,
			};
		}

		/* Search */
		case TYPES.LIGHTBOARDS.SEARCH: {
			return {
				...state,
				searchQuery: payload.value,
				filtredLightboards: payload.value
					? state.lightboards.filter(node =>
							node.path
								.split(SEPARATOR)
								.pop()
								.toLowerCase()
								.includes(payload.value.toLowerCase())
						)
					: null
			};
		}

		/* Update sortType */
		case TYPES.LIGHTBOARDS.UPDATE_SORT_TYPE.START: {
			return {
				...state,
				sortTypeUpdating: true,
				lightboards: state.lightboards.map(lightboard => {
					const copy = { ...lightboard };
					if (payload.id === copy._id) {
						copy.isBusy = true;
					}
					return copy;
				})
			};
		}
		case TYPES.LIGHTBOARDS.UPDATE_SORT_TYPE.COMPLETE: {
			return {
				...state,
				sortTypeUpdating: false,
				sortType: payload.sortType,
				lightboards: state.lightboards.map((lightboard) => {
					const copy = { ...lightboard };
					if (payload.lightboardID === copy._id) {
						copy.sortType = payload.sortType;
					}
					return copy;
				}),
				activeLightboard:
					state.activeLightboard._id === payload.lightboardID
						? {
								...state.activeLightboard,
								sortType: payload.sortType,
							}
						: {
								...state.activeLightboard,
							},
			};
		}
		case TYPES.LIGHTBOARDS.UPDATE_SORT_TYPE.FAILED: {
			return {
				...state,
				sortTypeUpdating: false,
				lightboards: state.lightboards.map(lightboard => {
					const copy = { ...lightboard };
					if (payload.lightboardID === copy._id) {
						copy.isBusy = false;
					}
					return copy;
				}),
				error: payload.error
			};
		}

		case 'lightboards/setActiveLightboard': {
			const { lightboard } = payload;

			return {
				...state,
				activeLightboard: lightboard,
			};
		}

		case unsetActive(type): {
			if (state.activeLightboard) {
				return {
					...state,
					activeLightboard: null,
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
