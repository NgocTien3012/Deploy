"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { AccountShell } from "@/app/components/account/AccountShell";
import { useAuth } from "@/app/components/auth/AuthProvider";
import type { AuthUser } from "@/lib/auth-types";
import { apiRequest, errorMessage, toAbsoluteImageUrl } from "@/lib/api";

export default function AccountInfoPage() {
  const { user, token, setUser, refreshProfile, bootstrapped } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(user?.Name_user || "");
  const [email, setEmail] = useState(user?.Email || "");
  const [phone, setPhone] = useState(user?.Phone || "");
  const [address, setAddress] = useState(user?.Address || "");

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setName(user?.Name_user || "");
    setEmail(user?.Email || "");
    setPhone(user?.Phone || "");
    setAddress(user?.Address || "");
  }, [user]);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
      setError("Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 số).");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Vui lòng nhập đúng định dạng email.");
      return;
    }
    
    if (!address.trim() || address.trim().length < 5) {
      setError("Vui lòng nhập địa chỉ cụ thể hợp lệ (ít nhất 5 ký tự).");
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest<{ message: string; user: AuthUser }>("/api/users/me", {
        method: "PUT",
        token,
        body: {
          name,
          email,
          phone,
          address,
        },
      });

      if (response.user) {
        setUser(response.user);
      }
      setSuccess(response.message || "Cập nhật thành công.");
      await refreshProfile();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!token) return;
    setError("");
    setSuccess("");

    try {
      setAvatarLoading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.25zone.io.vn"}/api/users/me/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Tải ảnh thất bại.");
      }

      await refreshProfile();
      setSuccess(data?.message || "Cập nhật ảnh đại diện thành công.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAvatarLoading(false);
    }
  };

  const avatar = toAbsoluteImageUrl(user?.Image) || "/img/image%202.png";

  if (!bootstrapped) {
    return (
      <main className="max-w-[1604px] mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Đang tải thông tin...
        </div>
      </main>
    );
  }

  if (!user || !token) {
    return (
      <main className="max-w-[1604px] mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-700 font-semibold">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
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
          <span className="text-gray-700 font-extrabold">Thông tin cá nhân</span>
        </div>
      </div>

      <section className="max-w-[1604px] mx-auto px-4 py-10">
        <AccountShell active="info">
          <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#003366]">Thông tin cá nhân</h3>
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt={user.Name_user}
                  className="w-14 h-14 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-bold text-[#33B1FA] hover:underline"
                    disabled={avatarLoading}
                  >
                    {avatarLoading ? "Đang tải ảnh..." : "Đổi ảnh đại diện"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        uploadAvatar(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <form onSubmit={submitProfile} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                    value={phone}
                    maxLength={10}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ hiện tại</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#003366] text-white px-6 py-3 font-extrabold hover:bg-[#002244] transition disabled:opacity-70"
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </AccountShell>
      </section>
    </main>
  );
}
