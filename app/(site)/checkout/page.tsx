"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthProvider";
import type { CartItem } from "@/types/cart.type";
import { getUserStorageKey } from "@/lib/user-storage";
import Toast from "@/app/components/Toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, bootstrapped } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState(1);
  const [address, setAddress] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: "success" | "error" | "warning"} | null>(null);
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await fetch(
          "https://api.25zone.io.vn/api/users/address/default",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        setAddress(data.address);
      } catch (err) {
        console.error(err);
      }
    };

    if (token) fetchAddress();
  }, [token]);

  useEffect(() => {
    if (!bootstrapped) return;

    const cartKey = getUserStorageKey("cart");
    const cart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || "[]");

    // Merge pending "Mua Ngay" item saved before login
    const pending = localStorage.getItem("pending_buynow");
    if (pending) {
      try {
        const item = JSON.parse(pending) as CartItem;
        const idx = cart.findIndex((c) => c.Id_product === item.Id_product);
        if (idx !== -1) {
          cart[idx].quantity += item.quantity;
        } else {
          cart.push(item);
        }
        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.dispatchEvent(new Event("cart-updated"));
      } catch {
        // ignore malformed
      }
      localStorage.removeItem("pending_buynow");
    }

    setCart([...cart]);
  }, [bootstrapped]);

  useEffect(() => {
    const voucher = JSON.parse(localStorage.getItem("voucher") || "null");

    if (voucher) {
      setDiscount(voucher.discount);
    }
  }, []);
  // Redirect nếu chưa login

  useEffect(() => {
    if (bootstrapped && !user) {
      router.push("/login");
    }
  }, [bootstrapped, user, router]);

  if (!bootstrapped || !user) return null;

  const total = cart.reduce((sum, item) => sum + item.Price * item.quantity, 0);

  const finalAmount = total - discount;
  const handlePlaceOrder = async () => {
    try {
      if (!token) {
        setToast({ message: "Bạn chưa đăng nhập!", type: "error" });
        return;
      }

      // ❗ Kiểm tra địa chỉ
      if (!address) {
        setToast({ message: "Bạn chưa có địa chỉ giao hàng!", type: "error" });
        return;
      }

      const formattedItems = cart.map((item) => ({
        Id_product: item.Id_product,
        Quantity: item.quantity,
        Price: item.Price,
      }));

      const res = await fetch("https://api.25zone.io.vn/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: formattedItems,
          receiver_name: address?.Receiver_name,
          phone: address?.Phone,
          province: address?.Province,
          ward: address?.Ward,
          address_detail: address?.Address_detail,
          id_payment: payment,
          total_amount: total,
          discount_amount: discount,
          final_amount: finalAmount,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("SERVER ERROR:", text);
        throw new Error("Đặt hàng thất bại");
      }

      const data = await res.json();

      localStorage.removeItem(getUserStorageKey("cart"));
      localStorage.removeItem("voucher");
      window.dispatchEvent(new Event("cart-updated"));

      if (payment === 2) {
        router.push(`/checkout/vietqr/${data.orderId}?amount=${finalAmount}`);
      } else {
        router.push(`/checkout/success/${data.orderId}`);
      }
    } catch (err) {
      console.error("LỖI ĐẶT HÀNG:", err);
      setToast({ message: "Đặt hàng thất bại!", type: "error" });
    }
  };

  return (
    <>
      <main>
        <div className="max-w-[1604px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <a
              className="hover:text-[#003366] font-semibold transition"
              href="/"
            >
              Trang chủ
            </a>
            <i className="fa-solid fa-chevron-right text-[11px] text-gray-300"></i>
            <span className="text-gray-700 font-extrabold">Thanh toán</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-[#003366]">
            Thanh Toán
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* Thông tin người nhận */}
              <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-lg text-[#003366]">
                    Thông tin người nhận
                  </h2>
                  <button
                    className="text-sm font-semibold text-blue-600 hover:underline"
                    type="button"
                    onClick={() => router.push("/account/address")}
                  >
                    Thay đổi
                  </button>
                </div>

                <div className="flex items-start gap-4 mb-5">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#003366]/10 text-[#003366] flex-shrink-0">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {address?.Receiver_name}
                    </p>
                    <p className="text-sm text-gray-600">{address?.Phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#003366]/10 text-[#003366] flex-shrink-0">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {address
                      ? `${address.Address_detail}, ${address.Ward}, ${address.Province}`
                      : "Chưa có địa chỉ giao hàng"}{" "}
                  </p>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 bg-white shadow-sm">
                <h2 className="font-semibold text-lg text-[#003366] mb-5">
                  Phương thức thanh toán
                </h2>

                {/* MoMo */}
                <label className="cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b">
                    <div className="flex items-center gap-3">
                      <input
                        className="w-4 h-4 accent-[#a50064]"
                        name="payment"
                        type="radio"
                        checked={payment === 2}
                        onChange={() => setPayment(2)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 rounded-full bg-[#003366]/10 text-[#003366] flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-qrcode"></i>
                        </span>
                        <span className="font-medium text-gray-900">
                          Thanh toán chuyển khoản (Bank)
                        </span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label className="cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        className="w-4 h-4 accent-[#003366]"
                        name="payment"
                        type="radio"
                        checked={payment === 1}
                        onChange={() => setPayment(1)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 rounded-full bg-[#003366]/10 text-[#003366] flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-truck-fast"></i>
                        </span>
                        <span className="font-medium text-gray-900">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-gray-500 hidden sm:inline">
                      Thanh toán tiền mặt khi nhận hàng
                    </span>
                  </div>
                </label>
              </div>

              {/* Ghi chú */}
              <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 bg-white shadow-sm">
                <h2 className="font-semibold text-lg text-[#003366] mb-4">
                  Ghi chú đơn hàng
                </h2>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                  rows={3}
                />
              </div>
            </div>

            {/* RIGHT - Order Summary */}
            <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 bg-white shadow-sm h-fit lg:sticky lg:top-24">
              <h2 className="font-semibold text-lg text-[#003366] mb-4">
                Đơn hàng của bạn
              </h2>

              {/* Item */}
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-gray-200"
                >
                  <div className="flex gap-4">
                    <img
                      className="w-20 h-20 object-cover border border-gray-200 rounded-xl"
                      src={`https://api.25zone.io.vn${item.Thumbnail}`}
                      alt={item.Name_product}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.Name_product}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.Size} x {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="font-semibold tabular-nums sm:ml-auto">
                    {(item.Price * item.quantity).toLocaleString()}đ
                  </span>
                </div>
              ))}

              {/* Totals */}
              <div className="space-y-3 py-4 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-receipt text-gray-400"></i>
                    Tạm tính
                  </span>
                  <span className="tabular-nums">
                    {total.toLocaleString()}đ
                  </span>{" "}
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-truck text-gray-400"></i>
                    Phí giao hàng
                  </span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-ticket text-gray-400"></i>
                    Mã giảm giá
                  </span>
                  <span className="text-red-500 font-semibold tabular-nums">
                    -{discount.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-lg border-t border-gray-200 pt-4 text-gray-900">
                <span>Tổng thanh toán</span>
                <span className="tabular-nums">
                  {" "}
                  {finalAmount.toLocaleString()}đ
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-[#003366] hover:bg-[#002244] text-white py-3 rounded-full font-semibold transition flex items-center justify-center gap-2"
                type="button"
              >
                <i className="fa-solid fa-bag-shopping"></i>
                Đặt Hàng
              </button>

              <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                Bằng việc nhấn “Đặt Hàng”, bạn đồng ý với{" "}
                <span className="text-blue-600">Điều khoản</span> và{" "}
                <span className="text-blue-600">Chính sách</span> của 25ZONE.
              </p>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
