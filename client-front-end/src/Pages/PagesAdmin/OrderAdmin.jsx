// src/PagesAdmin/OrderAdmin.jsx
import React, { useEffect, useState } from "react";
import OrderList from "./OrderList";
import "./OrderAdmin.css";

import {
  readOrders,
  ORDERS_UPDATED_EVENT,
  setOrderStatus,
  ORDER_STATUS,
} from "../../utils/orders";

export default function OrderAdmin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const reload = () => setOrders(readOrders());
    reload();
    // ฟังการเปลี่ยนแปลงจากหน้าต่าง/แท็บอื่น และจากการเขียน orders
    window.addEventListener(ORDERS_UPDATED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(ORDERS_UPDATED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const handleAction = (id, action) => {
    if (action === "accept") {
      setOrderStatus(Number(id), ORDER_STATUS.ACCEPTED);
    } else if (action === "cancel") {
      setOrderStatus(Number(id), ORDER_STATUS.CANCELLED);
    }

    // อัปเดตหน้าแบบ optimistic ทันที (รอ event ก็ได้ แต่ทำให้รู้สึกไว)
    setOrders(prev =>
      prev.map(o =>
        String(o.id) === String(id)
          ? { ...o, status: action === "accept" ? ORDER_STATUS.ACCEPTED : ORDER_STATUS.CANCELLED }
          : o
      )
    );
  };

  return (
    <div className="home-wrapper">
      <div className="orders-container" role="region" aria-label="จัดการคำสั่งซื้อ (แอดมิน)">
        <h2>จัดการคำสั่งซื้อ (แอดมิน)</h2>
        <OrderList role="admin" orders={orders} onAction={handleAction} />
      </div>
    </div>
  );
}
