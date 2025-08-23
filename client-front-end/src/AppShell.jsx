import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./Pages/TopBar";
import "./AppShell.css";

export default function AppShell() {
  useEffect(() => {
    const el = document.querySelector(".top-bar");
    if (!el) return;

    const setVar = () => {
      const h = Math.ceil(el.getBoundingClientRect().height || el.offsetHeight || 120);
      document.documentElement.style.setProperty("--topbar-h", `${h}px`);
    };

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener("load", setVar);
    window.addEventListener("resize", setVar);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", setVar);
      window.removeEventListener("resize", setVar);
    };
  }, []);

  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
