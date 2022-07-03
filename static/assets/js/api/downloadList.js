import picsioConfig from '../../../../config';
import * as api from './index';
import { prepareSearchQuery } from './assets';

/**
 * Send downloaded notifications
 * @param {Array} assets
 * @returns {Promise}
 */
export const sendDownloadedNotification = assets => {
	assets = assets.reduce((acc, item) => {
		// exclude archives and assets with convertation
		if (item.name && item._id && !item.pollUrl) {
			acc.push({
				name: item.name,
				_id: item._id,
			});
		}
		return acc;
	}, []);

	// can be, when we was downloading archives
	if (!assets.length) return;

	let url;
	if (!picsioConfig.isMainApp()) {
		const {alias} = window.websiteConfig;
		url = `${picsioConfig.getApiBaseUrl()}/public/images/downloaded?alias=${alias}`;
	} else {
		url = '/images/downloaded';
	}

	return api.post(url, {
		headers: { 'Picsio-API-Token': 'XPhOfbce8lGLXNnfCAAzE9mp3IesIT0P' },
		data: { assets },
	});
};

export const getDownloadOriginalData = ({ fields }) =>
	api.post('/images/search', { data: { size: 'all', ...prepareSearchQuery(), fields } });

export const getCollectionAssets = (tagId, archived) => api.post('/images/search', {
	data: {
		size: 'all',
		archived,
		responseSchema: {
			full: 1,
			images: {
				_id: 1,
				googleId: 1,
				storageId: 1,
				name: 1,
				mimeType: 1,
				restrictSettings: 1,
				permissions: { downloadFiles: 1 },
				fileSize: 1
			},
			total: 1
		},
		tagId,
	},
});

/**
 * Get urls to download from zipper
 * @param {Object} data
 * @param {string} storageType
 * @returns {Promise}
 */
export const getZipUrls = (data, storageType) => {
	let zipperUrl = picsioConfig.services.zipper.URL;
	if (storageType === 'gd') {
		zipperUrl = picsioConfig.services.zipper.URL_GD;
	}
	if (storageType === 's3') {
		zipperUrl = picsioConfig.services.zipper.URL_S3;
	}
	return api.post(zipperUrl, { dataType: 'json', data });
};
