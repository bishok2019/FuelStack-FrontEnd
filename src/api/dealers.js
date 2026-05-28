import api, { unwrap } from './axios';

export const listBrands = (params) => api.get('/dealers/brands/list', { params }).then(unwrap);
export const createBrand = (payload) => api.post('/dealers/brands/create', payload).then(unwrap);

export const listDealers = (params) => api.get('/dealers/list', { params }).then(unwrap);
export const createDealer = (payload) => api.post('/dealers/create', payload).then(unwrap);

export const listHubs = (params) => api.get('/dealers/hubs/list', { params }).then(unwrap);
export const createHub = (payload) => api.post('/dealers/hubs/create', payload).then(unwrap);
