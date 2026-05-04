"use client";
import { useState } from "react";
import { getUserStorageKey } from "@/lib/user-storage";

export function useCart() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState<any>(null);

  const getKey = () => getUserStorageKey("cart");

  const addToCart = (product: any) => {
    const key = getKey();
    const cart = JSON.parse(localStorage.getItem(key) || "[]");

    const index = cart.findIndex(
      (item: any) => item.Id_product === product.Id_product,
    );

    if (index !== -1) {
      cart[index].quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));

    setPopupProduct(product);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 2500);
  };

  return { addToCart, showPopup, popupProduct };
}
