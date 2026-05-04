"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import CartPopup from "@/app/components/CartPopup";
import { useCart } from "@/app/hooks/useCart";
import Link from "next/link";
import {
  DEFAULT_MAX,
  DEFAULT_MIN,
  FilterPanel,
} from "@/app/components/products/FilterPanel";
import { Product } from "@/types/sanpham.type";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

const getImageUrl = (thumbnail: any) => {
  if (!thumbnail) return "/img/placeholder.png";
  if (typeof thumbnail === "string") {
    if (thumbnail.startsWith("http")) return thumbnail;
    try {
      const parsed = JSON.parse(thumbnail);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].startsWith("http")
          ? parsed[0]
          : `https://api.25zone.io.vn${parsed[0]}`;
      }
    } catch (e) {
      // not a json array
    }
    return thumbnail.startsWith("/")
      ? `https://api.25zone.io.vn${thumbnail}`
      : `https://api.25zone.io.vn/${thumbnail}`;
  }
  return `https://api.25zone.io.vn${thumbnail}`;
};

function ProductCard({
  p,
  onAddToCart,
  onBuyNow,
}: {
  p: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(isFavorite(p.Id_product));
    const handleUpdate = () => setLiked(isFavorite(p.Id_product));
    window.addEventListener("favorites-updated", handleUpdate);
    return () => window.removeEventListener("favorites-updated", handleUpdate);
  }, [p.Id_product]);

  const discountPct =
    p.Price && p.Sale_Price && p.Sale_Price < p.Price
      ? Math.round(((p.Price - p.Sale_Price) / p.Price) * 100)
      : 0;

  const displayPrice =
    p.Sale_Price && p.Sale_Price < p.Price ? p.Sale_Price : p.Price;

  return (
    <Link href={`/products/${p.Id_product}`} className="block h-full w-full">
      <div className="group bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl sm:shadow-2xl w-full h-full flex flex-col transition-transform hover:-translate-y-1 cursor-pointer border border-gray-100 relative">
        {/* Discount badge */}
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[11px] font-extrabold px-2 py-1 rounded-full shadow">
            -{discountPct}%
          </span>
        )}

        {/* Image */}
        <div className="relative w-full overflow-hidden h-[180px] sm:h-[220px]">
          <img
            src={getImageUrl(p.Thumbnail)}
            alt={p.Name_product}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content - luôn hiển thị, không cần hover */}
        <div className="bg-white flex-1 flex flex-col p-3 sm:p-5">
          <h3 className="font-extrabold text-[#003366] uppercase text-sm sm:text-[16px] line-clamp-2 leading-snug min-h-[42px] sm:min-h-[48px]">
            {p.Name_product}
          </h3>

          <p className="text-xs sm:text-sm text-[#003366] font-semibold line-clamp-1 mt-1">
            {p.Category_Name || "Sản phẩm khuyến mãi"}
          </p>

          <div className="h-[2px] sm:h-[3px] w-8 sm:w-12 bg-[#003366] mt-2 mb-2 sm:mb-3"></div>

          <div className="mt-auto">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 mb-1">GIÁ KHUYẾN MÃI</p>
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex-1">
                <p className="text-[#8b1e1e] font-extrabold text-base sm:text-xl lg:text-2xl tracking-tight leading-none break-words">
                  {displayPrice?.toLocaleString()}đ
                </p>
                {discountPct > 0 && (
                  <p className="text-[10px] sm:text-sm text-gray-400 line-through tabular-nums mt-0.5 sm:mt-1 break-words">
                    {p.Price?.toLocaleString()}đ
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(p);
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-[#002244] hover:scale-105 active:scale-95 transition-all shadow-md ml-auto"
              >
                <i className={`${liked ? "fa-solid fa-heart" : "fa-regular fa-heart"} text-xs sm:text-sm`}></i>
              </button>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(p);
              }}
              disabled={p.Quantity === 0}
              className={`w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm transition ${
                p.Quantity === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#003366] text-white hover:bg-[#00264d]"
              }`}
            >
              {p.Quantity === 0 ? "HẾT HÀNG" : "THÊM SẢN PHẨM"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PromotionsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<string>(DEFAULT_MIN);
  const [priceMax, setPriceMax] = useState<string>(DEFAULT_MAX);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchSale, setSearchSale] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const { addToCart, showPopup, popupProduct } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleBuyNow = (product: Product) => {
    if (!user) {
      localStorage.setItem("pending_buynow", JSON.stringify({ ...product, quantity: 1 }));
      router.push("/login?returnTo=/checkout");
    } else {
      addToCart(product);
      router.push("/checkout");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;

  // Filter + Sort
  const filteredProducts = useMemo(() => {
    let result = [...saleProducts];

    // Search filter
    if (searchSale.trim()) {
      const lowerQ = searchSale.trim().toLowerCase();
      result = result.filter((p) =>
        (p.Name_product || "").toLowerCase().includes(lowerQ) ||
        (p.Category_Name || "").toLowerCase().includes(lowerQ) ||
        (p.Brand_Name || "").toLowerCase().includes(lowerQ)
      );
    }

    // Sort
    switch (sortBy) {
      case "new":
        result.sort((a, b) => b.Id_product - a.Id_product);
        break;
      case "price_asc":
        result.sort((a, b) => (a.Sale_Price || a.Price) - (b.Sale_Price || b.Price));
        break;
      case "price_desc":
        result.sort((a, b) => (b.Sale_Price || b.Price) - (a.Sale_Price || a.Price));
        break;
      case "discount_desc":
        result.sort((a, b) => {
          const discA = a.Price && a.Sale_Price ? ((a.Price - a.Sale_Price) / a.Price) : 0;
          const discB = b.Price && b.Sale_Price ? ((b.Price - b.Sale_Price) / b.Price) : 0;
          return discB - discA;
        });
        break;
      default: // popular - keep API order
        break;
    }

    return result;
  }, [saleProducts, searchSale, sortBy]);

  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getVisiblePages = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage <= 3) return [1, 2, 3, 4, 5, 6];

    if (currentPage >= totalPages - 2)
      return [totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, currentPage + 3].filter(p => p <= totalPages);
  };

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://api.25zone.io.vn/api/sanpham/flash-sale");

        if (!res.ok) {
          console.error("API flash-sale lỗi");
          return;
        }

        const data = await res.json();
        const saleOnly = Array.isArray(data)
          ? data.filter((p: any) => p.Sale_Price && p.Sale_Price < p.Price && p.Quantity && p.Quantity > 0)
          : [];
        setSaleProducts(saleOnly);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, []);
  const priceChanged = priceMin !== DEFAULT_MIN || priceMax !== DEFAULT_MAX;

  const filterCount = useMemo(() => {
    const base = selectedCategories.length + selectedBrands.length;
    return base + (priceChanged ? 1 : 0);
  }, [selectedCategories.length, selectedBrands.length, priceChanged]);

  const resetAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceMin(DEFAULT_MIN);
    setPriceMax(DEFAULT_MAX);
  };
  const applyFilterWith = async (
    cats: string[],
    brands: string[],
    pMin: string,
    pMax: string
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      cats.forEach((c) => params.append("categories", c));
      brands.forEach((b) => params.append("brands", b));
      if (pMin !== DEFAULT_MIN) params.append("priceMin", pMin);
      if (pMax !== DEFAULT_MAX) params.append("priceMax", pMax);
      const res = await fetch(`https://api.25zone.io.vn/api/sanpham/filter?${params.toString()}`);
      const data = await res.json();
      const saleOnly = Array.isArray(data)
        ? data.filter((p: any) => p.Sale_Price && p.Sale_Price < p.Price && p.Quantity && p.Quantity > 0)
        : [];
      setSaleProducts(saleOnly);
      setCurrentPage(1);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-filter khi category/brand thay đổi
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    applyFilterWith(selectedCategories, selectedBrands, priceMin, priceMax);
  }, [selectedCategories, selectedBrands]);

  const handleApplyFilter = () =>
    applyFilterWith(selectedCategories, selectedBrands, priceMin, priceMax);
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
          <span className="text-gray-700 font-extrabold">Khuyến mãi</span>
        </div>
      </div>

      <section className="max-w-[1604px] mx-auto px-4 py-10">
        {/* HERO */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 sm:p-9 bg-[linear-gradient(90deg,#003366_0%,#0b3a66_55%,#33B1FA_140%)] text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold">
                  <i className="fa-solid fa-tags" />
                  SALE
                </p>
                <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Sản phẩm đang giảm giá
                </h1>
                <p className="mt-2 text-white/90 text-sm sm:text-base">
                  Săn deal HOT — Giảm giá cực sốc, số lượng có hạn!
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-6 py-3 text-sm font-extrabold hover:bg-white/20 transition"
                >
                  <i className="fa-solid fa-cart-shopping" />
                  Tới giỏ hàng
                </Link>
              </div>
            </div>
          </div>

          {/* Filter bar (giống listing) */}
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* chỉ 1 pill SALE */}
              <span className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-extrabold bg-[#003366] text-white border-[#003366] shadow">
                <i className="fa-solid fa-tags" />
                SALE
              </span>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-[360px]">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm focus:outline-none"
                    placeholder="Tìm sản phẩm đang sale..."
                    type="text"
                    value={searchSale}
                    onChange={(e) => { setSearchSale(e.target.value); setCurrentPage(1); }}
                  />
                </div>

                <select
                  className="w-full sm:w-[220px] rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm font-bold text-gray-700 focus:outline-none"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                >
                  <option value="popular">Phổ biến</option>
                  <option value="new">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="discount_desc">Giảm nhiều nhất</option>
                </select>
              </div>
            </div>

            {/* (optional) chỗ này ní có thể show badge count nếu muốn */}
            {filterCount > 0 && (
              <p className="mt-3 text-xs text-gray-500">
                Đang chọn{" "}
                <span className="font-extrabold text-[#003366]">
                  {filterCount}
                </span>{" "}
                bộ lọc
              </p>
            )}
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ✅ Sidebar dùng chung FilterPanel */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28">
              <FilterPanel
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                priceMin={priceMin}
                setPriceMin={setPriceMin}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                onReset={resetAll}
                onApply={handleApplyFilter}
                onClear={resetAll}
              />
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#003366]">
                Sản phẩm Sale
              </h2>
              <span className="text-sm text-gray-500">
                {filteredProducts.length} sản phẩm
              </span>
            </div>

            {loading ? (
              <div className="text-center py-20">Loading...</div>
            ) : (
              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {currentProducts.map((p) => (
                  <ProductCard
                    key={p.Id_product}
                    p={p}
                    onAddToCart={addToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center md:justify-end mt-10 gap-2">
                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-[8px] font-extrabold text-[15px] transition focus:outline-none flex items-center justify-center
                    ${currentPage === page
                        ? "bg-[#003366] text-white shadow-sm border border-[#003366]"
                        : "bg-white border border-[#a2b5cd] text-[#003366] hover:bg-[#f2f6f9]"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-10 h-10 rounded-[8px] font-extrabold text-[15px] transition focus:outline-none flex items-center justify-center bg-white border border-[#a2b5cd] text-[#003366] hover:bg-[#f2f6f9]"
                  >
                    &gt;&gt;
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      {showPopup && <CartPopup product={popupProduct} />}
    </main>
  );
}
