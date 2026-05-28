import axios from 'axios';
import { getToken, useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:8005/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export const unwrap = (response) => {
  const body = response.data;

  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    const payload = body.data;

    if (Array.isArray(payload) && body.meta) {
      return {
        data: payload,
        meta: body.meta,
        message: body.message,
        error: body.error,
        errors: body.errors,
      };
    }

    if (
      payload &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      Array.isArray(payload.data) &&
      payload.meta
    ) {
      return payload;
    }

    return payload ?? body;
  }

  return body;
};
export default api;
