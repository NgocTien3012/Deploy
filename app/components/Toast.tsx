"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "warning";
  onClose: () => void;
};

export default function Toast({ message, type = "error", onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 3000); // Tự đóng sau 3 giây

    return () => clearTimeout(t);
  }, [onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getStyle = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-[#F4FCF6]",
          border: "border-[#27AE60]",
          icon: "fa-circle-check text-[#27AE60]",
          text: "text-[#27AE60]",
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-400",
          icon: "fa-triangle-exclamation text-amber-500",
          text: "text-amber-700",
        };
      case "error":
      default:
        return {
          bg: "bg-red-50",
          border: "border-red-400",
          icon: "fa-circle-xmark text-red-500",
          text: "text-red-700",
        };
    }
  };

  const style = getStyle();

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      <div
        className={
          `pointer-events-auto ${style.bg} border ${style.border} rounded-xl shadow-lg px-5 py-3.5 flex items-center gap-4 min-w-[320px] max-w-[400px] transition-all duration-300 ` +
          (visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4")
        }
      >
        <div className="flex-shrink-0">
          <i className={`fa-regular ${style.icon} text-xl`}></i>
        </div>

        <div className="flex-grow">
          <p className={`${style.text} font-bold text-[15px]`}>{message}</p>
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
    </div>,
    document.body
  );
}
