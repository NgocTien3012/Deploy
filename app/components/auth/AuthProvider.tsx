"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "@/lib/api";
import {
  AUTH_CHANGED_EVENT,
  clearAuth,
  loadRefreshToken,
  loadToken,
  loadUser,
  saveAuth,
  saveAuthUsingCurrentStorage,
  type AuthTokens,
} from "@/lib/auth-storage";
import type { AuthUser } from "@/lib/auth-types";
import { clearGuestCart, mergeGuestCartIntoUserCart } from "@/lib/cart-merge";

type AuthContextValue = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  bootstrapped: boolean;
  signIn: (tokens: AuthTokens, user: AuthUser, remember?: boolean) => void;
  signOut: () => void;
  refreshProfile: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const signOut = useCallback(() => {
    const currentAccessToken = loadToken();
    const currentRefreshToken = loadRefreshToken();

    if (currentRefreshToken || currentAccessToken) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.25zone.io.vn"}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(currentAccessToken
              ? { Authorization: `Bearer ${currentAccessToken}` }
              : {}),
          },
          body: JSON.stringify({
            refreshToken: currentRefreshToken,
          }),
          cache: "no-store",
        },
      ).catch(() => {
        // ignore network errors on sign out
      });
    }

    // Xoá giỏ hàng guest khi đăng xuất (giỏ user vẫn được giữ nguyên)
    clearGuestCart();

    setToken(null);
    setRefreshToken(null);
    setUserState(null);
    clearAuth();
  }, []);

  const syncStateFromStorage = useCallback(() => {
    const storedAccessToken = loadToken();
    const storedRefreshToken = loadRefreshToken();
    const storedUser = loadUser();

    if (!storedAccessToken || !storedRefreshToken || !storedUser) {
      setToken(null);
      setRefreshToken(null);
      setUserState(null);
      return;
    }

    setToken(storedAccessToken);
    setRefreshToken(storedRefreshToken);
    setUserState(storedUser);
  }, []);

  const signIn = useCallback(
    (nextTokens: AuthTokens, nextUser: AuthUser, remember = true) => {
      setToken(nextTokens.accessToken);
      setRefreshToken(nextTokens.refreshToken);
      setUserState(nextUser);
      saveAuth(nextTokens, nextUser, remember);
      // Merge giỏ hàng guest vào giỏ hàng của user sau khi đăng nhập
      if (nextUser?.Id_user) {
        mergeGuestCartIntoUserCart(nextUser.Id_user);
      }
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    const currentAccessToken = loadToken();
    const currentRefreshToken = loadRefreshToken();
    if (!currentAccessToken || !currentRefreshToken) {
      signOut();
      return null;
    }

    try {
      const response = await apiRequest<{ user: AuthUser }>("/api/users/me", {
        token: currentAccessToken,
      });

      const latestAccessToken = loadToken();
      const latestRefreshToken = loadRefreshToken();
      const tokensToPersist: AuthTokens = {
        accessToken: latestAccessToken || currentAccessToken,
        refreshToken: latestRefreshToken || currentRefreshToken,
      };

      setToken(tokensToPersist.accessToken);
      setRefreshToken(tokensToPersist.refreshToken);
      setUserState(response.user);
      saveAuthUsingCurrentStorage(tokensToPersist, response.user);
      return response.user;
    } catch {
      signOut();
      return null;
    }
  }, [signOut]);

  const setUser = useCallback(
    (nextUser: AuthUser) => {
      const currentAccessToken = token || loadToken();
      const currentRefreshToken = refreshToken || loadRefreshToken();
      if (!currentAccessToken || !currentRefreshToken) return;

      const nextTokens: AuthTokens = {
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
      };

      setUserState(nextUser);
      saveAuthUsingCurrentStorage(nextTokens, nextUser);
    },
    [token, refreshToken],
  );

  useEffect(() => {
    const storedAccessToken = loadToken();
    const storedRefreshToken = loadRefreshToken();
    const storedUser = loadUser();

    if (!storedAccessToken || !storedRefreshToken || !storedUser) {
      signOut();
      setBootstrapped(true);
      return;
    }

    setToken(storedAccessToken);
    setRefreshToken(storedRefreshToken);
    setUserState(storedUser);
    refreshProfile().finally(() => setBootstrapped(true));
  }, [refreshProfile, signOut]);

  // Auto sync auth state if token/user is changed by apiRequest or another tab.
  useEffect(() => {
    const handleChanged = () => {
      syncStateFromStorage();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleChanged as EventListener);
    window.addEventListener("storage", handleChanged);

    // Poll cookie for cross-port (cross-app) sync
    const getCookieToken = () => {
      const match = document.cookie.match(new RegExp('(^| )25zone_auth_access_token=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    let lastToken = getCookieToken();
    const intervalId = setInterval(() => {
      const currentToken = getCookieToken();
      if (currentToken !== lastToken) {
        lastToken = currentToken;
        if (!currentToken) {
           // Token is gone -> user logged out from another app
           signOut();
        } else {
           // Token changed -> user logged in from another app
           handleChanged();
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleChanged as EventListener);
      window.removeEventListener("storage", handleChanged);
      clearInterval(intervalId);
    };
  }, [syncStateFromStorage, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      refreshToken,
      user,
      bootstrapped,
      signIn,
      signOut,
      refreshProfile,
      setUser,
      
    }),
    [
      token,
      refreshToken,
      user,
      bootstrapped,
      signIn,
      signOut,
      refreshProfile,
      setUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
