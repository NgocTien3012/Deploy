"use client";
import CartPopup from "@/app/components/CartPopup";
import { useCart } from "@/app/hooks/useCart";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/app/hooks/useFavorites";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchNewsList,
  getNewsExcerpt,
  normalizeNewsImage,
  type ShopNewsItem,
} from "@/lib/news";

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

function FlashSaleCard({ product, onAddToCart }: { product: any; onAddToCart: (p: any) => void }) {
  const discount = Math.round(
    ((product.Price - product.Sale_Price) / product.Price) * 100,
  );

  return (
    <Link href={`/products/${product.Id_product}`} className="block h-full w-full">
      <div className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-md sm:shadow-lg text-center flex flex-col relative h-full w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer border border-gray-100">
        <span className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow">
          -{discount}%
        </span>

        <div className="rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-gray-100 mb-3 sm:mb-4 aspect-square relative">
          <img
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={getImageUrl(product.Thumbnail)}
            alt={product.Name_product}
          />
        </div>

        <h3 className="text-xs sm:text-sm font-semibold text-[#003366] text-left line-clamp-2 leading-tight min-h-[36px] sm:min-h-[40px]">
          {product.Name_product}
        </h3>

        <div className="text-left mt-auto pt-2">
          <p className="line-through text-gray-400 text-[10px] sm:text-xs break-words">
            {product.Price?.toLocaleString()}đ
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-red-600 font-extrabold text-sm sm:text-lg tracking-tight break-words">
              {product.Sale_Price?.toLocaleString()}đ
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-[#003366] text-white border border-[#003366] rounded-full flex items-center justify-center hover:bg-white hover:text-[#003366] transition-colors shadow-md active:scale-95 shrink-0"
              title="Thêm vào giỏ"
            >
              <i className="fa-solid fa-cart-plus text-xs sm:text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
}: {
  product: any;
  onAddToCart: (product: any) => void;
  onBuyNow: (product: any) => void;
}) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(isFavorite(product.Id_product));
    const handleUpdate = () => setLiked(isFavorite(product.Id_product));
    window.addEventListener("favorites-updated", handleUpdate);
    return () => window.removeEventListener("favorites-updated", handleUpdate);
  }, [product.Id_product]);

  return (
    <Link href={`/products/${product.Id_product}`} className="w-full h-full">
      <div className="group bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl sm:shadow-2xl max-w-[320px] mx-auto w-full h-full flex flex-col transition-transform hover:-translate-y-1 cursor-pointer border border-gray-100">
        <div className="relative w-full overflow-hidden aspect-square">
          <img
            alt={product.Name_product}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={getImageUrl(product.Thumbnail)}
          />
        </div>

        <div className="bg-white flex-1 flex flex-col rounded-t-[24px] sm:rounded-t-[32px] -mt-6 sm:-mt-10 p-3 sm:p-6 relative z-10">
          <h3 className="text-base sm:text-[22px] leading-snug font-extrabold text-[#003366] uppercase line-clamp-2 min-h-[48px] sm:min-h-[64px]">
            {product.Name_product}
          </h3>

          <p className="text-xs sm:text-sm text-[#003366] mt-1">{product.Category_Name}</p>

          <div className="h-[2px] sm:h-[3px] w-8 sm:w-12 bg-[#003366] mt-2 mb-3 sm:mb-4"></div>

          <div className="mt-auto">
            <p className="text-[10px] sm:text-xs text-gray-400 uppercase">Giá sản phẩm</p>

            <div className="flex items-center justify-between mt-1 sm:mt-2 gap-2">
              <div className="flex-1">
                <span className="text-[#8b1e1e] font-extrabold text-base sm:text-2xl lg:text-3xl tracking-tight break-words">
                  {product.Price?.toLocaleString()}đ
                </span>
              </div>

              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product); }}
                className="ml-auto w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-[#002244] hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <i className={`${liked ? "fa-solid fa-heart" : "fa-regular fa-heart"} text-xs sm:text-sm`}></i>
              </button>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                onBuyNow(product);
              }}
              className="w-full mt-3 sm:mt-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-[#003366] text-white font-bold text-xs sm:text-base transition hover:bg-[#00264d]"
            >
              MUA NGAY
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
function HomeNewsCard({ item }: { item: ShopNewsItem }) {
  return (
    <article className="bg-white rounded-3xl overflow-hidden shadow-xl">
      <img
        alt={item.Title}
        className="w-full h-[220px] object-cover"
        src={normalizeNewsImage(item.Thumbnail)}
      />
      <div className="p-6">
        <span className="inline-flex items-center rounded-full bg-[#E6F4FF] px-3 py-1 text-xs font-bold text-[#0B4C8C]">
          {item.Name_category_news || "Tin t\u1ee9c"}
        </span>
        <h3 className="mt-3 text-lg font-extrabold text-[#003366] leading-snug line-clamp-2">
          {item.Title}
        </h3>
        <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-3">
          {getNewsExcerpt(item.Content, 130)}
        </p>
        <Link
          className="inline-flex items-center gap-2 mt-5 font-bold text-[#003366] text-sm hover:text-[#00A2D9]"
          href={`/news/${encodeURIComponent(item.Slug)}`}
        >
          {"\u0110\u1eccC CHI TI\u1ebeT"}
          <i className="fa-solid fa-arrow-right text-xs"></i>
        </Link>
      </div>
    </article>
  );
}

const BANNER_SLIDES = [
  {
    image: "/img/banner_grooming.png",
    title: "Chào mừng đến 25Zone",
    subtitle: "Thế giới mỹ phẩm nam giới — Tự tin phong cách, nổi bật mỗi ngày.",
    badge: "25ZONE SHOP",
    badgeIcon: "fa-solid fa-star",
    cta: "KHÁM PHÁ NGAY",
    ctaLink: "/products",
  },
  {
    image: "/img/banner_sale.png",
    title: "Ưu đãi cực sốc",
    subtitle: "Giảm giá lên đến 50% cho các sản phẩm chăm sóc tóc hàng đầu.",
    badge: "FLASH SALE",
    badgeIcon: "fa-solid fa-bolt",
    cta: "XEM KHUYẾN MÃI",
    ctaLink: "/promotions",
  },
  {
    image: "/img/banner_barbershop.png",
    title: "Đặt lịch cắt tóc",
    subtitle: "Dịch vụ cắt tóc chuyên nghiệp — Đặt lịch online nhanh chóng, tiện lợi.",
    badge: "BOOKING",
    badgeIcon: "fa-solid fa-calendar-check",
    cta: "ĐẶT LỊCH NGAY",
    ctaLink: "http://localhost:3003",
  },
];

export default function HomePage() {
  const slides = BANNER_SLIDES;
  const [index, setIndex] = useState(0);
  const [autoPause, setAutoPause] = useState(false);
  const [homeNews, setHomeNews] = useState<ShopNewsItem[]>([]);
  const [homeNewsLoading, setHomeNewsLoading] = useState(true);
  const [flashSale, setFlashSale] = useState<any[]>([]);
  const [bestSeller, setBestSeller] = useState<any[]>([]);
  const [sapVuotToc, setSapVuotToc] = useState<any[]>([]);
  const { addToCart, showPopup, popupProduct } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleBuyNow = (product: any) => {
    if (!user) {
      localStorage.setItem("pending_buynow", JSON.stringify({ ...product, quantity: 1 }));
      router.push("/login?returnTo=/checkout");
    } else {
      addToCart(product);
      router.push("/checkout");
    }
  };
  const [dauGoi, setDauGoi] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(7200);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, "0"),
      minutes: m.toString().padStart(2, "0"),
      seconds: s.toString().padStart(2, "0"),
    };
  };

  const time = formatTime(timeLeft);

  const scrollSlider = (direction: "left" | "right") => {
    const slider = document.getElementById("flash-sale-slider");
    if (slider) {
      const scrollAmount = slider.clientWidth;
      slider.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const best = await fetch("https://api.25zone.io.vn/api/sanpham");
        const allProducts = await best.json();

        const validSales = Array.isArray(allProducts)
          ? allProducts.filter((p: any) => p.Sale_Price && p.Sale_Price < p.Price && p.Sale_Price !== 0 && p.Quantity && p.Quantity > 0)
          : [];

        const shuffledSales = [...validSales].sort(() => 0.5 - Math.random());
        setFlashSale(shuffledSales.slice(0, 8));

        setBestSeller(Array.isArray(allProducts) ? allProducts.slice(0, 4) : []);

        // Lấy luôn data từ API tổng (allProducts) vì API theo category đang báo lỗi 500
        const sapData = Array.isArray(allProducts) 
          ? allProducts.filter((p: any) => p.Category_Name === "Sáp vuốt tóc" || p.Id_category_product === 1) 
          : [];
        setSapVuotToc(sapData.slice(0, 4)); // Lấy 4 sản phẩm hiển thị

        const dauData = Array.isArray(allProducts) 
          ? allProducts.filter((p: any) => p.Category_Name === "Dầu gội" || p.Id_category_product === 8) 
          : [];
        setDauGoi(dauData.slice(0, 4)); // Lấy 4 sản phẩm hiển thị
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (autoPause) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [autoPause]);

  useEffect(() => {
    let active = true;

    const loadHomeNews = async () => {
      try {
        setHomeNewsLoading(true);
        const data = await fetchNewsList({ page: 1, limit: 3 });
        if (!active) return;
        setHomeNews(data.items);
      } catch (error) {
        if (!active) return;
        console.error("Không thể tải tin tức trang chủ:", error);
      } finally {
        if (active) setHomeNewsLoading(false);
      }
    };

    loadHomeNews();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      {/* ===== Banner Slider ===== */}
      <section className="py-5">
        <div
          className="relative w-[90%] max-w-[1920px] mx-auto overflow-hidden rounded-2xl group"
          onMouseEnter={() => setAutoPause(true)}
          onMouseLeave={() => setAutoPause(false)}
        >
          {/* Slides */}
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div key={i} className="w-full flex-shrink-0 relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
                <img
                  src={slide.image}
                  className="w-full h-full object-cover"
                  alt={slide.title}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                {/* Text content */}
                <div
                  className={
                    "absolute inset-0 flex flex-col justify-center px-8 sm:px-14 lg:px-20 max-w-[650px] transition-all duration-700 " +
                    (i === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                  }
                >
                  {slide.badge && (
                    <span className="inline-flex items-center gap-2 w-fit rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-bold text-white mb-4">
                      <i className={slide.badgeIcon + " text-[10px]"} />
                      {slide.badge}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed max-w-[480px] drop-shadow">
                    {slide.subtitle}
                  </p>
                  {slide.cta && (
                    <Link
                      href={slide.ctaLink || "/products"}
                      className="mt-6 w-fit inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#003366] hover:bg-[#003366] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                    >
                      {slide.cta}
                      <i className="fa-solid fa-arrow-right text-xs" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Prev / Next arrows */}
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 active:scale-90 z-10"
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left text-sm" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 active:scale-90 z-10"
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right text-sm" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={
                  "rounded-full transition-all duration-500 " +
                  (i === index
                    ? "w-8 h-3 bg-white shadow-lg"
                    : "w-3 h-3 bg-white/40 hover:bg-white/70")
                }
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Flash Sale ===== */}
      <section className="w-full bg-[#eef7fb] py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-8 px-4 sm:px-6 lg:px-10 relative">
          {/* UNIQUE "ĐỘC QUYỀN" Premium Left Image Area */}
          <div className="w-full lg:w-[40%] relative right-0 lg:right-20 z-10 group mt-4 lg:mt-0">
            {/* 3D Floating Container */}
            <div className="rounded-[2rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/10 group-hover:border-cyan-400/50 transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_30px_60px_rgba(0,229,255,0.3)]">
              
              {/* Image with Grayscale reveal effect */}
              <img 
                className="w-full object-cover scale-110 grayscale group-hover:grayscale-0 group-hover:scale-100 transition-all duration-[1500ms] ease-out" 
                src="/img/Rectangle%2024827.png" 
                alt="Flash Sale Banner" 
              />
              
              {/* CRT Scanline Overlay */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)] pointer-events-none opacity-40 group-hover:opacity-20 transition-opacity duration-1000"></div>
              
              {/* Dark Overlay for bottom text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#000a14]/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Aggressive Caution Tape (Top Left) */}
              <div className="absolute top-6 -left-12 w-64 bg-yellow-400 text-black text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] py-1.5 -rotate-45 text-center shadow-[0_4px_15px_rgba(250,204,21,0.6)] z-30 border-y-2 border-black border-dashed flex justify-center">
                <span>⚠ ĐỘC QUYỀN ⚠ FLASH SALE</span>
              </div>

              {/* Recording HUD (Top Right) */}
              <div className="absolute top-4 right-4 text-right z-10 flex flex-col items-end">
                <span className="text-red-500 bg-black/80 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(255,0,0,0.5)] border border-red-500/50 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red]"></span> REC
                </span>
              </div>

              {/* Cyber-HUD Badge (Bottom Left) */}
              <div 
                className="absolute bottom-8 left-[-10px] bg-cyan-400 text-black pl-8 pr-6 py-3 border-r-8 border-black shadow-[10px_10px_0px_rgba(0,0,0,0.8)] z-20 group-hover:translate-x-4 transition-transform duration-500"
                style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black italic tracking-widest opacity-80 mb-0.5">
                    // LIMITED TIME OFFER //
                  </span>
                  <span className="text-xl sm:text-2xl font-black italic tracking-tighter">
                    GIẢM SỐC HÔM NAY!
                  </span>
                </div>
              </div>
            </div>
            
            {/* 3D Floating Element - Starburst breaking out of the container! */}
            <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 w-32 h-32 sm:w-40 sm:h-40 z-30 group-hover:scale-125 group-hover:rotate-[15deg] transition-all duration-700 pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#ff003c] fill-current animate-[spin_20s_linear_infinite_reverse]">
                 <polygon points="50,5 61,28 86,14 74,38 98,50 74,62 86,86 61,72 50,95 39,72 14,86 26,62 2,50 26,38 14,14 39,28" stroke="#000" strokeWidth="2.5" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-[15deg]">
                 <span className="text-yellow-400 font-black italic text-3xl sm:text-4xl leading-none tracking-tighter" style={{ WebkitTextStroke: "1.5px black" }}>HOT</span>
                 <span className="text-white font-black italic text-xl sm:text-2xl leading-none tracking-tighter mt-[-4px] drop-shadow-[2px_2px_0_#000]">DEAL!</span>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[60%]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              {/* Premium Neo-Brutalist Flash Sale Title */}
              <div className="relative group cursor-pointer w-fit mb-4 sm:mb-0">
                {/* 3D Offset Shadow Background */}
                <div className="absolute inset-0 bg-yellow-400 rounded-2xl skew-x-[-12deg] translate-x-1.5 translate-y-1.5 sm:translate-x-2 sm:translate-y-2 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3 shadow-lg"></div>
                
                {/* Main Box */}
                <div className="relative flex items-center gap-4 sm:gap-5 bg-gradient-to-r from-[#00152b] via-[#003366] to-[#004080] border border-white/20 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl skew-x-[-12deg] overflow-hidden backdrop-blur-md">
                  {/* Glassmorphism Shine Effect */}
                  <div className="absolute top-0 left-[-150%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[150%] transition-all duration-1000 ease-in-out"></div>
                  
                  {/* Glowing Lightning Icon */}
                  <div className="relative skew-x-[12deg] flex items-center justify-center">
                    <div className="absolute inset-0 bg-yellow-400 blur-[20px] opacity-40 animate-pulse rounded-full"></div>
                    <i className="fa-solid fa-bolt text-yellow-400 text-4xl sm:text-5xl relative z-10 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                  
                  {/* Glitch / Chromatic Aberration Text */}
                  <h1 
                    className="text-3xl sm:text-4xl font-black tracking-[0.15em] skew-x-[12deg] italic text-white uppercase relative z-10"
                    style={{ textShadow: "2.5px 0px 0px #ff003c, -2.5px 0px 0px #00e5ff" }}
                  >
                    FLASH SALE
                  </h1>
                </div>
              </div>
              {/* Ultra-Exclusive Premium Flip Clock Timer */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-16 sm:w-16 sm:h-20 bg-gradient-to-b from-[#002b5e] to-[#004080] rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-[0_10px_20px_rgba(0,34,68,0.5),inset_0_2px_0_rgba(255,255,255,0.2)] border border-[#001a33] relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                    {/* Dark Top Flap */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-black/20 border-b border-black/80"></div>
                    {/* White Flap Hinge Highlight */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/30 shadow-[0_1px_2px_rgba(0,0,0,0.5)]"></div>
                    <span className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] relative z-10 tracking-tighter">{time.hours}</span>
                  </div>
                  <span className="text-[#003366] text-[10px] sm:text-xs font-black mt-2 uppercase tracking-widest drop-shadow-sm">Giờ</span>
                </div>
                
                <span className="text-[#003366] font-black text-2xl sm:text-3xl animate-pulse mb-6 drop-shadow-md">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-16 sm:w-16 sm:h-20 bg-gradient-to-b from-[#002b5e] to-[#004080] rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-[0_10px_20px_rgba(0,34,68,0.5),inset_0_2px_0_rgba(255,255,255,0.2)] border border-[#001a33] relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                    {/* Dark Top Flap */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-black/20 border-b border-black/80"></div>
                    {/* White Flap Hinge Highlight */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/30 shadow-[0_1px_2px_rgba(0,0,0,0.5)]"></div>
                    <span className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] relative z-10 tracking-tighter">{time.minutes}</span>
                  </div>
                  <span className="text-[#003366] text-[10px] sm:text-xs font-black mt-2 uppercase tracking-widest drop-shadow-sm">Phút</span>
                </div>
                
                <span className="text-[#003366] font-black text-2xl sm:text-3xl animate-pulse mb-6 drop-shadow-md">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-16 sm:w-16 sm:h-20 bg-gradient-to-b from-[#e60000] to-[#ff3333] rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-[0_10px_25px_rgba(204,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.3)] border border-[#990000] relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                    {/* Dark Top Flap */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-black/10 border-b border-black/60"></div>
                    {/* White Flap Hinge Highlight */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/40 shadow-[0_1px_2px_rgba(0,0,0,0.5)]"></div>
                    <span className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] relative z-10 tracking-tighter">{time.seconds}</span>
                  </div>
                  <span className="text-[#e60000] text-[10px] sm:text-xs font-black mt-2 uppercase tracking-widest drop-shadow-sm">Giây</span>
                </div>
              </div>
            </div>

            {/* Slider Wrapper for relative arrow positioning */}
            <div className="relative group/slider mt-2 sm:mt-4">
              <div
                id="flash-sale-slider"
                className="flex gap-4 sm:gap-6 py-2 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {flashSale.map((p) => (
                  <div
                    key={p.Id_product}
                    className="snap-start flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                  >
                    <FlashSaleCard product={p} onAddToCart={addToCart} />
                  </div>
                ))}
              </div>

              {/* Slider Navigation Arrows - Visible on Mobile! */}
              <button
                onClick={() => scrollSlider('left')}
                className="flex absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_4px_15px_rgba(0,0,0,0.15)] border border-gray-100 items-center justify-center text-[#003366] hover:bg-gray-50 z-10 transition-colors opacity-90 sm:opacity-0 sm:group-hover/slider:opacity-100 active:scale-95"
                aria-label="Cuộn trái"
              >
                <i className="fa-solid fa-chevron-left text-base sm:text-lg"></i>
              </button>

              <button
                onClick={() => scrollSlider('right')}
                className="flex absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_4px_15px_rgba(0,0,0,0.15)] border border-gray-100 items-center justify-center text-[#003366] hover:bg-gray-50 z-10 transition-colors opacity-90 sm:opacity-0 sm:group-hover/slider:opacity-100 active:scale-95"
                aria-label="Cuộn phải"
              >
                <i className="fa-solid fa-chevron-right text-base sm:text-lg"></i>
              </button>
            </div>

            <div className="flex justify-center mt-8 sm:mt-10">
              <Link
                href="/promotions"
                className="bg-white flex items-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 border-2 border-[#003366] rounded-full font-bold text-[#003366] shadow-sm hover:shadow-md hover:-translate-y-1 hover:bg-[#003366] hover:text-white transition-all duration-300"
              >
                XEM THÊM SẢN PHẨM
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Best Seller ===== */}
      <section className="w-full mt-5 bg-gradient-to-b from-[#5fb7de] via-[#3a78b8] to-[#1f2f6b] py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <h2 className="text-white text-3xl font-extrabold uppercase mb-8 sm:mb-12">
            SẢN PHẨM BÁN CHẠY
          </h2>

          {/* ✅ mobile 2 box/row + gap nhỏ lại cho đẹp */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 justify-items-center">
            {bestSeller.map((p) => (
              <ProductCard
                key={p.Id_product}
                product={p}
                onAddToCart={(p) => addToCart(p)}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>

          <div className="flex justify-center mt-10 sm:mt-16">
            <Link
              href="/products"
              className="bg-white flex items-center gap-3 px-8 sm:px-10 py-4 border-2 border-[#003366] rounded-full font-bold text-[#003366] hover:bg-[#003366] hover:text-white transition"
            >
              XEM THÊM SẢN PHẨM
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SÁP VUỐT TÓC ===== */}
      <section className="mt-5 bg-[#eef7fb] py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-[#0b3a66] uppercase">
                SÁP VUỐT TÓC
              </h2>
              <div className="w-16 h-1 bg-[#1aa3a3] mt-3"></div>
            </div>

            {/* ✅ Desktop mới hiện nút ở header */}
            <Link
              href="/products"
              className="bg-white flex items-center gap-3 px-8 sm:px-10 py-4 border-2 border-[#003366] rounded-full font-bold text-[#003366] hover:bg-[#003366] hover:text-white transition"
            >
              XEM THÊM SẢN PHẨM
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 justify-items-center">
            {(sapVuotToc || []).map((p) => (
              <ProductCard
                key={p.Id_product}
                product={p}
                onAddToCart={addToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>

          {/* ✅ Mobile: nút nằm dưới grid */}
          <div className="md:hidden flex justify-center mt-10">
            <button className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#0b3a66] text-white font-bold hover:bg-[#092d50] transition w-fit">
              XEM THÊM SẢN PHẨM <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* ===== Dầu gội nam ===== */}
      <section className="mt-5 bg-[#eef7fb] py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-[#0b3a66] uppercase">
                Dầu gội nam
              </h2>
              <div className="w-16 h-1 bg-[#1aa3a3] mt-3"></div>
            </div>

            {/* ✅ Desktop mới hiện nút ở header */}
            <Link
              href="/products"
              className="bg-white flex items-center gap-3 px-8 sm:px-10 py-4 border-2 border-[#003366] rounded-full font-bold text-[#003366] hover:bg-[#003366] hover:text-white transition"
            >
              XEM THÊM SẢN PHẨM
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 justify-items-center">
            {(dauGoi || []).map((p) => (
              <ProductCard
                key={p.Id_product}
                product={p}
                onAddToCart={addToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>

          {/* ✅ Mobile: nút nằm dưới grid */}
          <div className="md:hidden flex justify-center mt-10">
            <button className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#0b3a66] text-white font-bold hover:bg-[#092d50] transition w-fit">
              XEM THÊM SẢN PHẨM <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* ===== Tin tức ===== */}
      <section className="mt-5 bg-[#eef7fb] py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-10 sm:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-[#003366] uppercase">
                {"TIN T\u1ee8C 25ZONE"}
              </h2>
              <div className="w-16 h-1 bg-teal-400 mt-3"></div>
            </div>
            <Link
              href="/news"
              className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-[#003366] px-6 py-3 text-sm font-bold text-[#003366] hover:bg-[#003366] hover:text-white"
            >
              {"XEM T\u1ea4T C\u1ea2"}
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-10">
            {homeNewsLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-[#DDE7EF] bg-white shadow-sm"
                >
                  <div className="h-[220px] animate-pulse bg-[#E5EEF5]"></div>
                  <div className="space-y-3 p-6">
                    <div className="h-4 w-24 animate-pulse rounded bg-[#E5EEF5]"></div>
                    <div className="h-5 w-full animate-pulse rounded bg-[#E5EEF5]"></div>
                    <div className="h-5 w-4/5 animate-pulse rounded bg-[#E5EEF5]"></div>
                    <div className="h-4 w-full animate-pulse rounded bg-[#E5EEF5]"></div>
                  </div>
                </div>
              ))}

            {!homeNewsLoading && homeNews.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#BCD0E0] bg-white p-6 text-center text-[#4B5D70] md:col-span-3">
                {
                  "Ch\u01b0a c\u00f3 b\u00e0i vi\u1ebft n\u00e0o \u0111\u1ec3 hi\u1ec3n th\u1ecb."
                }
              </div>
            )}

            {!homeNewsLoading &&
              homeNews.map((item) => (
                <HomeNewsCard key={item.Id_news} item={item} />
              ))}
          </div>
        </div>
      </section>
      {showPopup && <CartPopup product={popupProduct} />}
    </main>
  );
}
