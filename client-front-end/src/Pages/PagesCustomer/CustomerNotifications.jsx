import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Notification.css";

export default function CustomerNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(() => [
    { id: "n1", type: "ORDER_CONFIRMED", message: "คำสั่งซื้อของคุณถูกยืนยันแล้ว", orderId: "ODR-240001", createdAt: Date.now() - 1000 * 60 * 45, read: false },
    { id: "n2", type: "SYSTEM", message: "มีโปรโมชั่นสำหรับคุณในหมวดเสื้อผ้า", createdAt: Date.now() - 1000 * 60 * 60 * 3, read: true }
  ]);

  useEffect(() => {
    const onShipped = (e) => {
      const { orderId, shopName } = e.detail || {};
      const id = `n-${Date.now()}`;
      setNotifications((prev) => [
        { id, type: "ORDER_SHIPPED", message: `ออเดอร์ ${orderId} จากร้าน ${shopName || "ร้านค้า"} จัดส่งสำเร็จแล้ว`, orderId, createdAt: Date.now(), read: false },
        ...prev
      ]);
    };
    window.addEventListener("order:shipped", onShipped);
    return () => window.removeEventListener("order:shipped", onShipped);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const markRead  = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const clearAll  = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const fmtTime   = (ts) => new Date(ts).toLocaleString();

  const badgeByType = (type) => {
    switch (type) {
      case "ORDER_CONFIRMED": return <span className="badge badge-green">คำสั่งซื้อ</span>;
      case "ORDER_SHIPPED":   return <span className="badge badge-blue">จัดส่ง</span>;
      default:                return <span className="badge badge-gray">ระบบ</span>;
    }
  };

  return (
    <div className="notify-page">
      <div className="notify-wrapper">
        <div className="notify-content-box">
          <div className="notify-header"><h2>🔔 การแจ้งเตือนลูกค้า {unreadCount > 0 ? `(${unreadCount} ใหม่)` : ""}</h2></div>

          {notifications.length === 0 ? (
            <div className="notify-empty"><p>ยังไม่มีการแจ้งเตือน</p></div>
          ) : (
            <>
              <div className="notify-actions">
                <button type="button" className="btn" onClick={clearAll}>ทำทั้งหมดเป็นอ่านแล้ว</button>
              </div>

              {notifications.map((n) => (
                <div key={n.id} className={`notify-item ${n.read ? "is-read" : ""}`}>
                  <div className="notify-left">
                    {badgeByType(n.type)}
                    <div className="notify-message">{n.message}</div>
                    <div className="notify-meta">{fmtTime(n.createdAt)}</div>
                  </div>
                  <div className="notify-right">
                    {n.orderId && (
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => navigate(`/orders/${n.orderId}`)}
                      >
                        ดูออเดอร์
                      </button>
                    )}
                    {!n.read && (
                      <button type="button" className="btn" onClick={() => markRead(n.id)}>ทำเป็นอ่านแล้ว</button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
