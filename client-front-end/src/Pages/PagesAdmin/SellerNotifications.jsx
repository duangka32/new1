import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Notification.css";

export default function SellerNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(() => [
    { id: "s1", type: "ORDER_NEW", message: "มีคำสั่งซื้อใหม่จากลูกค้า A", orderId: "ODR-240001", createdAt: Date.now() - 1000 * 60 * 15, read: false },
    { id: "s2", type: "STOCK_LOW", message: "สินค้าหมดสต็อก หรือเหลือน้อย 5 ชิ้น กรุณาเพิ่มสินค้า", productId: "PRD-10001", createdAt: Date.now() - 1000 * 60 * 60 * 4, read: false },
    { id: "s3", type: "CUSTOMER_CONFIRMED", message: "ลูกค้ากดยืนยันการรับสินค้าแล้ว", orderId: "ODR-239998", createdAt: Date.now() - 1000 * 60 * 60 * 26, read: true }
  ]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const markRead  = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const clearAll  = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const fmtTime   = (ts) => new Date(ts).toLocaleString();

  const badgeByType = (type) => {
    switch (type) {
      case "ORDER_NEW":          return <span className="badge badge-green">ออเดอร์ใหม่</span>;
      case "STOCK_LOW":          return <span className="badge badge-orange">สต็อก</span>;
      case "CUSTOMER_CONFIRMED": return <span className="badge badge-blue">ลูกค้ายืนยัน</span>;
      default:                   return <span className="badge badge-gray">ระบบ</span>;
    }
  };

  const handleShipNow = (orderId) => {
    window.dispatchEvent(new CustomEvent("order:shipped", { detail: { orderId, shopName: "ร้านของฉัน" } }));
    // ถ้าไม่อยากให้มี alert ตรงนี้ ลบบรรทัดด้านล่างได้
    // alert(`แจ้งสถานะจัดส่งสำเร็จแล้ว (ออเดอร์: ${orderId})`);
    setNotifications((prev) => prev.map((n) => (n.orderId === orderId ? { ...n, read: true } : n)));
  };

  return (
    <div className="notify-page">
      <div className="notify-wrapper">
        <div className="notify-content-box">
          <div className="notify-header"><h2>🔔 การแจ้งเตือนร้านค้า {unreadCount > 0 ? `(${unreadCount} ใหม่)` : ""}</h2></div>

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
                    {n.type === "ORDER_NEW" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => navigate(`/orders/${n.orderId}`)}
                        >
                          ดูออเดอร์
                        </button>
                        <button type="button" className="btn" onClick={() => handleShipNow(n.orderId)}>
                          กดส่งแล้ว
                        </button>
                      </>
                    )}

                    {n.type === "STOCK_LOW" && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate(`/admin/products/${n.productId}`)}
                      >
                        เพิ่มสต็อก
                      </button>
                    )}

                    {n.type === "CUSTOMER_CONFIRMED" && n.orderId && (
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
