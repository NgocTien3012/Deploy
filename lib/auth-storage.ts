import type { AuthUser } from "./auth-types";

const ACCESS_TOKEN_KEY = "25zone_auth_access_token";
const REFRESH_TOKEN_KEY = "25zone_auth_refresh_token";
const USER_KEY = "25zone_auth_user";
export const AUTH_CHANGED_EVENT = "25zone-auth-changed";

// Legacy key để tương thích dữ liệu cũ chỉ có 1 token
const LEGACY_TOKEN_KEY = "25zone_auth_token";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const writeCookie = (key: string, value: string, persistent: boolean) => {
  if (typeof window === "undefined") return;
  const maxAge = persistent ? "max-age=31536000;" : "";
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; ${maxAge} SameSite=Lax`;
};

const readCookie = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
  if (match) {
    return decodeURIComponent(match[2]);
  }
  return null;
};

const removeCookie = (key: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

const notifyAuthChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
};

const parseUser = (raw: string | null): AuthUser | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const loadToken = () => {
  if (typeof window === "undefined") return null;
  return readCookie(ACCESS_TOKEN_KEY) || readCookie(LEGACY_TOKEN_KEY) || window.localStorage.getItem(ACCESS_TOKEN_KEY) || window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

export const loadRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return readCookie(REFRESH_TOKEN_KEY) || window.localStorage.getItem(REFRESH_TOKEN_KEY) || window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const loadUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  return parseUser(readCookie(USER_KEY)) || parseUser(window.localStorage.getItem(USER_KEY)) || parseUser(window.sessionStorage.getItem(USER_KEY));
};

const clearAllAuthKeys = () => {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
  removeCookie(LEGACY_TOKEN_KEY);
  removeCookie(USER_KEY);
  
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.sessionStorage.removeItem(LEGACY_TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
  }
};

export const saveAuth = (
  tokens: AuthTokens,
  user: AuthUser,
  persistent = true
) => {
  if (typeof window === "undefined") return;

  clearAllAuthKeys();
  writeCookie(ACCESS_TOKEN_KEY, tokens.accessToken, persistent);
  writeCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, persistent);
  writeCookie(USER_KEY, JSON.stringify(user), persistent);
  
  const target = persistent ? window.localStorage : window.sessionStorage;
  target.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  target.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  target.setItem(USER_KEY, JSON.stringify(user));

  notifyAuthChanged();
};

export const saveAuthUsingCurrentStorage = (tokens: AuthTokens, user: AuthUser) => {
  saveAuth(tokens, user, true);
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  clearAllAuthKeys();
  notifyAuthChanged();
};
