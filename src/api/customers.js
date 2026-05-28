import api, { unwrap } from './axios';

export const listCustomers = (params) => api.get('/customers/list', { params }).then(unwrap);
export const createCustomer = (payload) => api.post('/customers/create', payload).then(unwrap);
export const retrieveCustomer = (id) => api.get(`/customers/retrieve/${id}`).then(unwrap);
