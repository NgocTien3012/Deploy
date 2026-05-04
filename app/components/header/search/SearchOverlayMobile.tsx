"use client";

import { useEffect, useRef, useState } from "react";
import { usePresence } from "../usePresence";
import { useRouter } from "next/navigation";

interface Product {
    Id_product: number;
    Name_product: string;
    Price: number;
    Category_Name: string;
    Thumbnail?: string;
}

export function SearchOverlayMobile({
    open,
    onClose,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (q: string) => void;
}) {
    const { mounted, visible } = usePresence(open, 260);
    const [q, setQ] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => inputRef.current?.focus(), 90);
        return () => window.clearTimeout(t);
    }, [open]);

    useEffect(() => {
        if (open) return;
        const t = window.setTimeout(() => {
            setQ("");
            setSearchResults([]);
        }, 260);
        return () => window.clearTimeout(t);
    }, [open]);

    // Debounced search API call with client-side relevance filtering
    const handleSearch = (searchTerm: string) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceTimer.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://api.25zone.io.vn/api/sanpham/search?q=${encodeURIComponent(searchTerm)}`
                );
                const data: Product[] = await response.json();

                // Client-side re-rank: prioritize name matches for suggestions
                const lowerQ = searchTerm.trim().toLowerCase();
                const scored = data.map((p) => {
                    const name = (p.Name_product || "").toLowerCase();
                    let score = 0;
                    if (name === lowerQ) score = 100;
                    else if (name.startsWith(lowerQ)) score = 80;
                    else if (name.includes(lowerQ)) score = 60;
                    else if ((p.Category_Name || "").toLowerCase().includes(lowerQ)) score = 20;
                    else score = 5;
                    return { ...p, _score: score };
                });

                scored.sort((a, b) => b._score - a._score);
                setSearchResults(scored.slice(0, 6));
                setIsSearching(false);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
                setIsSearching(false);
            }
        }, 300);
    };

    const handleProductClick = (productId: number) => {
        onClose();
        router.push(`/products/${productId}`);
    };

    if (!mounted) return null;

    return (
        <div
            className={
                "fixed inset-0 z-[80] lg:hidden " +
                (mounted ? "pointer-events-auto" : "pointer-events-none")
            }
            role="dialog"
            aria-modal="true"
            aria-label="Tìm kiếm"
        >
            <div
                className={
                    "absolute inset-0 bg-black/40 backdrop-blur-[8px] transition-opacity duration-300 " +
                    "ease-[cubic-bezier(0.16,1,0.3,1)] " +
                    (visible ? "opacity-100" : "opacity-0")
                }
                onClick={onClose}
            />

            <div className="relative mx-auto w-[92%] max-w-[760px] pt-20 max-h-[80vh] overflow-y-auto">
                <div
                    className={
                        "rounded-2xl border border-white/30 bg-white/90 backdrop-blur-xl overflow-hidden " +
                        "shadow-[0_30px_100px_rgba(0,0,0,0.35)] will-change-transform " +
                        "transition-[opacity,transform] duration-300 " +
                        "ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none " +
                        (visible
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-3 scale-[0.97]")
                    }
                >
                    <div className="px-5 py-4 border-b border-gray-100/80 flex items-center justify-between sticky top-0 bg-white/95">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#003366]/10 text-[#003366]">
                                <i className="fa-solid fa-magnifying-glass text-[16px]" />
                            </span>
                            <div className="leading-tight">
                                <p className="font-extrabold text-[#003366] uppercase tracking-wide">
                                    Tìm kiếm
                                </p>
                                <p className="text-xs text-gray-500">Nhập từ khóa để tìm sản phẩm</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            aria-label="Đóng"
                            className="p-2 rounded-xl hover:bg-gray-50 text-[#003366] hover:text-[#33B1FA] transition active:scale-95"
                            onClick={onClose}
                        >
                            <span className="material-symbols-outlined text-[26px]">close</span>
                        </button>
                    </div>

                    <form
                        className="p-5"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const cleaned = q.trim();
                            if (!cleaned) return;
                            onSubmit(cleaned);
                        }}
                    >
                        <div className="relative">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    handleSearch(e.target.value);
                                }}
                                placeholder="Nhập tên sản phẩm, thương hiệu hoặc từ khóa..."
                                className="
                  w-full rounded-2xl border border-gray-200/80 bg-white
                  py-4 pl-12 pr-28 text-[15px]
                  focus:outline-none focus:ring-2 focus:ring-[#003366]/15
                  shadow-[0_12px_34px_rgba(0,0,0,0.08)]
                "
                                type="text"
                            />

                            {q.trim().length > 0 && (
                                <button
                                    type="button"
                                    aria-label="Xóa"
                                    onClick={() => {
                                        setQ("");
                                        setSearchResults([]);
                                        window.setTimeout(() => inputRef.current?.focus(), 0);
                                    }}
                                    className="absolute right-[92px] top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition active:scale-95"
                                >
                                    <i className="fa-solid fa-circle-xmark text-[16px]" />
                                </button>
                            )}

                            <button
                                type="submit"
                                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  rounded-xl bg-[#003366] px-4 py-2.5
                  text-white font-extrabold text-sm
                  hover:bg-[#002244] transition active:scale-95
                  shadow-[0_12px_28px_rgba(0,51,102,0.28)]
                "
                            >
                                Tìm
                            </button>
                        </div>
                    </form>

                    {/* Search Results */}
                    {q.trim() && (
                        <div className="px-5 pb-5 border-t border-gray-100/80">
                            {isSearching ? (
                                <div className="py-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#003366] border-t-transparent"></div>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="pt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Kết quả tìm kiếm</p>
                                    <div className="space-y-2">
                                        {searchResults.map((product) => (
                                            <button
                                                key={product.Id_product}
                                                onClick={() => handleProductClick(product.Id_product)}
                                                className="w-full flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition group text-left"
                                            >
                                                {/* Product Image */}
                                                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                    <img
                                                        src={`https://api.25zone.io.vn${product.Thumbnail}`}
                                                        alt={product.Name_product}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-[#003366] text-sm line-clamp-2 group-hover:text-[#33B1FA] transition">
                                                        {product.Name_product}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">{product.Category_Name}</p>
                                                    <p className="font-bold text-[#8b1e1e] text-sm mt-1">
                                                        {product.Price.toLocaleString()} VND
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {searchResults.length < 6 && (
                                        <button
                                            type="button"
                                            onClick={() => onSubmit(q.trim())}
                                            className="w-full mt-3 py-2 px-4 rounded-xl border border-[#003366] text-[#003366] font-semibold hover:bg-[#003366] hover:text-white transition text-sm"
                                        >
                                            Xem tất cả kết quả
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <i className="fa-solid fa-magnifying-glass text-3xl text-gray-300 mb-2 block"></i>
                                    <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suggestions (shown when search is empty) */}
                    {!q.trim() && (
                        <div className="px-5 pb-5">
                            <div className="rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-extrabold text-[#003366]">Gợi ý tìm nhanh</p>
                                    <span className="text-xs text-gray-400">Click để tìm</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {["Sữa rửa mặt", "Dầu gội", "Sáp", "Tràm trà", "Giảm giá"].map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => onSubmit(tag)}
                                            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-300 transition active:scale-95"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <p
                        className={
                            "mt-3 text-center text-xs text-white/80 transition-opacity duration-300 " +
                            (visible ? "opacity-100" : "opacity-0")
                        }
                    >
                        Click ra ngoài để đóng
                    </p>
                </div>
            </div>
        </div>
    );
}
