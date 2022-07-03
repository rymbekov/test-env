import * as api from './index';

/**
 * Get all lightboards
 * @returns {Promise}
 */
export const getAll = () => api.get('/lightboards');

/**
 * Rename lightboard
 * @param {string} id
 * @param {string} path
 * @returns {Promise}
 */
export const rename = (id, path) => api.put(`/lightboards/${id}/rename`, { data: { path } });

/**
 * Delete lightboard
 * @param {string} id
 * @returns {Promise}
 */
export const remove = id => api.del(`/lightboards/${id}`);

/**
 * Add lightboard
 * @param {string} path
 * @returns {Promise}
 */
export const add = path => api.post('/lightboards', { data: { path } });

/**
 * Set sort type
 * @param {string} lightboardID
 * @param {string} sortType
 * @returns {Promise}
 */
export const setSortType = (id, sortType) => api.put(`/lightboards/${id}/setSort`, { data: { sortType } });

/**
 * Get lightboards folder Id
 * @returns {Promise}
 */
export const getLightboardsFolderId = () => api.get('/lightboards/getLightboardsFolderId');
