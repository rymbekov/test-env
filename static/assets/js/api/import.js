import * as api from './index';

/**
 * Find duplicates on server
 * During upload we're looking for duplicates in selected collection
 * but we get tagId from url, what is not maybe completely right
 * @param {string[]} names
 * @param {string} tagId
 * @param {string} lightboardId
 * @returns {Promise}
 */


export const saveAsset = (data) => api.post('/images/', { data });

export const createRevision = (assetID, data) => api.post(`/images/${assetID}/revisions/`, { data });
