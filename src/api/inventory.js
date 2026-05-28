import api, { unwrap } from './axios';

export const listInventory = (params) => api.get('/inventory/list', { params }).then(unwrap);
export const createInventory = (payload) => api.post('/inventory/create', payload).then(unwrap);
export const retrieveInventory = (id) => api.get(`/inventory/retrieve/${id}`).then(unwrap);
export const updateInventory = (id, payload) => api.patch(`/inventory/update/${id}`, payload).then(unwrap);
export const deleteInventory = (id) => api.delete(`/inventory/delete/${id}`).then(unwrap);
