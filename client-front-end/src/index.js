// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


// ---- Patch: ลด/ตัด "ResizeObserver loop ..." ใน Chrome Dev ----
if (typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined') {
  const OriginalRO = window.ResizeObserver;
  window.ResizeObserver = class extends OriginalRO {
    constructor(callback) {
      // หน่วง callback ไปเฟรมถัดไป เพื่อลดโอกาสเกิด loop
      super((entries, observer) => {
        requestAnimationFrame(() => callback(entries, observer));
      });
    }
  };
}

// Dev only: กลืน log/error ของ ResizeObserver ไม่ให้สแปมคอนโซล
if (process.env.NODE_ENV !== 'production') {
  const isROLoopMsg = (msg) =>
    typeof msg === 'string' &&
    (msg.includes('ResizeObserver loop completed') ||
     msg.includes('ResizeObserver loop limit exceeded'));

  const origError = console.error;
  console.error = (...args) => {
    if (isROLoopMsg(args?.[0])) return;
    origError(...args);
  };

  // กัน bubbling ของ error/unhandledrejection ที่มาจาก RO
  const isROLoopError = (err) => {
    const m = (err?.message || err?.reason?.message || '').toString();
    return isROLoopMsg(m);
  };
  window.addEventListener('error', (e) => {
    if (isROLoopError(e)) e.stopImmediatePropagation();
  });
  window.addEventListener('unhandledrejection', (e) => {
    if (isROLoopError(e)) e.stopImmediatePropagation();
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


