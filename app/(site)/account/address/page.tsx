"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AccountShell } from "@/app/components/account/AccountShell";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { apiRequest, errorMessage } from "@/lib/api";

type AddressItem = {
  Id_address_ship: number;
  Receiver_name: string;
  Phone: string;
  Province: string;
  Ward: string;
  Address_detail: string;
  Is_default: boolean;
};

type AddressForm = {
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  addressDetail: string;
  isDefault: boolean;
};

const initialForm: AddressForm = {
  receiverName: "",
  phone: "",
  province: "",
  ward: "",
  addressDetail: "",
  isDefault: false,
};

const LOCATION_API_BASE = "https://provinces.open-api.vn/api";

type ProvinceOption = {
  code: number;
  name: string;
};

type WardOption = {
  code: number;
  name: string;
};

const normalizeAreaName = (value: string) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeProvinceName = (value: string) =>
  normalizeAreaName(value).replace(/^(tinh|thanh pho|tp\.?)\s+/, "").trim();

const isSameProvince = (left: string, right: string) => {
  const a = normalizeProvinceName(left);
  const b = normalizeProvinceName(right);
  return a === b || a.includes(b) || b.includes(a);
};

const isSameWard = (left: string, right: string) => {
  return normalizeAreaName(left) === normalizeAreaName(right);
};

export default function AccountAddressPage() {
  const { token, user, refreshProfile, bootstrapped } = useAuth();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [form, setForm] = useState<AddressForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);
  const [wardOptions, setWardOptions] = useState<WardOption[]>([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAddresses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await apiRequest<{ addresses: AddressItem[] }>("/api/users/me/addresses", {
        token,
      });
      setAddresses(response.addresses || []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadAddresses();
  }, [token]);

  const loadWardsByProvinceCode = useCallback(
    async (code: number, preferredWard: string = "") => {
      if (!code) {
        setWardOptions([]);
        return;
      }

      try {
        setWardLoading(true);
        const response = await fetch(`${LOCATION_API_BASE}/p/${code}?depth=3`);
        if (!response.ok) throw new Error("Không thể tải danh sách phường/xã.");
        const data = await response.json();

        const collected = new Map<string, WardOption>();
        const districts = Array.isArray(data?.districts) ? data.districts : [];
        for (const district of districts) {
          const wards = Array.isArray(district?.wards) ? district.wards : [];
          for (const ward of wards) {
            const name = String(ward?.name || "").trim();
            if (!name) continue;
            const key = normalizeAreaName(name);
            if (!collected.has(key)) {
              collected.set(key, { code: Number(ward?.code || 0), name });
            }
          }
        }

        const nextWards = Array.from(collected.values()).sort((a, b) =>
          a.name.localeCompare(b.name, "vi")
        );
        let nextWard = preferredWard;

        if (preferredWard) {
          const matched = nextWards.find((item) => isSameWard(item.name, preferredWard));
          if (matched) {
            nextWard = matched.name;
          } else {
            nextWards.unshift({ code: -1, name: preferredWard });
          }
        }

        setWardOptions(nextWards);
        if (preferredWard) {
          setForm((prev) => ({ ...prev, ward: nextWard }));
        }
      } catch (err) {
        setLocationError(errorMessage(err));
        setWardOptions(preferredWard ? [{ code: -1, name: preferredWard }] : []);
      } finally {
        setWardLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;

    const loadProvinces = async () => {
      try {
        setLocationLoading(true);
        setLocationError("");
        const response = await fetch(`${LOCATION_API_BASE}/p/`);
        if (!response.ok) throw new Error("Không thể tải danh sách tỉnh/thành phố.");
        const data = await response.json();
        const provinces = (Array.isArray(data) ? data : [])
          .map((item) => ({
            code: Number(item?.code || 0),
            name: String(item?.name || "").trim(),
          }))
          .filter((item) => item.code > 0 && item.name)
          .sort((a, b) => a.name.localeCompare(b.name, "vi"));

        if (ignore) return;
        setProvinceOptions(provinces);
      } catch (err) {
        if (ignore) return;
        setLocationError(errorMessage(err));
      } finally {
        if (!ignore) setLocationLoading(false);
      }
    };

    loadProvinces();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!provinceOptions.length || !form.province) return;
    const matched = provinceOptions.find((item) => isSameProvince(item.name, form.province));
    if (!matched) return;

    const nextCode = String(matched.code);
    if (provinceCode === nextCode && wardOptions.length) return;

    setProvinceCode(nextCode);
    if (form.province !== matched.name) {
      setForm((prev) => ({ ...prev, province: matched.name }));
    }
    void loadWardsByProvinceCode(matched.code, form.ward);
  }, [provinceOptions, form.province, form.ward, provinceCode, wardOptions.length, loadWardsByProvinceCode]);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setError("");
    setSuccess("");

    if (isEditing) {
      const original = addresses.find(a => a.Id_address_ship === editingId);
      if (original) {
        if (
          form.receiverName.trim() === original.Receiver_name &&
          form.phone === original.Phone &&
          form.province === original.Province &&
          form.ward === original.Ward &&
          form.addressDetail.trim() === original.Address_detail &&
          form.isDefault === original.Is_default
        ) {
          setError("Bạn chưa thay đổi thông tin nào.");
          return;
        }
      }
    }

    if (!form.receiverName.trim()) {
      setError("Vui lòng nhập họ tên người nhận.");
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(form.phone)) {
      setError("Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 số).");
      return;
    }

    if (!form.province || !form.ward) {
      setError("Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã.");
      return;
    }

    if (!form.addressDetail.trim() || form.addressDetail.trim().length < 5) {
      setError("Vui lòng nhập địa chỉ chi tiết cụ thể (tối thiểu 5 ký tự).");
      return;
    }

    try {
      setSaving(true);
      const path = isEditing ? `/api/users/me/addresses/${editingId}` : "/api/users/me/addresses";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        receiverName: form.receiverName,
        phone: form.phone,
        province: form.province,
        ward: form.ward,
        addressDetail: form.addressDetail,
        isDefault: form.isDefault
      };

      const response = await apiRequest<{ message: string }>(path, {
        method,
        token,
        body: payload,
      });

      setSuccess(response?.message || "Lưu địa chỉ thành công.");
      setForm(initialForm);
      setEditingId(null);
      setProvinceCode("");
      setWardOptions([]);
      await loadAddresses();
      await refreshProfile();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onSetDefault = async (id: number) => {
    if (!token) return;
    setError("");
    setSuccess("");
    try {
      const response = await apiRequest<{ message: string }>(`/api/users/me/addresses/${id}/default`, {
        method: "PATCH",
        token,
      });
      setSuccess(response.message || "Đặt địa chỉ mặc định thành công.");
      await loadAddresses();
      await refreshProfile();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const onDelete = async (id: number) => {
    if (!token) return;
    setError("");
    setSuccess("");
    try {
      const response = await apiRequest<{ message: string }>(`/api/users/me/addresses/${id}`, {
        method: "DELETE",
        token,
      });
      setSuccess(response.message || "Xóa địa chỉ thành công.");
      await loadAddresses();
      await refreshProfile();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const onEdit = (address: AddressItem) => {
    setEditingId(address.Id_address_ship);
    setProvinceCode("");
    setWardOptions([]);
    setForm({
      receiverName: address.Receiver_name,
      phone: address.Phone,
      province: address.Province,
      ward: address.Ward,
      addressDetail: address.Address_detail,
      isDefault: address.Is_default,
    });
    setSuccess("");
    setError("");
  };

  if (!bootstrapped) {
    return (
      <main className="max-w-[1604px] mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Đang tải danh sách địa chỉ...
        </div>
      </main>
    );
  }

  if (!user || !token) {
    return (
      <main className="max-w-[1604px] mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-700 font-semibold">Vui lòng đăng nhập để quản lý địa chỉ.</p>
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
          <span className="text-gray-700 font-extrabold">Địa chỉ giao hàng</span>
        </div>
      </div>

      <section className="max-w-[1604px] mx-auto px-4 py-10">
        <AccountShell active="address">
          <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#003366]">Địa chỉ giao hàng</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Chọn một địa chỉ mặc định và thêm địa chỉ mới khi cần.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {loading && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Đang tải dữ liệu địa chỉ...
                </div>
              )}

              {!loading && addresses.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
                  Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên.
                </div>
              )}

              {addresses.map((address) => (
                <div key={address.Id_address_ship} className="rounded-2xl border border-gray-100 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-gray-900">{address.Receiver_name}</p>
                        <span className="text-gray-300">|</span>
                        <p className="font-semibold text-gray-700 tabular-nums">{address.Phone}</p>
                        {address.Is_default && (
                          <span className="inline-flex items-center rounded-full bg-[#33B1FA]/10 text-[#003366] px-3 py-1 text-xs font-extrabold">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                        {[address.Address_detail, address.Ward, address.Province].filter(Boolean).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-extrabold text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => onEdit(address)}
                      >
                        <i className="fa-solid fa-pen"></i>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-extrabold text-red-600 hover:bg-red-50 transition"
                        onClick={() => onDelete(address.Id_address_ship)}
                      >
                        <i className="fa-solid fa-trash"></i>
                        Xóa
                      </button>
                    </div>
                  </div>

                  {!address.Is_default && (
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#003366] text-sm font-extrabold text-[#003366] hover:bg-[#003366] hover:text-white transition"
                        onClick={() => onSetDefault(address.Id_address_ship)}
                      >
                        <i className="fa-solid fa-star"></i>
                        Đặt làm mặc định
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-2" id="add-address">
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <p className="font-extrabold text-[#003366]">
                      {isEditing ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Điền thông tin địa chỉ giao hàng của bạn.
                    </p>
                  </div>

                  <form className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" onSubmit={onSubmit}>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Họ và tên</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                        value={form.receiverName}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, receiverName: event.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                        value={form.phone}
                        maxLength={10}
                        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '') }))}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Tỉnh / Thành phố</label>
                      <select
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                        value={provinceCode}
                        onChange={(event) => {
                          const nextCode = event.target.value;
                          setProvinceCode(nextCode);
                          const selected = provinceOptions.find(
                            (item) => String(item.code) === nextCode
                          );
                          setForm((prev) => ({
                            ...prev,
                            province: selected?.name || "",
                            ward: "",
                          }));
                          setWardOptions([]);
                          if (nextCode) {
                            void loadWardsByProvinceCode(Number(nextCode));
                          }
                        }}
                        disabled={locationLoading || !provinceOptions.length}
                      >
                        <option value="">
                          {locationLoading
                            ? "Đang tải tỉnh/thành phố..."
                            : "Chọn tỉnh / thành phố"}
                        </option>
                        {provinceOptions.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Phường / Xã</label>
                      <select
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                        value={form.ward}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, ward: event.target.value }))
                        }
                        disabled={!provinceCode || wardLoading || !wardOptions.length}
                      >
                        <option value="">
                          {!provinceCode
                            ? "Chọn tỉnh / thành phố trước"
                            : wardLoading
                              ? "Đang tải phường/xã..."
                              : "Chọn phường / xã"}
                        </option>
                        {wardOptions.map((item) => (
                          <option key={`${item.code}-${item.name}`} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold text-gray-700 mb-2">Địa chỉ chi tiết</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                        value={form.addressDetail}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, addressDetail: event.target.value }))
                        }
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <label className="inline-flex items-center gap-3 text-gray-700 font-semibold cursor-pointer">
                        <input
                          className="w-4 h-4 accent-[#003366]"
                          type="checkbox"
                          checked={form.isDefault}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, isDefault: event.target.checked }))
                          }
                        />
                        Đặt làm địa chỉ mặc định
                      </label>

                      <div className="flex items-center gap-3">
                        {isEditing && (
                          <button
                            className="px-5 py-3 rounded-xl border border-gray-200 font-extrabold text-gray-700 hover:bg-gray-50 transition"
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setForm(initialForm);
                              setProvinceCode("");
                              setWardOptions([]);
                            }}
                          >
                            Hủy sửa
                          </button>
                        )}
                        <button
                          className="px-6 py-3 rounded-xl bg-[#003366] text-white font-extrabold hover:bg-[#002244] transition inline-flex items-center gap-2 disabled:opacity-70"
                          type="submit"
                          disabled={saving}
                        >
                          <i className="fa-solid fa-floppy-disk"></i>
                          {saving ? "Đang lưu..." : isEditing ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {!error && locationError && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {locationError}
                </p>
              )}
              {success && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}
            </div>
          </div>
        </AccountShell>
      </section>
    </main>
  );
}


