import { uploadFile } from '../helpers/fileUploader';
import * as api from './index';

export const createWebsite = (collectionId, data) => api.post(`/websites/${collectionId}`, { data });

export const updateWebsite = (collectionId, data) => api.put(`/websites/${collectionId}`, { data });

export const fetchWebsiteData = (websiteId) => api.get(`/websites/${websiteId}`);

export const deleteWebsite = (collectionId) => api.del(`/websites/${collectionId}`);

export const checkDomain = (alias) => api.get(`/websites/domain?alias=${alias}`);

export const fetchWebsiteTemplates = () => api.get('/websites/templates');

export const uploadLogo = (websiteId, file) => uploadFile(`/websites/${websiteId}/logo`, file, { method: 'POST' });
export const deleteLogo = (websiteId) => api.del(`/websites/${websiteId}/logo`);

export const uploadAvatar = (websiteId, file) => uploadFile(`/websites/${websiteId}/avatar`, file, { method: 'POST' });
export const deleteAvatar = (websiteId) => api.del(`/websites/${websiteId}/avatar`);

export const uploadFavicon = (websiteId, file) => uploadFile(`/websites/${websiteId}/favicon`, file, { method: 'POST' });
export const deleteFavicon = (websiteId) => api.del(`/websites/${websiteId}/favicon`);

export const uploadBackground = (websiteId, file) => uploadFile(`/websites/${websiteId}/background`, file, { method: 'POST' });
export const deleteBackground = (websiteId) => api.del(`/websites/${websiteId}/background`);

export const websiteValidateAlias = (websiteAlias) => api.get(`/websites/validateAlias?alias=${websiteAlias}`);
export const websiteValidateAliasWithWebsiteId = (websiteAlias, websiteId) => api.get(`/websites/validateAlias?alias=${websiteAlias}&collectionId=${websiteId}`);
