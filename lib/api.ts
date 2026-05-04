import {
  clearAuth,
  loadRefreshToken,
  loadToken,
  loadUser,
  saveAuthUsingCurrentStorage,
  type AuthTokens,
} from "./auth-storage";
import type { AuthUser } from "./auth-types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.25zone.io.vn";

export const apiUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

export const toAbsoluteImageUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return apiUrl(path);
};

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
};

type RefreshResponse = {
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
};

const extractTokens = (payload: Partial<RefreshResponse> | null): AuthTokens | null => {
  if (!payload) return null;
  const accessToken = String(payload.accessToken || payload.token || "").trim();
  const refreshToken = String(payload.refreshToken || "").trim();
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
};

const isAuthPath = (path: string) =>
  path.startsWith("/api/auth/login") ||
  path.startsWith("/api/auth/register") ||
  path.startsWith("/api/auth/forgot-password") ||
  path.startsWith("/api/auth/reset-password") ||
  path.startsWith("/api/auth/refresh-token");

const requestRefreshToken = async (): Promise<AuthTokens | null> => {
  const refreshToken = loadRefreshToken();
  if (!refreshToken) return null;

  const remember = true;

  const response = await fetch(apiUrl("/api/auth/refresh-token"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken,
      remember,
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as RefreshResponse | null;
  if (!response.ok) return null;

  const tokens = extractTokens(payload);
  if (!tokens) return null;

  const nextUser = payload?.user || loadUser();
  if (!nextUser) return null;

  saveAuthUsingCurrentStorage(tokens, nextUser);
  return tokens;
};

const readJson = async (response: Response) => response.json().catch(() => ({}));

export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", token, body, headers = {} } = options;
  const finalHeaders: Record<string, string> = {
    ...headers,
  };

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const activeToken = token || loadToken();
  if (activeToken) {
    finalHeaders.Authorization = `Bearer ${activeToken}`;
  }

  console.log("===> SENDING API REQUEST to:", path);
  console.log("===> HEADERS:", finalHeaders);
  console.log("===> ACTIVE TOKEN:", activeToken ? "HAS_TOKEN" : "NO_TOKEN");

  let response = await fetch(apiUrl(path), {
    method,
    headers: finalHeaders,
    body: payload,
    cache: "no-store",
  });

  // Auto refresh access token nếu hết hạn
  if (
    response.status === 401 &&
    activeToken &&
    !isAuthPath(path)
  ) {
    const refreshedTokens = await requestRefreshToken();
    if (refreshedTokens?.accessToken) {
      const retryHeaders = {
        ...finalHeaders,
        Authorization: `Bearer ${refreshedTokens.accessToken}`,
      };

      response = await fetch(apiUrl(path), {
        method,
        headers: retryHeaders,
        body: payload,
        cache: "no-store",
      });
    } else {
      clearAuth();
    }
  }

  const data = await readJson(response);

  if (!response.ok) {
    let errorMessage = data?.message || "Yêu cầu thất bại.";
    if (data?.errors) {
      errorMessage += " " + JSON.stringify(data.errors);
    }
    throw new Error(errorMessage);
  }

  return data as T;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Có lỗi xảy ra.";
