import api, { unwrap } from './axios';

export const listOrders = (params) => api.get('/orders/list', { params }).then(unwrap);
export const createOrder = (payload) => api.post('/orders/create', payload).then(unwrap);
export const retrieveOrder = (id) => api.get(`/orders/retrieve/${id}`).then(unwrap);
