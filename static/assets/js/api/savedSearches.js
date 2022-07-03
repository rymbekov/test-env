import * as api from './index';

/**
 * Get all savedSearches
 * @returns {Promise}
 */
export const getAll = () => api.get('/savedSearches');

/**
 * Add savedSearch
 * @param {string} name
 * @param {Object} data
 * @param {boolean} shared
 * @returns {Promise}
 */
export const add = (name, data, shared) => api.post('/savedSearches', { data: { name, data, shared } });

/**
 * Delete savedSearch
 * @param {string} id
 * @returns {Promise}
 */
export const remove = id => api.del(`/savedSearches/${id}`);

/**
 * Add to favorites savedSearch
 * @param {string} _id
 * @param {boolean} value
 * @returns {Promise}
 */
export const favorite = (_id, value) => api.put(`/savedSearches/${_id}/favorite`, { data: { value } });
