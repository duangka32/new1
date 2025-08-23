// src/hooks/useSafeResizeObserver.js
import { useEffect, useRef } from "react";

export default function useSafeResizeObserver(ref, onResize) {
  const last = useRef({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    let raf = null;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (w !== last.current.w || h !== last.current.h) {
          last.current = { w, h };
          // เรียก callback แค่ตอนขนาดเปลี่ยนจริง
          onResize(el, { width: w, height: h });
        }
      });
    });
    ro.observe(ref.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [ref, onResize]);
}
