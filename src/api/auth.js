import api, { unwrap } from './axios';

export const register = (payload) => api.post('/auth/register', payload).then(unwrap);
export const login = (payload) => api.post('/auth/login', payload).then(unwrap);
export const refreshSession = (refreshToken) =>
  api.post('/auth/refresh', null, { params: { current_refresh_token: refreshToken } }).then(unwrap);
export const logoutSession = (refreshToken) =>
  api.post('/auth/logout', { refresh_token: refreshToken }).then(unwrap);
