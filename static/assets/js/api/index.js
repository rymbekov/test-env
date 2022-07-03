import axios from 'axios';
import Logger from '../services/Logger';
import picsioConfig from '../../../../config';

// Value will be injected by Webpack DefinePlugin constant from Webpack
// eslint-disable-next-line jsx-control-statements/jsx-jcs-no-undef
const isMobileApp = __IS_MOBILE__;
const api = axios.create();

/**
 * Generic Pics.io API errors
 */
class ApiError extends Error { }

export const errors = {
  ApiError,
};

const DEFAULT_REQUEST_TIMEOUT = 1000 * 60 * 20;

const generateRequestId = () => (
  `req_${
		 Math.random()
		  .toString(36)
		  .substr(2, 12)}`
);

/**
 * To unify API interactions, all calls should be made via api.js
 * @param {string} url
 * @param {Object} params
 * @param {string?} params.type - HTTP method
 * @param {Object?} params.data
 * @param {Object?} params.headers
 * @param {string?} params.contentType - by default 'application/json'
 * @param {boolean?} params.processData
 * @param {boolean?} params.cache
 * @param {string?} params.dataType
 */
async function makeApiCall(
  url,
  {
    type = 'POST', data, params, headers, contentType = 'application/json', processData, cache, dataType, timeout = DEFAULT_REQUEST_TIMEOUT,
  },
) {
  let normalizedApiUrl = url;
  if (isMobileApp) {
    normalizedApiUrl = `${picsioConfig.getApiBaseUrl()}${url}`;
    if (url.startsWith('https://') || url.startsWith('http://')) {
      normalizedApiUrl = url;
    }
  }
  const requestId = generateRequestId();
  const request = {
    method: type,
    headers: { 'Content-Type': contentType, 'X-Request-Id': requestId },
    url: normalizedApiUrl,
    timeout,
    data: {},
  };

  if (data) {
    if (processData !== undefined) {
      request.data = data;
      request.processData = processData;
    } else {
      request.data = type === 'GET' ? data : JSON.stringify(data);
    }
  }

  if (params) {
    request.params = type === 'GET' ? params : JSON.stringify(params);
  }

  if (headers) request.headers = { ...request.headers, ...headers };
  if (dataType) request.dataType = dataType;

  if (cache !== undefined) request.cache = cache;

  Logger.addBreadcrumb(request);
  const response = await api(request);

  // legacy API support, not all API endpoints sends success
  // if sends, then we should check if that value is true
  if (typeof response === 'object' && 'success' in response && !response.success) {
    throw new Error('Unsuccesful response');
  }
  return response.data;
}

const createRequest = (type) => (url, params = {}) => makeApiCall(url, { ...params, type });

const requests = {
  get: createRequest('GET'),
  post: createRequest('POST'),
  put: createRequest('PUT'),
  del: createRequest('DELETE'),
};

export const {
  get, post, put, del,
} = requests;
export { del as delete };
export { api as instance };
