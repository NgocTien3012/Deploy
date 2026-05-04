"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function LogoutSuccessToast({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onDone?.();
      }, 300);
    }, 2000);

    return () => clearTimeout(t);
  }, [onDone]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onDone?.();
    }, 300);
  };

  return createPortal(
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      <div
        className={
          "pointer-events-auto bg-[#F4FCF6] border border-[#27AE60] rounded-xl shadow-lg px-5 py-3.5 flex items-center gap-4 min-w-[320px] max-w-[400px] transition-all duration-300 " +
          (visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4")
        }
      >
        <div className="flex-shrink-0">
          <i className="fa-regular fa-circle-check text-[#27AE60] text-xl"></i>
        </div>

        <div className="flex-grow">
          <p className="text-[#27AE60] font-bold text-[15px]">
            Đăng xuất thành công
          </p>
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
