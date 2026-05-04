"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthProvider";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-extrabold text-gray-900 tabular-nums">{value}</span>
    </div>
  );
}

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, bootstrapped } = useAuth();

  useEffect(() => {
    if (!bootstrapped) return;
    if (!token || !orderId) {
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `https://api.25zone.io.vn/api/orders/me/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          setOrder(null);
          return;
        }

        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error("Lỗi fetch order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, token, bootstrapped]);

  if (loading) return <div className="p-10">Đang tải...</div>;

  if (!order) return <div className="p-10">Không tìm thấy đơn hàng</div>;

  const orderCode = order.Order_code || order.Id_order;

  return (
    <main>
      {/* Breadcrumb */}
      <div className="max-w-[1604px] mx-auto px-4 mt-10 text-[15px] sm:text-base text-gray-500">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="hover:text-[#003366] font-semibold transition"
            href="/"
          >
            Trang chủ
          </Link>
          <i className="fa-solid fa-chevron-right text-[11px] text-gray-300"></i>
          <span className="text-gray-700 font-semibold">Thanh toán</span>
          <i className="fa-solid fa-chevron-right text-[11px] text-gray-300"></i>
          <span className="text-gray-700 font-extrabold">
            Đặt hàng thành công
          </span>
        </div>
      </div>

      <section className="max-w-[1604px] mx-auto px-4 py-10">
        <div className="border border-gray-200 rounded-3xl bg-white shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-2xl text-emerald-600"></i>
              </div>

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#003366]">
                  Đặt hàng thành công!
                </h1>
                <p className="mt-1 text-gray-600">
                  Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là{" "}
                  <span className="font-extrabold text-gray-900">
                    #{orderCode}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT */}
              <div className="lg:col-span-8 space-y-6">
                {/* Order Info */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <h3 className="font-extrabold text-[#003366]">
                    Thông tin đơn hàng
                  </h3>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <Row label="Mã đơn" value={`#${orderCode}`} />
                      <div className="h-px bg-gray-100 my-3" />
                      <Row
                        label="Ngày đặt"
                        value={new Date(order.Created_order).toLocaleDateString(
                          "vi-VN",
                        )}
                      />
                      <div className="h-px bg-gray-100 my-3" />
                      <Row
                        label="Trạng thái"
                        value={
                          order.Status === "pending"
                            ? "Chờ xác nhận"
                            : order.Status
                        }
                      />
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-4">
                      <Row
                        label="Thanh toán"
                        value={order.payment_method_name || "COD"}
                      />
                      <div className="h-px bg-gray-100 my-3" />
                      <Row label="Vận chuyển" value="Giao tiêu chuẩn" />
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <h3 className="font-extrabold text-[#003366]">
                    Địa chỉ nhận hàng
                  </h3>

                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <p className="font-extrabold text-gray-900">
                      {order.Receiver_name}
                    </p>
                    <p>{order.Phone}</p>
                    <p className="text-gray-600">
                      {order.Address_detail}, {order.Ward}, {order.Province}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:col-span-4">
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-2xl p-5">
                    <h3 className="font-extrabold text-[#003366]">
                      Tóm tắt đơn hàng
                    </h3>

                    <div className="mt-4 space-y-4">
                      {order.items.map((item: any) => (
                        <div
                          key={item.Id_product}
                          className="rounded-2xl border border-gray-100 p-4"
                        >
                          <div className="flex gap-3">
                            <img
                              src={`https://api.25zone.io.vn${item.Image_url}`}
                              alt={item.Name_product}
                              className="w-14 h-14 rounded-xl border border-gray-200 object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-gray-900 truncate">
                                {item.Name_product}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                SL: {item.Quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold text-[#8b1e1e]">
                                {item.Price.toLocaleString("vi-VN")}đ
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Tạm tính</span>
                        <span>
                          {order.Total_amount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Giảm giá</span>
                        <span className="text-emerald-700">
                          -{order.Discount_amount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>

                      <div className="h-px bg-gray-200" />

                      <div className="flex justify-between">
                        <span className="font-extrabold">Tổng</span>
                        <span className="font-extrabold text-[#8b1e1e] text-lg">
                          {order.Final_amount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>

                    <div className="mt-5">
                      <Link
                        href="/products"
                        className="w-full inline-flex items-center justify-center rounded-xl bg-[#003366] px-4 py-3 text-sm font-extrabold text-white"
                      >
                        Tiếp tục mua sắm
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
