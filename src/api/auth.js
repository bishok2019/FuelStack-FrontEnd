import api, { unwrap } from './axios';

export const register = (payload) => api.post('/auth/register', payload).then(unwrap);
export const login = (payload) => api.post('/auth/login', payload).then(unwrap);
