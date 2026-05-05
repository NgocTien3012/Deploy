"use client";
import { useCallback } from "react";
import { getUserStorageKey } from "@/lib/user-storage";
import { loadToken, loadUser } from "@/lib/auth-storage";
import { apiUrl } from "@/lib/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getLocalKey = () => getUserStorageKey("favorites");

const getLocalFavorites = (): any[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(getLocalKey()) || "[]");
  } catch {
    return [];
  }
};

const setLocalFavorites = (list: any[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getLocalKey(), JSON.stringify(list));
};

/** Gọi API với Bearer token nếu có */
const authFetch = (path: string, options: RequestInit = {}) => {
  const token = loadToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(apiUrl(path), { ...options, headers, cache: "no-store" });
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFavorites() {
  const isLoggedIn = useCallback(() => {
    if (typeof window === "undefined") return false;
    const user = loadUser();
    return Boolean(user?.Id_user && loadToken());
  }, []);

  /** Lấy danh sách yêu thích từ localStorage (dùng để render UI ngay lập tức) */
  const getFavorites = useCallback(() => getLocalFavorites(), []);

  /** Kiểm tra 1 sản phẩm có đang được yêu thích không (local) */
  const isFavorite = useCallback((productId: number | string) => {
    const list = getLocalFavorites();
    return list.some((item: any) => item.Id_product == productId);
  }, []);

  /**
   * Đồng bộ danh sách yêu thích từ DB về localStorage.
   * Gọi sau khi đăng nhập hoặc khi cần refresh dữ liệu.
   */
  const syncFromDB = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await authFetch("/api/users/favorites");
      if (!res.ok) return;
      const data = await res.json();
      const favorites: any[] = data.favorites || [];
      setLocalFavorites(favorites);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("favorites-updated"));
      }
    } catch (err) {
      console.error("Lỗi đồng bộ yêu thích từ DB:", err);
    }
  }, [isLoggedIn]);

  /**
   * Toggle yêu thích một sản phẩm.
   * - Nếu đã đăng nhập: gọi API và cập nhật localStorage theo kết quả DB
   * - Nếu chưa đăng nhập: chỉ lưu local
   */
  const toggleFavorite = useCallback(async (product: any) => {
    const list = getLocalFavorites();
    const index = list.findIndex((item: any) => item.Id_product == product.Id_product);

    let message = "";
    let isAdding = index === -1;

    if (isLoggedIn()) {
      // ── Đã đăng nhập: gọi API ──
      try {
        const res = await authFetch("/api/users/favorites/toggle", {
          method: "POST",
          body: JSON.stringify({ productId: product.Id_product }),
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // Nếu server trả về HTML (như lỗi 404 hoặc 503 trên cPanel)
          message = `Lỗi server cPanel: API chưa được cập nhật (Mã lỗi ${res.status})`;
          throw new Error("Server did not return JSON");
        }

        const data = await res.json();

        if (res.ok) {
          message = data.message || (data.isFavorite ? "Đã thêm vào danh sách yêu thích!" : "Đã bỏ yêu thích sản phẩm này!");
          isAdding = data.isFavorite;

          // Cập nhật local theo kết quả thực tế từ DB
          if (data.isFavorite) {
            if (index === -1) list.push(product);
          } else {
            if (index !== -1) list.splice(index, 1);
          }
          setLocalFavorites(list);
        } else {
          message = data.message || "Có lỗi xảy ra.";
        }
      } catch (err: any) {
        console.error("Lỗi toggle yêu thích:", err);
        if (!message) message = "Không thể kết nối server.";
      }
    } else {
      // ── Chưa đăng nhập: chỉ lưu local ──
      if (index !== -1) {
        list.splice(index, 1);
        message = "Đã bỏ yêu thích sản phẩm này!";
        isAdding = false;
      } else {
        list.push(product);
        message = "Đã thêm vào danh sách yêu thích!";
        isAdding = true;
      }
      setLocalFavorites(list);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("favorites-updated"));
      window.dispatchEvent(
        new CustomEvent("favorites-toast", {
          detail: { message, product },
        })
      );
    }

    return getLocalFavorites();
  }, [isLoggedIn]);

  /**
   * Xóa một sản phẩm khỏi danh sách yêu thích.
   */
  const removeFavorite = useCallback(async (productId: number | string) => {
    if (isLoggedIn()) {
      try {
        await authFetch(`/api/users/favorites/${productId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Lỗi xóa yêu thích:", err);
      }
    }

    const list = getLocalFavorites().filter(
      (item: any) => item.Id_product != productId
    );
    setLocalFavorites(list);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("favorites-updated"));
    }
    return list;
  }, [isLoggedIn]);

  return { getFavorites, isFavorite, toggleFavorite, removeFavorite, syncFromDB };
}
