"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { loadToken } from "@/lib/auth-storage";
import { getUserStorageKey } from "@/lib/user-storage";

type TabKey = "desc" | "ingredient" | "guide";

interface Product {
  Id_product: number;
  Name_product: string;
  Description: string;
  Price: number;
  Sale_Price?: number;
  Category_Name: string;
  Thumbnail?: string;
  Quantity?: number;
  Usage_Instructions?: string;
  Ingredients?: string;
}

interface Comment {
  id_product_comment: number;
  Content: string;
  Created_at: string;
  Id_user: number;
  rating?: number;
  user_name?: string;
}

function RelatedProductCard({ p, onAddToCart }: { p: any; onAddToCart: (product: any) => void }) {
  const router = useRouter();
  const thumbnail = (() => {
    if (!p.Thumbnail) return "/img/placeholder.png";
    try {
      const parsed = JSON.parse(p.Thumbnail);
      return parsed[0].startsWith("http") ? parsed[0] : `https://api.25zone.io.vn${parsed[0]}`;
    } catch {
      return p.Thumbnail.startsWith("/") ? `https://api.25zone.io.vn${p.Thumbnail}` : `https://api.25zone.io.vn/${p.Thumbnail}`;
    }
  })();

  return (
    <div
      className="group bg-white rounded-[34px] shadow-2xl overflow-hidden flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
      onClick={() => router.push(`/products/${p.Id_product}`)}
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden rounded-t-[34px]">
        <div className="aspect-[4/4]">
          <img
            src={thumbnail}
            alt={p.Name_product}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-t-[34px] -mt-6 sm:-mt-8 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 lg:pt-8 pb-6 sm:pb-8 lg:pb-10 relative flex-1 flex flex-col">
        <h3 className="text-[17px] sm:text-[20px] lg:text-[24px] leading-tight font-extrabold text-[#003366] uppercase line-clamp-2 min-h-[2.5em]">
          {p.Name_product}
        </h3>

        <p className="mt-2 sm:mt-3 text-[#003366] font-semibold text-sm sm:text-base">
          {p.Category_Name || p.Category || "Sản phẩm"}
        </p>
        <div className="h-[4px] lg:h-[5px] w-12 sm:w-14 lg:w-16 bg-[#003366] mt-2"></div>

        <div className="h-px bg-gray-300 mt-4 sm:mt-6"></div>

        <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider font-bold">
          GIÁ SẢN PHẨM
        </p>

        <div className="mt-2 flex items-center mb-4 sm:mb-6">
          <span className="text-[#8b1e1e] font-extrabold text-[24px] sm:text-[32px] lg:text-[36px] leading-none tabular-nums">
            {(p.Sale_Price || p.Price || 0).toLocaleString('vi-VN')}₫
          </span>
        </div>

        <button
          className="mt-auto w-full py-3 sm:py-4 rounded-2xl bg-[#003366] text-white font-extrabold tracking-wide hover:bg-[#00264d] active:scale-95 transition"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(p);
          }}
        >
          THÊM VÀO GIỎ HÀNG
        </button>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("desc");
  const [expanded, setExpanded] = useState(false);
  const [displayedComments, setDisplayedComments] = useState(5);
  const [showReview, setShowReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { user, token } = useAuth();
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [showNotPurchasedPopup, setShowNotPurchasedPopup] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const productRes = await fetch(
          `https://api.25zone.io.vn/api/sanpham/${id}`,
        );

        if (!productRes.ok) {
          throw new Error("Không thể lấy sản phẩm");
        }

        const productData = await productRes.json();
        setProduct(productData);

        const commentsRes = await fetch(
          `https://api.25zone.io.vn/api/product-comments/${id}`,
        );

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }

        const relatedRes = await fetch("https://api.25zone.io.vn/api/sanpham");
        if (relatedRes.ok) {
          const allProducts = await relatedRes.json();
          const filtered = allProducts.filter((p: any) => String(p.Id_product) !== String(id) && p.Category_Name === productData.Category_Name);
          let finalRelated = filtered.slice(0, 4);
          if (finalRelated.length < 4) {
            const others = allProducts.filter((p: any) => String(p.Id_product) !== String(id) && !finalRelated.find((fr: any) => fr.Id_product === p.Id_product));
            finalRelated = [...finalRelated, ...others.slice(0, 4 - finalRelated.length)];
          }
          setRelatedProducts(finalRelated);
        }

      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-lg font-semibold">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-lg font-semibold text-red-600">
        Sản phẩm không tồn tại
      </div>
    );
  }

  const handleAddRelatedToCart = (relatedProduct: any) => {
    const key = getUserStorageKey("cart");
    const cart: any[] = JSON.parse(localStorage.getItem(key) || "[]");

    const index = cart.findIndex(
      (item) => item.Id_product === relatedProduct.Id_product,
    );

    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...relatedProduct, quantity: 1 });
    }

    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));

    setPopupProduct(relatedProduct);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 2500);
  };

  const addToCart = (product: Product) => {
    const key = getUserStorageKey("cart");
    const cart: any[] = JSON.parse(localStorage.getItem(key) || "[]");

    const index = cart.findIndex(
      (item) => item.Id_product === product.Id_product,
    );

    if (index !== -1) {
      cart[index].quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product);

    setPopupProduct(product);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 2500);
  };


  const tabBtnClass = (key: TabKey, isLast = false) =>
    "px-6 py-4 font-semibold " +
    (isLast ? "" : "border-r border-gray-200 ") +
    (tab === key ? "text-[#003366] bg-white" : "text-gray-600 bg-gray-50");

  return (
    <main className="font-spline">
      <section className="max-w-[1604px] mx-auto px-4 lg:px-10 py-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <a className="hover:text-[#003366] font-semibold transition" href="/">
            Trang chủ
          </a>
          <i className="fa-solid fa-chevron-right text-[11px] text-gray-300"></i>
          <span className="text-gray-700 font-semibold">
            {product.Category_Name}
          </span>
          <i className="fa-solid fa-chevron-right text-[11px] text-gray-300"></i>
          <span className="text-gray-700 font-extrabold">
            {product.Name_product}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm flex justify-center">
              <img
                src={`https://api.25zone.io.vn${product.Thumbnail}`}
                alt={product.Name_product}
                className="w-full max-w-[420px] max-h-[420px] object-contain"
              />
            </div>


          </div>

          <div className="lg:col-span-5">
            <h1 className="text-2xl lg:text-[26px] font-extrabold text-[#003366] leading-snug">
              {product.Name_product}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-yellow-400">
                <i className="fa-solid fa-star" />
                <i className="fa-solid fa-star" />
                <i className="fa-solid fa-star" />
                <i className="fa-solid fa-star" />
                <i className="fa-regular fa-star" />
              </div>
              <span className="text-sm text-gray-700 font-semibold">4.7</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">(7 đánh giá)</span>
            </div>

            {product.Sale_Price && product.Sale_Price < product.Price ? (
              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-extrabold text-red-600">
                    {product.Sale_Price.toLocaleString()} VND
                  </p>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{Math.round(((product.Price - product.Sale_Price) / product.Price) * 100)}%
                  </span>
                </div>
                <p className="text-lg text-gray-400 line-through mt-1">
                  {product.Price.toLocaleString()} VND
                </p>
              </div>
            ) : (
              <p className="text-3xl font-extrabold text-red-600 mt-6">
                {product.Price.toLocaleString()} VND
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <p className="text-xs text-gray-500 font-semibold">Danh mục</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {product.Category_Name}
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <p className="text-xs text-gray-500 font-semibold">
                  Tình trạng
                </p>
                <p className="mt-1 font-semibold text-green-600">
                  {product.Quantity && product.Quantity > 0
                    ? "Còn hàng"
                    : "Hết hàng"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <span className="font-semibold text-gray-900">Số lượng</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">

                <button
                  type="button"
                  className="w-11 h-11 flex items-center justify-center text-xl hover:bg-gray-50 transition"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>

                <span className="w-12 text-center font-semibold tabular-nums">
                  {quantity}
                </span>

                <button
                  type="button"
                  className="w-11 h-11 flex items-center justify-center text-xl hover:bg-gray-50 transition"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>

              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-7">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.Quantity || product.Quantity === 0}
                className={`flex items-center justify-center gap-2 px-6 py-3 font-extrabold rounded-xl transition
  ${!product.Quantity || product.Quantity === 0
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#003366] text-white hover:bg-[#002244]"
                  }
  `}
              >
                <i className="fa-solid fa-cart-shopping" />
                {product.Quantity === 0 ? "HẾT HÀNG" : "THÊM GIỎ HÀNG"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    localStorage.setItem("pending_buynow", JSON.stringify({ ...product, quantity }));
                    router.push("/login?returnTo=/checkout");
                  } else {
                    addToCart(product);
                    router.push("/checkout");
                  }
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#003366] text-white font-extrabold rounded-xl hover:bg-[#002244] transition"
              >
                MUA NGAY
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              * Giá đã bao gồm VAT. Miễn phí giao hàng cho đơn từ 399K.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              {[
                { icon: "fa-gift", text: "Mua 1 tặng 1 độc quyền" },
                { icon: "fa-rotate-left", text: "Chính sách hoàn tiền 120%" },
                { icon: "fa-award", text: "Chất lượng cam kết cao cấp" },
                { icon: "fa-globe", text: "An toàn chuẩn châu Âu" },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className={
                    "px-5 py-4 flex items-center gap-3 " +
                    (idx < 3 ? "border-b border-gray-200" : "")
                  }
                >
                  <span className="w-9 h-9 rounded-full bg-[#33B1FA]/15 text-[#33B1FA] flex items-center justify-center">
                    <i className={"fa-solid " + row.icon} />
                  </span>
                  <p className="text-sm font-semibold text-[#003366]">
                    {row.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-2xl py-6 bg-white shadow-sm flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Hotline đặt hàng
              </p>
              <p className="text-2xl font-extrabold text-orange-500 tracking-wider">
                0902275501
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TAB THÔNG TIN ===== */}
      <section className="max-w-[1604px] mx-auto px-4 lg:px-10 mt-8">
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              type="button"
              className={tabBtnClass("desc")}
              onClick={() => setTab("desc")}
            >
              Thông tin sản phẩm
            </button>
            <button
              type="button"
              className={tabBtnClass("ingredient")}
              onClick={() => setTab("ingredient")}
            >
              Thành phần
            </button>
            <button
              type="button"
              className={tabBtnClass("guide", true)}
              onClick={() => setTab("guide")}
            >
              Hướng dẫn sử dụng
            </button>
          </div>

          <div className="p-6 lg:p-8">
            <div className={tab === "desc" ? "" : "hidden"}>
              <div
                className={
                  "transition-all " +
                  (expanded ? "max-h-none" : "max-h-[120px] overflow-hidden")
                }
              >
                <p className="text-gray-700 whitespace-pre-wrap">
                  {product.Description ||
                    "Chưa có mô tả chi tiết cho sản phẩm này."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-4 text-blue-600 font-semibold hover:text-blue-800"
              >
                {expanded ? "Thu gọn" : "Xem thêm"}
              </button>
            </div>

            <div className={tab === "ingredient" ? "" : "hidden"}>
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.Ingredients || "Chưa có thông tin thành phần."}
              </p>
            </div>

            <div className={tab === "guide" ? "" : "hidden"}>
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.Usage_Instructions || "Chưa có hướng dẫn sử dụng."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ĐÁNH GIÁ VÀ BÌNH LUẬN ===== */}
      <section className="max-w-[1604px] mx-auto px-4 lg:px-10 mt-16 pb-16">
        <h3 className="text-lg font-bold text-gray-900 mb-8 bg-gray-100 inline-block px-4 py-2 rounded">
          Phần hồi khách hàng
        </h3>

        {/* Rating Summary - Horizontal */}
        <div className="bg-white rounded-lg p-8 border border-gray-300 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Rating score & stars */}
            <div className="lg:col-span-1 text-center">
              <div className="text-6xl font-extrabold text-yellow-400 mb-3">
                {comments.length > 0
                  ? (
                    comments.reduce((sum, c) => sum + (c.rating || 5), 0) /
                    comments.length
                  ).toFixed(1)
                  : "0"}
              </div>
              <div className="flex justify-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`fa-${i <
                      Math.round(
                        comments.reduce((sum, c) => sum + (c.rating || 5), 0) /
                        comments.length || 0,
                      )
                      ? "solid"
                      : "regular"
                      } fa-star text-yellow-400 text-2xl`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 font-semibold">
                ({comments.length} phản hồi)
              </p>
            </div>

            {/* Middle: Rating bars */}
            <div className="lg:col-span-3">
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = comments.filter((c) => c.rating === stars).length;
                  const percentage = comments.length > 0 ? (count / comments.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <i className="fa-solid fa-star text-yellow-400 text-sm"></i>
                      <span className="w-8 text-right text-xs text-gray-600">
                        {stars}
                      </span>
                      <div className="flex-1 h-2 bg-yellow-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-gray-600">
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Write review button */}
            <div className="lg:col-span-1 flex items-center justify-center">
              <button
                disabled={checkingPurchase}
                onClick={async () => {
                  if (!user) {
                    router.push(
                      `/login?returnTo=${encodeURIComponent(`/products/${id}`)}`,
                    );
                    return;
                  }

                  setCheckingPurchase(true);
                  try {
                    const authToken = token || loadToken();
                    console.log("Token:", authToken);
                    const ordersRes = await fetch("https://api.25zone.io.vn/api/orders/me", {
                      headers: { Authorization: `Bearer ${authToken}` },
                    });
                    
                    console.log("Orders response status:", ordersRes.status);
                    if (ordersRes.ok) {
                      const data = await ordersRes.json();
                      const orders = data.orders || [];
                      console.log("Orders found:", orders.length, orders);
                      
                      let hasPurchased = false;
                      
                      for (const order of orders) {
                        const detailRes = await fetch(`https://api.25zone.io.vn/api/orders/me/${order.Id_order}`, {
                          headers: { Authorization: `Bearer ${authToken}` },
                        });
                        if (detailRes.ok) {
                          const detail = await detailRes.json();
                          console.log(`Order ${order.Id_order} items:`, detail.order?.items);
                          if (detail.order?.items && detail.order.items.some((item: any) => String(item.Id_product) === String(id))) {
                            hasPurchased = true;
                            break;
                          }
                        }
                      }

                      if (!hasPurchased) {
                        setShowNotPurchasedPopup(true);
                        setCheckingPurchase(false);
                        return;
                      }
                    } else {
                      console.error("Orders API error:", await ordersRes.text());
                    }
                  } catch (error) {
                    console.error("Lỗi kiểm tra mua hàng:", error);
                  }
                  
                  setCheckingPurchase(false);
                  setShowReview(true);
                }}
                className="w-full py-3 px-4 bg-white border-2 border-gray-700 text-gray-900 font-extrabold rounded transition hover:bg-gray-50 disabled:opacity-50"
              >
                {checkingPurchase ? "ĐANG KIỂM TRA..." : "VIẾT ĐÁNH GIÁ"}
              </button>
            </div>
          </div>
        </div>

        {/* Comments List - Vertical */}
        <div>
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Chưa có đánh giá nào. Hãy là người đầu tiên!
              </p>
            ) : (
              comments.slice(0, displayedComments).map((comment) => (
                <div
                  key={comment.id_product_comment}
                  className="border-b border-gray-300 pb-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">
                        {comment.user_name || `Người dùng #${comment.Id_user}`}
                      </p>
                      <div className="flex gap-0.5 my-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i
                            key={i}
                            className={`fa-${i < (comment.rating || 5) ? "solid" : "regular"} fa-star text-yellow-400 text-xs`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(comment.Created_at).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Comment content */}
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {comment.Content}
                  </p>
                </div>
              ))
            )}

            {/* Xem thêm button */}
            {displayedComments < comments.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setDisplayedComments(displayedComments + 5)}
                  className="text-blue-600 font-semibold hover:text-blue-800 flex items-center justify-center gap-1 mx-auto"
                >
                  Xem thêm
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* review form popup */}
      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90vw] max-w-md rounded-lg p-6 relative">
            <button
              onClick={() => setShowReview(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h4 className="text-xl font-bold mb-4">Viết đánh giá</h4>
            <div className="mb-4">
              <span className="text-sm">Chọn sao:</span>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    onClick={() => setNewRating(i + 1)}
                    className={`cursor-pointer fa-star text-2xl ${i < newRating
                      ? "fa-solid text-yellow-400"
                      : "fa-regular text-gray-300"
                      }`}
                  />
                ))}
              </div>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-3 h-24"
              value={newContent}
              onChange={(e) => { setNewContent(e.target.value); setReviewError(""); }}
              placeholder="Viết nhận xét của bạn..."
            />
            {reviewError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {reviewError}
              </p>
            )}
            <button
              disabled={reviewSubmitting}
              onClick={async () => {
                setReviewError("");
                if (!newContent.trim()) {
                  setReviewError("Vui lòng nhập nội dung đánh giá.");
                  return;
                }
                if (!user) {
                  router.push(
                    `/login?returnTo=${encodeURIComponent(`/products/${id}`)}`
                  );
                  return;
                }

                try {
                  setReviewSubmitting(true);
                  const authToken = token || loadToken();
                  const postRes = await fetch("https://api.25zone.io.vn/api/product-comments", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify({
                      productId: id,
                      userId: user.Id_user,
                      content: newContent.trim(),
                      rating: newRating,
                    }),
                  });

                  if (!postRes.ok) {
                    const errData = await postRes.json().catch(() => ({}));
                    setReviewError(errData?.error || "Gửi đánh giá thất bại. Vui lòng thử lại.");
                    return;
                  }

                  const getRes = await fetch(
                    `https://api.25zone.io.vn/api/product-comments/${id}`,
                  );
                  const data = await getRes.json();
                  setComments(data);
                  setShowReview(false);
                  setNewContent("");
                  setNewRating(5);
                  setReviewError("");
                } catch (e) {
                  console.error(e);
                  setReviewError("Có lỗi xảy ra. Vui lòng thử lại.");
                } finally {
                  setReviewSubmitting(false);
                }
              }}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </div>
      )}

      {/* Not Purchased Popup */}
      {showNotPurchasedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center relative mx-4">
            <button
              onClick={() => setShowNotPurchasedPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể đánh giá</h3>
            <p className="text-gray-600 mb-6">Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành nên không thể đánh giá.</p>
            <button
              onClick={() => setShowNotPurchasedPopup(false)}
              className="bg-[#003366] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#002244] transition w-full"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* ===== SẢN PHẨM LIÊN QUAN ===== */}
      <section className="max-w-[1604px] mx-auto px-4 lg:px-10 mt-16 pb-12">
        <h2 className="text-xl font-extrabold text-[#003366] mb-8 uppercase">
          SẢN PHẨM LIÊN QUAN
        </h2>

        {/* Mobile: 2 cột cho đẹp / Desktop: 4 cột đúng layout gốc */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-10">
          {relatedProducts.map((p) => (
            <RelatedProductCard key={p.Id_product} p={p} onAddToCart={handleAddRelatedToCart} />
          ))}
        </div>
      </section>
      {showPopup && popupProduct && (
        <div className="fixed top-20 right-6 bg-white shadow-xl rounded-xl p-4 w-[320px] flex gap-3 items-center z-50">
          <img
            src={`https://api.25zone.io.vn${popupProduct.Thumbnail}`}
            alt={popupProduct.Name_product}
            className="w-16 h-16 object-cover rounded-lg"
          />

          <div className="flex flex-col">
            <p className="font-semibold text-sm">{popupProduct.Name_product}</p>

            <p className="text-[#003366] font-bold">
              {Number(popupProduct.Price).toLocaleString()}đ
            </p>

            <p className="text-green-600 text-sm">Đã thêm vào giỏ hàng</p>
          </div>
        </div>
      )}
    </main>
  );
}
