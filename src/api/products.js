import api, { unwrap } from './axios';

export const listProducts = (params) => api.get('/products/list', { params }).then(unwrap);
export const createProduct = (payload) => api.post('/products/create', payload).then(unwrap);
export const retrieveProduct = (id) => api.get(`/products/retrieve/${id}`).then(unwrap);
export const updateProduct = (id, payload) => api.patch(`/products/update/${id}`, payload).then(unwrap);

export const listProductCategories = (params) =>
  api.get('/products/categories/list', { params }).then(unwrap);
export const createProductCategory = (payload) =>
  api.post('/products/categories/create', payload).then(unwrap);
export const retrieveProductCategory = (id) =>
  api.get(`/products/categories/retrieve/${id}`).then(unwrap);
export const updateProductCategory = (id, payload) =>
  api.patch(`/products/categories/update/${id}`, payload).then(unwrap);
