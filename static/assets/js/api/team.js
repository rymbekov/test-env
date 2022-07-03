import * as api from './index';
import { uploadFile } from '../helpers/fileUploader';

export const fetchRoles = () => api.get('/teammateRoles/rolesByOwnerId');

export const addRole = (data) => api.post('/teammateRoles', { data });

export const removeRole = (roleId) => api.del('/teammateRoles', { data: { roleId } });

export const updateRole = (data) => api.put('/teammateRoles', { data });

export const assignRole = (data) => api.put('/teammates/assignRole', { data });

export const assignRoleMultiple = (data) => api.put('/teammates/assignRoleMultiple', { data });

export const setDomains = (data) => api.put('/teammates/domains', { data });

export const updateBrandingSettings = (data) => api.put('/team/branding', { data });

export const confirmTeammate = (userId) => api.post('/teammates/confirmRequest', { data: { userId } });

export const rejectTeammate = (userId) => api.post('/teammates/rejectRequest', { data: { userId } });

export const resendInviteToTeammate = (email) => api.post('/teammates/resendInvitation', { data: { email } });

export const fetchTeam = () => api.get('/teammates', { params: { includeParent: true, includeUnconfirmed: true, includeUnconfirmedByTeam: true } });

export const addTeammates = (data) => api.post('/teammates', { data });

export const removeTeammate = (email) => api.del('/teammates', { data: { email } });

export const changeTeammatePassword = (data) => api.post('/teammates/changePassword', { data });

export const updateName = (teammateId, name) => api.post('/teammates/name', { data: { teammateId, name } });

export const updatePhone = (teammateId, phone) => api.post('/teammates/phone', { data: { teammateId, phone } });

export const updatePosition = (teammateId, position) => api.post('/teammates/position', { data: { teammateId, position } });

export const updateSlackUserId = (teammateId, slackUserId) => api.post('/teammates/slackUserId', { data: { teammateId, slackUserId } });

export const uploadLogo = (file) => uploadFile('/team/logo', file, { method: 'POST' });
export const deleteLogo = () => api.del('/team/logo');

export const uploadBackground = (file) => uploadFile('/team/background', file, { method: 'POST' });
export const deleteBackground = () => api.del('/team/background');

export const uploadFavicon = (file) => uploadFile('/team/favicon', file, { method: 'POST' });
export const deleteFavicon = () => api.del('/team/favicon');

// *** fetching data for metrics
export const fetchAssetsTotal = () => api.get('/metrics/AssetsTotal/feed');

export const fetchKeywordsTotal = () => api.get('/metrics/KeywordsTotal/feed');

export const fetchCollectionsTotal = () => api.get('/metrics/CollectionsTotal/feed');

export const fetchEventsTotal = () => api.get('/metrics/EventsTotal/feed');

export const fetchTeammatesTotal = () => api.get('/metrics/TeammatesTotal/feed');

export const fetchWebsitesTotal = () => api.get('/metrics/WebsitesTotal/feed');

export const fetchPieGoogleData = () => api.get('/metrics/PieGoogleData/feed');

// number of teammates loggedin
export const fetchUserLoginStats = () => api.get('/metrics/user.login/feed');

// most active user
export const fetchTeammatesStats = () => api.get('/metrics/teammatesStats/');

// users accepted, invited
export const fetchTeammatesInvitedStats = () => api.get('/metrics/invitedUsersStats/');

export const fetchStorageStats = () => api.get('/metrics/storageStats');

/**
 * Get asset stats by assetId and event type
 * @param {string} assetId
 * @param {Array} types
 * @param {boolean} initiator
 * @returns {Promise}
 */
export const fetchAssetStatsByEvent = (assetId, types, initiator) => api.get('/metrics/assetStatsByEvents/', { params: { assetId, types, initiator } });

/**
 * Get asset stats by assetId and event type
 * @param {Array} types
 * @param {boolean} initiator
 * @returns {Promise}
 */
export const fetchAssetsStatsByEvent = (types, initiator) => api.get('/metrics/assetsStatsByEvents/', { params: { types, initiator } });

/**
 * Get top 10 assets stats by event types
 * @param {Array} types
 * @param {number} limit
 * @returns {Promise}
 */
export const fetchAssetsTopStatsByEvents = (types, limit) => api.get('/metrics/assetsTopStatsByEvents/', { params: { types, limit } });

export const fetchWebsitesSummOfVisitors = (type, collectionId) => api.get('/metrics/websiteStatsByType', { params: { collectionId, type } });

export const fetchWebsitesSummOfDownloaded = (type, collectionId) => api.get('/metrics/websiteStatsByType', { params: { collectionId, type } });

export const getSlackbotsStatus = () => api.get('/slackbots/status');

export const disconnectSlack = () => api.delete('/auth/disconnectSlack');

export const sendTestWebhook = (data) => api.post('/events/sendTestWebhook', { data });

export const addWebhook = (data) => api.post('/team/webhooks/addWebhook', { data });

export const updateWebhook = (data) => api.put('/team/webhooks/updateWebhook', { data });

export const deleteWebhook = (data) => api.del('/team/webhooks/deleteWebhook', { data });

export const uploadDictionary = (data) => api.post('/keywords/dictionary', data);

export const sendChangeStorageWebhook = (data) => api.post('https://hooks.slack.com/services/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', { data });

export const getStorageMetrics = () => api.get('/metrics/storageStats');

export const enableTwoFactorAuth = () => api.put('/auth/enableTwoFactorAuth');

export const resetTwoFactor = (userId) => api.post('/auth/resetTwoFactor', { data: { userId } });
