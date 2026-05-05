/**
 * Merge giỏ hàng guest vào giỏ hàng user khi đăng nhập.
 * - Lấy cart_guest, merge vào cart_u{id}
 * - Nếu sản phẩm đã có trong cart user thì cộng thêm số lượng
 * - Sau khi merge, xoá cart_guest
 */
export function mergeGuestCartIntoUserCart(userId: string | number): void {
  if (typeof window === "undefined") return;

  const guestKey = "cart_guest";
  const userKey = `cart_u${userId}`;

  try {
    const guestCart: any[] = JSON.parse(
      localStorage.getItem(guestKey) || "[]"
    );

    if (guestCart.length === 0) return; // Không có gì để merge

    const userCart: any[] = JSON.parse(
      localStorage.getItem(userKey) || "[]"
    );

    // Merge: cộng dồn số lượng nếu sản phẩm đã tồn tại
    for (const guestItem of guestCart) {
      const existingIndex = userCart.findIndex(
        (item) => item.Id_product === guestItem.Id_product
      );

      if (existingIndex !== -1) {
        userCart[existingIndex].quantity += guestItem.quantity || 1;
      } else {
        userCart.push({ ...guestItem });
      }
    }

    // Lưu giỏ user đã merge
    localStorage.setItem(userKey, JSON.stringify(userCart));

    // Xoá giỏ guest sau khi merge
    localStorage.removeItem(guestKey);

    // Phát sự kiện cập nhật giỏ hàng
    window.dispatchEvent(new Event("cart-updated"));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Xoá giỏ hàng guest (dùng khi đăng xuất).
 * Giỏ user (cart_u{id}) được giữ nguyên để lần sau đăng nhập vẫn còn.
 */
export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("cart_guest");
    window.dispatchEvent(new Event("cart-updated"));
  } catch {
    // Ignore storage errors
  }
}
