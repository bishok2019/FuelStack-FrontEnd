import axios from 'axios';
import { getRefreshToken, getToken, useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:8005/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const authPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
const isAuthPath = (url = '') => authPaths.some((path) => url.includes(path));

const extractAccessToken = (data) => data?.access_token || data?.token || data?.jwt;
const extractRefreshToken = (data) => data?.refresh_token || data?.refreshToken || data?.refresh;
const isTokenExpiredError = (error) => error.response?.data?.message === 'Token has expired';

const refreshAccessToken = (refreshToken) => {
  refreshPromise =
    refreshPromise ||
    api
      .post('/auth/refresh', null, { params: { current_refresh_token: refreshToken } })
      .then(unwrap)
      .finally(() => {
        refreshPromise = null;
      });

  return refreshPromise;
};

const saveRefreshData = (refreshData) => {
  const nextToken = extractAccessToken(refreshData);
  const nextRefreshToken = extractRefreshToken(refreshData);

  if (nextToken) {
    useAuthStore.getState().setAuth(nextToken, nextRefreshToken);
  }

  return nextToken;
};

api.interceptors.request.use((config) => {
  if (isAuthPath(config.url)) return config;

  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      isTokenExpiredError(error) &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthPath(originalRequest.url)
    ) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        originalRequest._retry = true;

        try {
          const refreshData = await refreshAccessToken(refreshToken);
          const nextToken = saveRefreshData(refreshData);

          if (nextToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${nextToken}`;
            return api(originalRequest);
          }
        } catch {
          // Fall through to the normal logout redirect below.
        }
      }
    }

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
