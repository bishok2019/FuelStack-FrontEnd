import { create } from 'zustand';

const TOKEN_KEY = 'fuelstack_token';

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
const storedUser = storedToken ? decodeJwt(storedToken) : null;

const getUserType = (user) => user?.user_type || user?.usertype || user?.userType || null;
const normalizeUserType = (userType) => (typeof userType === 'string' ? userType.toUpperCase() : userType);

export const useAuthStore = create((set) => ({
  token: storedToken,
  user: storedUser,
  userType: normalizeUserType(getUserType(storedUser)),
  setAuth: (token) => {
    const user = decodeJwt(token);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user, userType: normalizeUserType(getUserType(user)) });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, userType: null });
  },
}));

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const isSystemUser = (userType) => normalizeUserType(userType) === 'SYSTEM';
