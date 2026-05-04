
import { loadUser } from "./auth-storage";

export const getUserStorageKey = (base: "cart" | "favorites"): string => {
  if (typeof window === "undefined") return `${base}_guest`;
  try {
    const user = loadUser();
    if (user?.Id_user) return `${base}_u${user.Id_user}`;
  } catch {
    // ignore
  }
  return `${base}_guest`;
};
