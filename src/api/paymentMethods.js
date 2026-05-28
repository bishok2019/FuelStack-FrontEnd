import api, { unwrap } from './axios';

export const listPaymentMethods = (params) =>
  api.get('/payment_method/list', { params }).then(unwrap);
export const createPaymentMethod = (payload) =>
  api.post('/payment_method/create', payload).then(unwrap);
