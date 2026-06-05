import { create } from 'zustand';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'fuelstack_token';
const REFRESH_TOKEN_KEY = 'fuelstack_refresh_token';
const USER_KEY = 'fuelstack_user';
const ACCESS_TOKEN_COOKIE_KEY = 'accessToken';
const REFRESH_TOKEN_COOKIE_KEY = 'refreshToken';

export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const storedToken = localStorage.getItem(TOKEN_KEY);
const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
const storedTokenUser = storedToken ? decodeJwt(storedToken) : null;
const storedUser = storedTokenUser || getStoredUser() ? { ...storedTokenUser, ...getStoredUser() } : null;

const getUserType = (user) => user?.user_type || user?.usertype || user?.userType || null;
const normalizeUserType = (userType) => (typeof userType === 'string' ? userType.toUpperCase() : userType);

export const useAuthStore = create((set) => ({
  token: storedToken,
  refreshToken: storedRefreshToken,
  user: storedUser,
  userType: normalizeUserType(getUserType(storedUser)),
  setAuth: (token, refreshToken, userData) => {
    const user = { ...decodeJwt(token), ...(userData || getStoredUser()) };
    localStorage.setItem(TOKEN_KEY, token);
    Cookies.set(ACCESS_TOKEN_COOKIE_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      Cookies.set(REFRESH_TOKEN_COOKIE_KEY, refreshToken);
    }
    set({
      token,
      refreshToken: refreshToken ?? localStorage.getItem(REFRESH_TOKEN_KEY),
      user,
      userType: normalizeUserType(getUserType(user)),
    });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    Cookies.remove(ACCESS_TOKEN_COOKIE_KEY);
    Cookies.remove(REFRESH_TOKEN_COOKIE_KEY);
    set({ token: null, refreshToken: null, user: null, userType: null });
  },
}));

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const isSystemUser = (userType) => normalizeUserType(userType) === 'SYSTEM';
