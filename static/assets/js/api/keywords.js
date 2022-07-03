import * as api from './index';

/**
 * Get all keywords
 * @returns {Promise}
 */
export const getAll = () => api.get('/keywords/children');

/**
 * Add keyword
 * @param {string} name
 * @param {string} parentId
 * @param {boolean} multi
 * @returns {Promise}
 */
export const add = (name, parentId, multi) => api.post('/keywords/add', { data: { parentId, name, multi } });

/**
 * Rename keyword
 * @param {string} id
 * @param {string} name
 * @returns {Promise}
 */
export const rename = (id, name) => api.put(`/keywords/rename/${id}`, { data: { name } });

/**
 * Change favorites
 * @param {string} id - keyword id
 * @param {boolean} value
 * @returns {Promise}
 */
export const setFavorite = (id, value) => api.put(`/keywords/favorites/${id}`, { data: { set: value } });

/**
 * Move keyword
 * @param {string} id
 * @param {string} parentID
 * @returns {Promise}
 */
export const move = (id, parentID) => api.put(`/keywords/move/${id}`, { data: { parentId: parentID } });

/**
 * Generate keywords
 * @param {string[]?} assetIds - if undefined -> generate for all
 * @returns {Promise}
 */
export const generate = (assetIds) => api.post('/keywords/analyze', { data: assetIds ? { assetIds } : undefined });
