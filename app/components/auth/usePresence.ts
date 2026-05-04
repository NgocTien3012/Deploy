"use client";

import { useEffect, useState } from "react";

/**
 * Giữ component mounted thêm 1 khoảng để chạy animation đóng mượt.
 * mounted: có render hay không
 * visible: trạng thái dùng để toggle class (opacity/scale/translate)
 */
export function usePresence(open: boolean, duration = 220) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    let t: number | undefined;
    let raf: number | undefined;

    if (open) {
      setMounted(true);
      setVisible(false);
      raf = window.requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      t = window.setTimeout(() => setMounted(false), duration);
    }

    return () => {
      if (t) window.clearTimeout(t);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [open, duration]);

  return { mounted, visible };
}