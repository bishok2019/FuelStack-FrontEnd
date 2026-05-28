import api, { unwrap } from './axios';

export const listUsers = (params) => api.get('/users/list', { params }).then(unwrap);
export const createUser = (payload) => api.post('/users/create', payload).then(unwrap);
export const retrieveUser = (id) => api.get(`/users/retrieve/${id}`).then(unwrap);
export const updateUser = (id, payload) => api.patch(`/users/update/${id}`, payload).then(unwrap);
