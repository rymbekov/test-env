import * as api from './index';
import picsioConfig from '../../../../config';

const BASE_URL = '/customFields';
function getProofingUrl() {
  return `${picsioConfig.getApiBaseUrl()}/public${BASE_URL}?alias=${window.websiteConfig.alias}`;
}

/**
 * Get custom fields
 * @returns {Promise}
 */
export const fetch = () => api.get(picsioConfig.isMainApp() ? BASE_URL : getProofingUrl());

/**
 * Add custom field
 * @param {Object} data
 * @param {number} data.order
 * @param {string} data.title
 * @param {string} data.type
 * @param {string} data.visibility
 * @param {boolean} data.writable
 * @returns {Promise}
 */
export const add = (data) => api.put(BASE_URL, { data: { customField: data } });

/**
 * Remove custom field
 * @param {string} title
 * @returns {Promise}
 */
export const remove = (title) => api.del(BASE_URL, {
  data: { customField: { title } },
});

/**
 * Update custom fields
 * @param {Object[]} customFields - array of custom field objects
 * @param {boolean} force - skip checking affected assets
 * @returns {Promise}
 */
export const update = (customFields, force = false) => api.post(`${BASE_URL}/update`, { data: { customFields, force } });

/**
 * Save custom fields schema
 * @param {Object[]} customFields
 * @returns {Promise}
 */
export const save = (customFields) => api.post(BASE_URL, { data: { customFields } });

/**
 * Import custom fields schema
 * @param {FormData} data
 * @returns {Promise}
 */
export const importSchema = (data) => api.post(`${BASE_URL}/import`, {
  cache: false,
  contentType: false,
  processData: false,
  data,
});
