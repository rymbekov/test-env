import TYPES from './../action-types';
import pull from 'lodash.pull';

const defaultState = {
	items: [],
	totalCount: 0,
	totalSize: 0,
};

export default function(state = defaultState, action) {
	const { type, payload } = action;

	switch (type) {
		case TYPES.DOWNLOAD_LIST.ADD: {
			const items = [...state.items];
			let totalCount = state.totalCount;
			let totalSize = state.totalSize;

			payload.items.forEach(item => {
				items.push(item);
				if (!item.isSkeleton) {
					pull(items, items.find(n => n.isSkeleton));
					totalCount++;
					item.fileSize && (totalSize += +item.fileSize);
				}
			});

			return {
				...state,
				items,
				totalCount,
				totalSize,
			};
		}

		case TYPES.DOWNLOAD_LIST.REMOVE: {
			let totalCount = state.totalCount;
			let totalSize = state.totalSize;
			const items = state.items.filter(item => {
				if (payload.cids.includes(item.cid)) {
					/** cancel file status polling */
					if (item.xhr) item.xhr.abort();
					/** cancel download file */
					if (typeof item.cancel === 'function') item.cancel();

					if (item.fileSize) totalSize -= +item.fileSize;
					totalCount--;

					return false;
				}
				return true;
			});

			return {
				...state,
				items,
				totalCount,
				totalSize,
			};
		}

		case TYPES.DOWNLOAD_LIST.UPDATE: {
			const { cid, key, value, xhr } = payload;
			return {
				...state,
				items: state.items.map(item => {
					if (item.cid === cid) {
						return { ...item, [key]: value, xhr };
					}
					return item;
				}),
			};
		}

		case TYPES.DOWNLOAD_LIST.UPDATE_TOTAL: {
			const { count, size } = payload;
			return {
				...state,
				totalCount: state.totalCount + count,
				totalSize: state.totalSize + size,
			};
		}

		case TYPES.DOWNLOAD_LIST.RESET_TOTAL: {
			return {
				...state,
				totalCount: 0,
				totalSize: 0,
			};
		}

		default: {
			return state;
		}
	}
}
