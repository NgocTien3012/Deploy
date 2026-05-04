"use client";
import { getUserStorageKey } from "@/lib/user-storage";

export function useFavorites() {
  const getKey = () => getUserStorageKey("favorites");

  const getFavorites = () => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(getKey()) || "[]");
    } catch {
      return [];
    }
  };

  const isFavorite = (productId: number | string) => {
    const list = getFavorites();
    return list.some((item: any) => item.Id_product === productId);
  };

  const toggleFavorite = (product: any) => {
    const list = getFavorites();
    const index = list.findIndex((item: any) => item.Id_product === product.Id_product);

    let message = "";
    if (index !== -1) {
      list.splice(index, 1);
      message = "Đã bỏ yêu thích sản phẩm này!";
    } else {
      list.push(product);
      message = "Đã thêm vào danh sách yêu thích!";
    }

    localStorage.setItem(getKey(), JSON.stringify(list));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("favorites-updated"));
      window.dispatchEvent(new CustomEvent("favorites-toast", {
        detail: { message, product }
      }));
    }

    return getFavorites();
  };

  const removeFavorite = (productId: number | string) => {
    const list = getFavorites();
    const updated = list.filter((item: any) => item.Id_product !== productId);
    localStorage.setItem(getKey(), JSON.stringify(updated));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("favorites-updated"));
    }
    return updated;
  };

  return { getFavorites, isFavorite, toggleFavorite, removeFavorite };
}
