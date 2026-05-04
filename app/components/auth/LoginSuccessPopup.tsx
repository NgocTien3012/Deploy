"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export function LoginSuccessPopup({ returnTo = "/" }: { returnTo?: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (returnTo === "RELOAD") {
          window.location.reload();
        } else {
          router.replace(returnTo);
        }
      }, 300); // Wait for fade out animation
    }, 2000); // Show for 2 seconds
    
    return () => clearTimeout(t);
  }, [router, returnTo]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (returnTo === "RELOAD") {
        window.location.reload();
      } else {
        router.replace(returnTo);
      }
    }, 300);
  };

  return createPortal(
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      {/* Toast */}
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
            Đăng nhập thành công
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
