"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "./NavLink";
import { SearchDropdownDesktop } from "./search/SearchDropdownDesktop";
import { SearchOverlayMobile } from "./search/SearchOverlayMobile";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { toAbsoluteImageUrl } from "@/lib/api";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useCart } from "@/app/hooks/useCart";
import { getUserStorageKey } from "@/lib/user-storage";
import { LoginSuccessPopup } from "@/app/components/auth/LoginSuccessPopup";
import { LogoutSuccessToast } from "@/app/components/auth/LogoutSuccessToast";

const nav = [
  { href: "/", label: "Trang chủ" },
  { href: "http://localhost:3003", label: "25Zonebooking" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/promotions", label: "Khuyến mãi" },
  { href: "/news", label: "Tin tức" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchBtnRef = useRef<HTMLButtonElement | null>(null);
  const { user, signOut } = useAuth();

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
    setDrawerOpen(false);
    setSearchOpen(false);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
    setDrawerOpen(false);
    setSearchOpen(false);
  };

  const PROTECTED_ROUTES = ["/checkout", "/account", "/orders"];

  const logout = () => {
    // Dispatch event TRƯỚC khi signOut để UI cập nhật
    window.dispatchEvent(new Event("favorites-updated"));

    signOut();
    setDrawerOpen(false);
    setSearchOpen(false);
    setAuthOpen(false);
    setShowLogoutSuccess(true);
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
    setAuthOpen(false);
    setFavoritesOpen(false);
  }, [pathname]);

  const { getFavorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [favList, setFavList] = useState<any[]>([]);
  const [toastItem, setToastItem] = useState<{ product: any, message: string, isAdd: boolean } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setFavList(getFavorites());
    const handleUpdate = () => setFavList(getFavorites());

    const handleToast = (e: any) => {
      const { product, message } = e.detail;
      setToastItem({ product, message, isAdd: message.includes("thêm") });
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = window.setTimeout(() => setToastItem(null), 3000);
    };

    window.addEventListener("favorites-updated", handleUpdate);
    window.addEventListener("favorites-toast", handleToast);
    return () => {
      window.removeEventListener("favorites-updated", handleUpdate);
      window.removeEventListener("favorites-toast", handleToast);
    };
  }, []);

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const key = getUserStorageKey("cart");
      const cart = JSON.parse(localStorage.getItem(key) || "[]");
      const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, []);

  const lockScroll = useMemo(
    () => drawerOpen || (searchOpen && !isDesktop) || authOpen || favoritesOpen,
    [drawerOpen, searchOpen, isDesktop, authOpen, favoritesOpen]
  );

  useEffect(() => {
    if (!lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lockScroll]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (authOpen) setAuthOpen(false);
      else if (searchOpen) setSearchOpen(false);
      else if (drawerOpen) setDrawerOpen(false);
      else if (favoritesOpen) setFavoritesOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, searchOpen, authOpen, favoritesOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
      if (key !== "k") return;
      event.preventDefault();
      setDrawerOpen(false);
      setAuthOpen(false);
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) return;
    const timer = window.setTimeout(() => searchBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  const submitSearch = (raw: string) => {
    const query = raw.trim();
    if (!query) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const iconBtnClass =
    "p-2 rounded-xl text-[#003366] transition-colors duration-200 hover:text-[#33B1FA] active:scale-95 " +
    "outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0";

  const displayName = user?.Name_user || "";
  const avatar = toAbsoluteImageUrl(user?.Image) || "/img/image%202.png";

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm font-sans">
      <div className="mx-auto flex h-[85px] max-w-[1920px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/img/image%202.png"
              alt="25Zone Logo"
              className="h-12 sm:h-16 lg:h-40 w-auto lg:w-[180px] object-contain"
            />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-9">
          {nav.map((item) => (
            <NavLink key={item.label} href={item.href} label={item.label} pathname={pathname} />
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5 text-[#003366]">
          <button
            ref={searchBtnRef}
            className={iconBtnClass}
            aria-label="Search"
            aria-expanded={searchOpen}
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              setAuthOpen(false);
              setSearchOpen((value) => !value);
            }}
          >
            <i className="fa-solid fa-magnifying-glass text-[20px]" />
          </button>

          <button
            className={iconBtnClass + " relative"}
            aria-label="Favorites"
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              setAuthOpen(false);
              setSearchOpen(false);
              setFavoritesOpen(true);
            }}
          >
            <i className="fa-regular fa-heart text-[20px]" />
            {favList.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {favList.length}
              </span>
            )}
          </button>

          <Link
            href="/cart"
            className={iconBtnClass + " relative"}
            aria-label="Cart"
            onClick={() => setAuthOpen(false)}
          >
            <i className="fa-solid fa-cart-shopping text-[20px]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {!user && (
            <button
              className="hidden md:flex h-[50px] w-[185px] items-center justify-center
              shrink-0 whitespace-nowrap leading-none
              rounded-full border-2 border-[#003366] text-[#003366] px-6
              text-[20px] font-extrabold uppercase tracking-wider
              transition-all duration-300 transform-gpu
              hover:bg-[#33B1FA] hover:border-[#33B1FA] hover:text-white active:scale-95"
              type="button"
              onClick={openLogin}
            >
              Đăng nhập
            </button>
          )}

          {user && (
            <div className="relative hidden md:block group">
              <button
                type="button"
                className="h-[50px] rounded-full border border-gray-200 px-3 pr-4 flex items-center gap-3
                hover:border-[#33B1FA] hover:bg-sky-50 transition"
              >
                <img src={avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover" />
                <span className="font-extrabold text-sm max-w-[160px] truncate">{displayName}</span>
                <i className="fa-solid fa-chevron-down text-xs text-gray-500" />
              </button>

              <div
                className="absolute right-0 top-full w-56 rounded-xl border border-gray-200 bg-white shadow-lg
                invisible opacity-0 translate-y-1 pointer-events-none
                group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                transition-all"
              >
                <Link
                  href="/account/info"
                  className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-t-xl"
                >
                  Thông tin tài khoản
                </Link>
                <Link
                  href="/account/orders"
                  className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Xem lịch sử đơn
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-b-xl"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}

          <button
            className={iconBtnClass + " flex lg:hidden ml-1"}
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => {
              setSearchOpen(false);
              setAuthOpen(false);
              setDrawerOpen(true);
            }}
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </div>

      <SearchDropdownDesktop
        open={searchOpen && isDesktop}
        anchorRef={searchBtnRef}
        onClose={() => setSearchOpen(false)}
        onSubmit={submitSearch}
      />

      <SearchOverlayMobile
        open={searchOpen && !isDesktop}
        onClose={() => setSearchOpen(false)}
        onSubmit={submitSearch}
      />

      {/* Toast Notification */}
      <div
        className={`fixed top-24 right-6 z-[80] bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 w-[320px] flex items-center gap-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${toastItem ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}
      >
        {toastItem && (
          <>
            <img
              src={(() => {
                if (!toastItem.product?.Thumbnail) return "/img/placeholder.png";
                try {
                  const parsed = JSON.parse(toastItem.product.Thumbnail);
                  return parsed[0].startsWith("http") ? parsed[0] : `https://api.25zone.io.vn${parsed[0]}`;
                } catch {
                  return toastItem.product.Thumbnail.startsWith("/") ? `https://api.25zone.io.vn${toastItem.product.Thumbnail}` : `https://api.25zone.io.vn/${toastItem.product.Thumbnail}`;
                }
              })()}
              alt=""
              className="w-14 h-14 object-contain bg-[#f8f9fb] rounded-xl p-1"
            />
            <div className="flex-1">
              <p className="font-bold text-sm text-[#003366] line-clamp-1">{toastItem.product?.Name_product}</p>
              <p className={`text-sm font-bold mt-1 ${toastItem.isAdd ? 'text-green-600' : 'text-red-500'}`}>
                {toastItem.message}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Favorites Drawer (Slide from Left) */}
      <div
        className={
          "fixed inset-0 z-[60] " + (favoritesOpen ? "pointer-events-auto" : "pointer-events-none")
        }
        aria-hidden={!favoritesOpen}
      >
        <div
          className={
            "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " +
            (favoritesOpen ? "opacity-100" : "opacity-0")
          }
          onClick={() => setFavoritesOpen(false)}
        />

        <aside
          className={
            "absolute right-0 top-0 h-full w-[86%] max-w-[420px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col " +
            "transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] " +
            (favoritesOpen ? "translate-x-0" : "translate-x-full")
          }
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 shrink-0">
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-[#003366] flex items-center gap-3">
              <i className="fa-solid fa-heart text-rose-500"></i> Yêu thích
            </h2>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#003366] transition-colors active:scale-95"
              onClick={() => setFavoritesOpen(false)}
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 pb-40 space-y-4 custom-scrollbar relative">
            {favList.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 animate-in fade-in duration-700">
                <div className="w-32 h-32 mb-6 rounded-full bg-slate-50 flex items-center justify-center shadow-inner relative">
                  <i className="fa-regular fa-heart text-[4rem] text-rose-300 absolute z-10 animate-pulse"></i>
                  <div className="absolute inset-0 rounded-full bg-rose-100/50 animate-ping opacity-20"></div>
                </div>
                <h3 className="text-xl font-extrabold text-[#003366] mb-3">Chưa có sản phẩm nào</h3>
                <p className="text-sm text-slate-500 mb-8 max-w-[250px] leading-relaxed">
                  Hãy thêm những sản phẩm bạn yêu thích để dễ dàng mua sắm sau nhé!
                </p>
                <button
                  onClick={() => {
                    setFavoritesOpen(false);
                    router.push('/products');
                  }}
                  className="px-8 py-3.5 bg-[#003366] text-white rounded-full font-extrabold tracking-wider hover:bg-[#33B1FA] hover:shadow-lg hover:shadow-[#33B1FA]/30 transition-all duration-300 active:scale-95"
                >
                  KHÁM PHÁ NGAY
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {favList.map((item: any, index: number) => (
                  <div
                    key={item.Id_product}
                    className="group relative flex gap-4 bg-white p-4 border border-gray-100 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-100 transition-all duration-300"
                    style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
                  >
                    {/* Delete button absolutely positioned on top right */}
                    <button
                      onClick={(e) => { e.preventDefault(); removeFavorite(item.Id_product); }}
                      className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-rose-500 bg-white hover:bg-rose-50 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100 shadow-sm z-10"
                      aria-label="Xóa khỏi danh sách"
                    >
                      <i className="fa-solid fa-xmark text-sm"></i>
                    </button>

                    <Link
                      href={`/products/${item.Id_product}`}
                      onClick={() => setFavoritesOpen(false)}
                      className="shrink-0 w-[88px] h-[88px] bg-[#f8f9fb] rounded-xl p-2 flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={(() => {
                          if (!item.Thumbnail) return "/img/placeholder.png";
                          try {
                            const parsed = JSON.parse(item.Thumbnail);
                            return parsed[0].startsWith("http") ? parsed[0] : `https://api.25zone.io.vn${parsed[0]}`;
                          } catch {
                            return item.Thumbnail.startsWith("/") ? `https://api.25zone.io.vn${item.Thumbnail}` : `https://api.25zone.io.vn/${item.Thumbnail}`;
                          }
                        })()}
                        alt={item.Name_product}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
                      <Link
                        href={`/products/${item.Id_product}`}
                        onClick={() => setFavoritesOpen(false)}
                        className="pr-6 block"
                      >
                        <h4 className="font-bold text-[15px] text-[#003366] line-clamp-2 leading-tight group-hover:text-[#33B1FA] transition-colors">
                          {item.Name_product}
                        </h4>
                      </Link>

                      <div className="flex items-end justify-between mt-2">
                        <div className="flex flex-col">
                          {item.Sale_Price && item.Price && item.Sale_Price < item.Price ? (
                            <>
                              <span className="text-[#003366] font-extrabold text-[16px]">
                                {item.Sale_Price.toLocaleString('vi-VN')}₫
                              </span>
                              <span className="text-[12px] text-slate-400 line-through font-medium">
                                {item.Price.toLocaleString('vi-VN')}₫
                              </span>
                            </>
                          ) : (
                            <span className="text-[#003366] font-extrabold text-[16px]">
                              {(item.Price || 0).toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(item);
                            window.dispatchEvent(new CustomEvent("favorites-toast", { detail: { product: item, message: "Đã thêm vào giỏ hàng!" } }));
                          }}
                          className="w-10 h-10 rounded-full bg-[#f0f5fa] text-[#003366] flex items-center justify-center hover:bg-[#003366] hover:text-white transition-colors active:scale-95 shrink-0"
                          title="Thêm vào giỏ"
                        >
                          <i className="fa-solid fa-cart-plus text-[15px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {favList.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-100 bg-white z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[15px] font-bold text-slate-500">
                  Tổng: <span className="text-[#003366] font-extrabold">{favList.length}</span> sản phẩm
                </span>
                <button
                  onClick={() => {
                    favList.forEach(item => removeFavorite(item.Id_product));
                    window.dispatchEvent(new CustomEvent("favorites-toast", { detail: { product: { Name_product: "Thành công" }, message: "Đã xóa toàn bộ danh sách!" } }));
                  }}
                  className="text-[14px] font-bold text-slate-400 hover:text-rose-500 transition-colors underline underline-offset-4 decoration-transparent hover:decoration-rose-200"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    favList.forEach(item => addToCart(item));
                    window.dispatchEvent(new CustomEvent("favorites-toast", { detail: { product: favList[0] || { Name_product: "Thành công" }, message: `Đã thêm ${favList.length} món vào giỏ hàng!` } }));
                    window.dispatchEvent(new Event("cart-updated"));
                    setFavoritesOpen(false);
                  }}
                  className="flex-1 py-4 rounded-xl font-extrabold text-[15px] bg-[#003366] text-white hover:bg-[#33B1FA] hover:shadow-lg hover:shadow-[#33B1FA]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-cart-plus text-lg"></i> THÊM TẤT CẢ VÀO GIỎ
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div
        className={
          "fixed inset-0 z-[60] lg:hidden " + (drawerOpen ? "pointer-events-auto" : "pointer-events-none")
        }
        aria-hidden={!drawerOpen}
      >
        <div
          className={
            "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " +
            (drawerOpen ? "opacity-100" : "opacity-0")
          }
          onClick={() => setDrawerOpen(false)}
        />

        <aside
          className={
            "absolute right-0 top-0 h-full w-[86%] max-w-[380px] bg-white shadow-2xl " +
            "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " +
            (drawerOpen ? "translate-x-0" : "translate-x-full")
          }
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b px-4 py-4">
            <span className="font-extrabold uppercase tracking-wider text-[#003366]">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              className={iconBtnClass}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="material-symbols-outlined text-[26px]">close</span>
            </button>
          </div>

          <div className="p-4">
            <div className="flex flex-col gap-2">
              {nav.map((item) => (
                <div key={item.label} className="border border-gray-100 rounded-xl">
                  <NavLink
                    href={item.href}
                    label={item.label}
                    drawer
                    pathname={pathname}
                    onClick={() => setDrawerOpen(false)}
                  />
                </div>
              ))}
            </div>

            {!user && (
              <div className="mt-6 border-t pt-4 md:hidden">
                <button
                  className="w-full h-11 rounded-xl border-2 border-[#003366] text-[#003366]
                  font-extrabold uppercase tracking-wider hover:bg-[#33B1FA]
                  hover:border-[#33B1FA] hover:text-white transition active:scale-95"
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    openLogin();
                  }}
                >
                  Đăng nhập
                </button>

                <button
                  className="w-full mt-3 h-11 rounded-xl border border-gray-200 text-[#003366]
                  font-extrabold uppercase tracking-wider hover:bg-gray-50 transition active:scale-95"
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    openRegister();
                  }}
                >
                  Đăng ký
                </button>
              </div>
            )}

            {user && (
              <div className="mt-6 border-t pt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-extrabold text-[#003366]">{displayName}</p>
                    <p className="text-xs text-gray-500">Đã đăng nhập</p>
                  </div>
                </div>

                <Link
                  href="/account/info"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-bold text-gray-700"
                >
                  <i className="fa-solid fa-user text-[#003366]" />
                  Thông tin tài khoản
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-bold text-gray-700"
                >
                  <i className="fa-solid fa-box text-[#003366]" />
                  Xem lịch sử đơn
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-extrabold text-red-600"
                >
                  <i className="fa-solid fa-right-from-bracket" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={(next) => setAuthMode(next)}
        onLoginSuccess={() => setShowLoginSuccess(true)}
        logoSrc="/img/image%202.png"
      />

      {showLoginSuccess && <LoginSuccessPopup returnTo="RELOAD" />}
      {showLogoutSuccess && (
        <LogoutSuccessToast
          onDone={() => {
            setShowLogoutSuccess(false);
            const currentPath = window.location.pathname;
            const isProtected = PROTECTED_ROUTES.some((r) => currentPath.startsWith(r));
            if (isProtected) {
              router.push("/login");
            } else {
              router.push("/");
            }
          }}
        />
      )}
    </header>
  );
}
