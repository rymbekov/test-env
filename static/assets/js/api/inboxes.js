import * as api from './index';
import picsioConfig from '../../../../config';

/** @TODO - when api replaced with sdk -> move this endpoints to inbox app helpers */

/**
 * Check captcha
 * @param {String} token
 * @returns {Promise}
 */
export const checkCaptcha = (token) => api.put(`${picsioConfig.getInboxApiBaseUrl()}/checkCaptcha`, { data: { token } });

/**
 * Notify team about assets limit
 * @param {String} inboxId
 * @returns {Promise}
 */
export const notifyAboutAssetsLimit = (inboxId) => api.put(`${picsioConfig.getInboxApiBaseUrl()}/notifyAboutAssetsLimit`, { data: { inboxId } });
