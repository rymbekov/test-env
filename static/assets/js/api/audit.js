import * as api from './index';

export const fetchEvents = params => api.get('/events/audit', { params });
