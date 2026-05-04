"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AccountShell } from "@/app/components/account/AccountShell";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { apiRequest, errorMessage, toAbsoluteImageUrl } from "@/lib/api";

type OrderDetailItem = {
  Id_product: number;
  Quantity: number;
  Price: number;
  Name_product: string;
  Size: string | null;
  Image_url: string | null;
};

type OrderDetail = {
  Id_order: number;
  Order_code: string;
  Created_order: string;
  Total_amount: number;
  Discount_amount: number;
  Final_amount: number;
  Status: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
  Status_payment: number;
  Receiver_name: string;
  Phone: string;
  Province: string;
  Ward: string;
  Address_detail: string;
  Payment_method_name: string | null;
  items: OrderDetailItem[];
};

const statusMap: Record<
  OrderDetail["Status"],
  { label: string; className: string; icon: string }
> = {
  pending: { label: "Chờ xác nhận", className: "bg-amber-50 text-amber-700", icon: "fa-clock" },
  confirmed: { label: "Đã xác nhận", className: "bg-indigo-50 text-indigo-700", icon: "fa-check" },
  processing: { label: "Đang giao", className: "bg-sky-50 text-sky-700", icon: "fa-truck-fast" },
  completed: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700", icon: "fa-circle-check" },
  cancelled: { label: "Đã hủy", className: "bg-rose-50 text-rose-700", icon: "fa-ban" },
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { token, user, bootstrapped } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token || !params?.orderId) return;
      setError("");
      try {
        setLoading(true);
        const response = await apiRequest<{ order: OrderDetail }>(`/api/orders/me/${params.orderId}`, {
          token,
        });
        setOrder(response.order);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, params?.orderId]);

  const statusInfo = useMemo(
    () => (order ? statusMap[order.Status] || statusMap.pending : statusMap.pending),
    [order]
  );

  if (!bootstrapped) {
    return (
      <main className="max-w-[1604px] mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Đang tải chi tiết đơn hàng...
        </div>
      </main>
    );
  }

  if (!user || !token) {
    return (
      <main className="max-w-[1604px] mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-700 font-semibold">Vui lòng đăng nhập để xem chi tiết đơn hàng.</p>
          <Link
            href="/"
            className="inline-flex mt-4 rounded-xl bg-[#003366] px-5 py-3 text-white font-bold hover:bg-[#002244] transition"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="max-w-[1604px] mx-auto px-4 mt-10 text-[15px] sm:text-base text-gray-500">
        <div className="flex flex-wrap items-center gap-2">
          <Link className="hover:text-[#003366] font-semibold transition" href="/">
            Trang chủ
          </Link>
          <i className="fa-solid fa-chevron-right text-[11px] text-gray-300"></i>
          <span className="text-gray-700 font-semibold">Tài khoản</span>
          <i className="fa-solid fa-chevron-right text-[11px] text-gray-300"></i>
          <Link className="hover:text-[#003366] font-semibold transition" href="/account/orders">
            Đơn hàng của tôi
          </Link>
          <i className="fa-solid fa-chevron-right text-[11px] text-gray-300"></i>
          <span className="text-gray-700 font-extrabold">#{order?.Order_code || params?.orderId}</span>
        </div>
      </div>

      <section className="max-w-[1604px] mx-auto px-4 py-10">
        <AccountShell active="orders">
          <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            {loading && (
              <div className="p-6 text-sm text-gray-600">Đang tải dữ liệu đơn hàng...</div>
            )}

            {error && (
              <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              </div>
            )}

            {!loading && !error && !order && (
              <div className="p-6">
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-600">
                  Không tìm thấy đơn hàng.
                </div>
              </div>
            )}

            {!loading && !error && order && (
              <>
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-extrabold text-[#003366]">
                          Chi tiết đơn hàng <span className="text-gray-900">#{order.Order_code}</span>
                        </h3>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${statusInfo.className}`}
                        >
                          <i className={`fa-solid ${statusInfo.icon}`}></i>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-2">
                          <i className="fa-solid fa-calendar text-gray-400"></i>
                          Ngày đặt:
                          <span className="font-semibold text-gray-800">{formatDateTime(order.Created_order)}</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <i className="fa-solid fa-credit-card text-gray-400"></i>
                          Thanh toán:
                          <span className="font-semibold text-gray-800">
                            {order.Payment_method_name || "Không xác định"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/account/orders"
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
                      >
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Quay lại
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                      <div className="border border-gray-200 rounded-2xl p-5">
                        <h4 className="font-extrabold text-[#003366] flex items-center gap-2">
                          <i className="fa-solid fa-bag-shopping text-[#33B1FA]"></i>
                          Sản phẩm trong đơn
                        </h4>

                        <div className="mt-4 space-y-4">
                          {order.items.map((item) => (
                            <div key={item.Id_product} className="rounded-2xl border border-gray-100 p-4">
                              <div className="flex gap-4">
                                <img
                                  alt={item.Name_product}
                                  className="w-20 h-20 rounded-xl border border-gray-200 object-cover"
                                  src={toAbsoluteImageUrl(item.Image_url) || "/img/image%2077.png"}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-extrabold text-gray-900 truncate">{item.Name_product}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {item.Size ? `Phân loại: ${item.Size}` : "Phân loại: Mặc định"}
                                  </p>
                                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                    <span className="text-gray-600">
                                      Số lượng: <span className="font-semibold text-gray-800">{item.Quantity}</span>
                                    </span>
                                    <span className="text-gray-600">
                                      Đơn giá: <span className="font-semibold text-gray-800">{formatMoney(item.Price)}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right hidden sm:block">
                                  <p className="text-xs text-gray-500">Thành tiền</p>
                                  <p className="font-extrabold text-[#8b1e1e] tabular-nums">
                                    {formatMoney(Number(item.Price) * Number(item.Quantity))}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                      <div className="lg:sticky lg:top-24 space-y-6">
                        <div className="border border-gray-200 rounded-2xl p-5">
                          <h4 className="font-extrabold text-[#003366] flex items-center gap-2">
                            <i className="fa-solid fa-location-dot text-[#33B1FA]"></i>
                            Địa chỉ nhận hàng
                          </h4>

                          <div className="mt-3 text-sm text-gray-700 space-y-1">
                            <p className="font-extrabold text-gray-900">{order.Receiver_name}</p>
                            <p>{order.Phone}</p>
                            <p className="text-gray-600">
                              {[order.Address_detail, order.Ward, order.Province].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-2xl p-5">
                          <h4 className="font-extrabold text-[#003366] flex items-center gap-2">
                            <i className="fa-solid fa-receipt text-[#33B1FA]"></i>
                            Tổng thanh toán
                          </h4>

                          <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Tạm tính</span>
                              <span className="font-semibold text-gray-900 tabular-nums">
                                {formatMoney(order.Total_amount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Giảm giá</span>
                              <span className="font-semibold text-emerald-700 tabular-nums">
                                -{formatMoney(order.Discount_amount)}
                              </span>
                            </div>
                            <div className="h-px bg-gray-200" />
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 font-extrabold">Tổng</span>
                              <span className="font-extrabold text-[#8b1e1e] text-lg tabular-nums">
                                {formatMoney(order.Final_amount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Trạng thái thanh toán</span>
                              <span className="font-semibold text-gray-800">
                                {Number(order.Status_payment) === 1 ? "Đã thanh toán" : "Chưa thanh toán"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </AccountShell>
      </section>
    </main>
  );
}

