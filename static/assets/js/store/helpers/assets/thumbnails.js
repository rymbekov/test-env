const SMALL = 500;
const BIG = 15000;
const DEFAULT = 3000;
const REDUCED = 1500;

/**
 * @param {string} url - custom thumbnail url from the server
 * @returns {Object}
 */
export function getCustomThumbnailUrls(url) {
	return {
		small: url.replace(/\.[^.]+$/, '.' + SMALL) + '.jpg',
		big: url.replace(/\.[^.]+$/, '.' + BIG) + '.jpg',
		default: url.replace(/\.[^.]+$/, '.' + DEFAULT) + '.jpg',
		reduced: url.replace(/\.[^.]+$/, '.' + REDUCED) + '.jpg',
	};
}

export function getGoogleThubnailUrls(url, metadata) {
	return {
		small: url.replace(/(.*=)(s\d+)(&.*|$)/, `$1${calculateSmallSizeSuffix(metadata)}$3`),
		big: url.replace(/(.*=)(s\d+)(&.*|$)/, '$1s0$3'),
		default: url.replace(/(.*=)(s\d+)(&.*|$)/, `$1${calculateDefaultSizeSuffix(metadata)}$3`),
		reduced: url.replace(/(.*=)(s\d+)(&.*|$)/, `$1${calculateReducedSizeSuffix(metadata)}$3`),
	};
}

/**
 * @param {Object[]} items - items from store
 * @param {Object[]} thumbnailObjects - thumbnails received from GDriveStorage
 * @returns {Object[]} newItems for store
 */
export function setGoogleThumbnailUrls(items, thumbnailObjects) {
	return items.map(item => {
		const thmb = thumbnailObjects.find(thumb => thumb._id === item._id);
		if (thmb) {
			if (thmb.notFound) {
				/** File not found in GoogleDrive */
				return { ...item, thumbnail: { error: { code: 404 } } };
			}
			if (thmb.error && !thmb.trashed) {
				return { ...item, thumbnail: thmb };
			}
			if (thmb.thumbnail) {
				return { ...item, thumbnail: thmb.thumbnail };
			}
			if (thmb.thumbnailLink) {
				const thumbnail = getGoogleThubnailUrls(thmb.thumbnailLink, item.imageMediaMetadata);
				return { ...item, thumbnail };
			}
			return { ...item, thumbnail: null };
		}
		return item;
	});
}

/**
 * @param {Object[]} items - items from store
 * @param {Object[]} thumbnailObjects - thumbnails received from GDriveStorage
 * @returns {Object[]} newItems for store
 */
export function setS3ThumbnailUrls(items, thumbnailObjects) {
	return items.map(item => {
		const thmb = thumbnailObjects.find(thumb => thumb._id === item._id);
		if (thmb) {
			if (thmb.error && !thmb.trashed) {
				return { ...item, thumbnail: thmb };
			}
      if (thmb.thumbnail && thmb.thumbnail.default) {
        return { ...item, thumbnail: thmb.thumbnail };
      }
      // @TODO: do we have this case, after we add presigned links?
			if (thmb.thumbnailLink) {
				const thumbnail = {
					small: thmb.thumbnailLink,
					big: thmb.thumbnailLink,
					default: thmb.thumbnailLink,
					reduced: thmb.thumbnailLink,
				};
				return { ...item, thumbnail };
			}
			return { ...item, thumbnail: null };
		}
		return item;
	});
}

/**
 * @param {Object[]} items - items from store
 * @param {string} id - asset _id
 * @param {string} revisionId - google revision id
 * @param {string} url - new custom thumbnail url
 * @param {Object[]?} pages
 * @param {Object?} imageSizes
 * @returns {Object[]} new items
 */
export function setCustomThumbnail(items, id, revisionId, url, pages, imageSizes, thumbnail) {
	return items.map(item => {
		if (item._id === id) {
			const clonedItem = {
				...item,
				thumbnailing: 'complete',
				thumbnail: thumbnail || getCustomThumbnailUrls(url),
			};
			clonedItem.customThumbnail = item.customThumbnail ? { ...item.customThumbnail } : {};
			clonedItem.customThumbnail[revisionId] = url;
			clonedItem.customThumbnail.head = url;
			if (pages) {
				clonedItem.pages = item.pages ? { ...item.pages } : {};
				const newPages = Object.keys(pages).map(key => ({
					id: key,
					name: pages[key].name,
					url: pages[key].url,
				}));
				clonedItem.pages[revisionId] = newPages;
				clonedItem.pages['head'] = newPages;
			}
			if (imageSizes) {
				clonedItem.imageMediaMetadata = {
					rotation: 0,
					width: imageSizes.width,
					height: imageSizes.height,
				};
			}
			return clonedItem;
		}
		return item;
	});
}

export function calculateSmallSizeSuffix(meta) {
	let size = SMALL;
	if (meta && meta.width && meta.height) {
		const { width, height } = meta;
		if (isNarrow(meta)) {
			size = parseInt((height * SMALL) / width);
		}
		if (isLong(meta)) {
			size = parseInt((width * SMALL) / height);
		}
	}
	if (size > 1000) size = SMALL; // in some cases the size may be too large
	return `s${size}`;
}

export function calculateReducedSizeSuffix(meta) {
	if (meta && meta.width && meta.height) {
		const { width, height } = meta;
		return (width > height ? 'w' : 'h') + REDUCED;
	}
	return `s${REDUCED}`;
}

export function calculateDefaultSizeSuffix(meta) {
	if (meta && meta.width && meta.height) {
		const { width, height } = meta;
		return (width > height ? 'w' : 'h') + DEFAULT;
	}
	return `s${DEFAULT}`;
}

/**
 * @param {Object} meta
 * @returns {boolean}
 */
export function isNarrow(meta) {
	return meta.height / meta.width > 3;
}

/**
 * @param {Object} meta
 * @returns {boolean}
 */
export function isLong(meta) {
	return meta.width / meta.height > 3;
}
