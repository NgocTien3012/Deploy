"use client";

import { useEffect, useState } from "react";

export const DEFAULT_MIN = "50.000";
export const DEFAULT_MAX = "1.000.000";

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

type FilterPanelProps = {
    selectedCategories: string[];
    setSelectedCategories: (next: string[]) => void;

    selectedBrands: string[];
    setSelectedBrands: (next: string[]) => void;

    priceMin: string;
    setPriceMin: (v: string) => void;

    priceMax: string;
    setPriceMax: (v: string) => void;

    onReset?: () => void;
    onApply?: () => void;
    onClear?: () => void;
};

export function FilterPanel({
    selectedCategories,
    setSelectedCategories,
    selectedBrands,
    setSelectedBrands,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    onReset,
    onApply,
}: FilterPanelProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingBrands, setLoadingBrands] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await fetch("https://api.25zone.io.vn/api/sanpham/categories/list");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Lỗi lấy danh mục:", error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoadingBrands(true);
                const response = await fetch("https://api.25zone.io.vn/api/sanpham/brands/list");
                const data = await response.json();
                setBrands(data);
            } catch (error) {
                console.error("Lỗi lấy thương hiệu:", error);
            } finally {
                setLoadingBrands(false);
            }
        };
        fetchBrands();
    }, []);

    const categoryCount = selectedCategories.length;
    const brandCount = selectedBrands.length;
    const priceChanged = priceMin !== DEFAULT_MIN || priceMax !== DEFAULT_MAX;

    const toggle = (list: string[], value: string) =>
        list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

    const handleCategoryChange = (name: string) => {
        setSelectedCategories(toggle(selectedCategories, name));
    };

    const handleBrandChange = (name: string) => {
        setSelectedBrands(toggle(selectedBrands, name));
    };

    return (
        <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-[#003366] uppercase flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-[#33B1FA]"></i>
                        Bộ lọc sản phẩm
                    </h3>
                    <button
                        className="text-sm font-bold text-gray-500 hover:text-[#003366] transition flex items-center gap-2"
                        type="button"
                        onClick={() => { onReset?.(); }}
                    >
                        <i className="fa-solid fa-rotate-left"></i>
                        Reset
                    </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">Chọn để lọc ngay lập tức.</p>
            </div>

            <div className="p-6 space-y-4">
                {/* Danh mục */}
                <details className="group border border-gray-200 rounded-2xl overflow-hidden">
                    <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-layer-group text-[#003366]/70"></i>
                            <span className="font-extrabold text-gray-900">Danh mục</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#003366]/10 text-[#003366]">
                                {categoryCount}
                            </span>
                            <i className="fa-solid fa-chevron-down text-gray-400 transition group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div className="px-4 pb-4 pt-2 space-y-2">
                        {loadingCategories ? (
                            <p className="text-sm text-gray-500 py-3">Đang tải...</p>
                        ) : categories.length > 0 ? (
                            categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                                >
                                    <input
                                        className="w-4 h-4 accent-[#003366]"
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.name)}
                                        onChange={() => handleCategoryChange(category.name)}
                                    />
                                    <span className="text-sm font-semibold text-gray-800">{category.name}</span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 py-3">Không có danh mục</p>
                        )}
                    </div>
                </details>

                {/* Thương hiệu */}
                <details className="group border border-gray-200 rounded-2xl overflow-hidden">
                    <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-tag text-[#003366]/70"></i>
                            <span className="font-extrabold text-gray-900">Thương hiệu</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#003366]/10 text-[#003366]">
                                {brandCount}
                            </span>
                            <i className="fa-solid fa-chevron-down text-gray-400 transition group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div className="px-4 pb-4 pt-2 space-y-2">
                        {loadingBrands ? (
                            <p className="text-sm text-gray-500 py-3">Đang tải...</p>
                        ) : brands.length > 0 ? (
                            brands.map((brand) => (
                                <label
                                    key={brand.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                                >
                                    <input
                                        className="w-4 h-4 accent-[#003366]"
                                        type="checkbox"
                                        checked={selectedBrands.includes(brand.name)}
                                        onChange={() => handleBrandChange(brand.name)}
                                    />
                                    <span className="text-sm font-semibold text-gray-800">{brand.name}</span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 py-3">Không có thương hiệu</p>
                        )}
                    </div>
                </details>

                {/* Khoảng giá */}
                <details className="group border border-gray-200 rounded-2xl overflow-hidden">
                    <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-money-bill-wave text-[#003366]/70"></i>
                            <span className="font-extrabold text-gray-900">Khoảng giá</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#003366]/10 text-[#003366]">
                                {priceChanged ? "1" : "VNĐ"}
                            </span>
                            <i className="fa-solid fa-chevron-down text-gray-400 transition group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div className="px-4 pb-4 pt-2">
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Min</span>
                                <input
                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                                    type="text"
                                    value={priceMin}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/[^\d]/g, "");
                                        if (raw) {
                                            setPriceMin(parseInt(raw, 10).toLocaleString("vi-VN"));
                                        } else {
                                            setPriceMin("");
                                        }
                                    }}
                                    onBlur={() => onApply?.()}
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Max</span>
                                <input
                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                                    type="text"
                                    value={priceMax}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/[^\d]/g, "");
                                        if (raw) {
                                            setPriceMax(parseInt(raw, 10).toLocaleString("vi-VN"));
                                        } else {
                                            setPriceMax("");
                                        }
                                    }}
                                    onBlur={() => onApply?.()}
                                />
                            </div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
