import picsioConfig from '../../../../config';
import * as api from './index';

/**
 * Get favorites
 * @returns {Promise}
 */
export const getFavorites = () => api.get('/tags/favorites');

/**
 * Get websites
 * @returns {Promise}
 */
export const getWebsites = () => api.get('/tags/websites');

/**
 * Get root
 * @returns {Promise}
 */
export const getRoot = () => api.get('/v2/tags/root');

/**
 * Get children for collection
 * @param {string} collectionID
 * @param {string?} currentCollectionId
 * @returns {Promise}
 */
export const getChildren = (collectionID, { currentCollectionId, forceAll = false, archived = false } = {}) => {
  let url;
  const params = {};

  if (picsioConfig.isProofing()) {
    url = `${picsioConfig.getApiBaseUrl()}/public/collections/${collectionID}/children`;
    params.alias = window.websiteConfig.alias;
  } else {
    url = `/tags/${collectionID}`;
  }

  if (currentCollectionId) params.targetCollectionId = currentCollectionId;
  if (forceAll) params.forceAll = true;
  if (archived) params.archived = true;

  return api.get(url, { params });
};

/**
 * Get collection
 * @param {string} collectionID
 * @returns {Promise}
 */
export const getCollection = (collectionID) => api.get(`/v2/tags/${collectionID}`);

export const getCollections = (ids) => api.post('/tags/collections', { data: { ids } });

/**
 * Add collection
 * @param {Object} data
 * @returns {Promise}
 */
export const add = (data) => api.post('/tags', { data });

/**
 * Remove collection
 * @param {string} collectionID
 * @returns {Promise}
 */
export const remove = (collectionID) => api.del(`/tags/${collectionID}`);

/**
 * Set favorites
 * @param {string} path
 * @param {boolean} value
 * @returns {Promise}
 */
export const setFavorites = (path, value) => api.put('/tags/favorites/', { data: { path, value } });

/**
 * Set sort type
 * @param {string} collectionID
 * @param {string} sortType
 * @returns {Promise}
 */
export const setSortType = (collectionID, sortType) => api.put(`/tag/${collectionID}`, { data: { sortType } });

/**
 * Search
 * @param {string} query
 * @returns {Promise}
 */
export const search = (query, params = {}) => api.get(`/tags/search/${encodeURIComponent(query)}`, { params });

/**
 * Change collection color
 * @param {string} collectionID
 * @param {string} color
 */
export const setColor = (collectionID, color) => api.put(`/tags/${collectionID}/changeColor`, { data: { color } });

/**
 * Change collection description
 * @param {string} collectionID
 * @param {string} description
 */
export const setDescription = (collectionID, description) => api.put(`/tags/${collectionID}/changeDescription`, { data: { description } });

/**
 * Archive collection by id. Also you can send body with reason message.
 * @param {string} collectionId
 * @param {object} data - { reason = '' }
 * @returns {Promise}
 */
export const archiveCollection = (collectionId, reason = '') => api.post(`/tags/${collectionId}/archive`, { data: { reason } });

/**
 * Unarchive collection by id
 * @param {string} collectionId
 * @returns {Promise}
 */
export const unarchiveCollection = (collectionId) => api.post(`/tags/${collectionId}/unarchive`);
