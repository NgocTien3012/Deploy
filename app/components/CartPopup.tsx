"use client";

export default function CartPopup({ product }: { product: any }) {
  if (!product) return null;

  return (
    <div className="fixed top-20 right-6 bg-white shadow-xl rounded-xl p-4 w-[320px] flex gap-3 items-center z-50">
      <img
        src={`https://api.25zone.io.vn${product.Thumbnail}`}
        className="w-16 h-16 object-cover rounded-lg"
      />

      <div className="flex flex-col">
        <p className="font-semibold text-sm">{product.Name_product}</p>

        <p className="text-[#003366] font-bold">
          {product.Price?.toLocaleString()}đ
        </p>

        <p className="text-green-600 text-sm">Đã thêm vào giỏ hàng</p>
      </div>
    </div>
  );
}
