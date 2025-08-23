// src/PagesCustomer/OrderCustomer.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { readOrders, writeOrders } from "../../utils/orders";
import OrderList from "../PagesAdmin/OrderList";
import { getOrdersByCustomer, setOrderStatus, ORDERS_UPDATED_EVENT } from "../../utils/orders";
import "../PagesAdmin/OrderAdmin.css";

export default function OrderCustomer() {
  const [orders, setOrders] = useState([]);
  const location = useLocation();
  const justOrdered = location.state?.justOrdered;

  const loadMyOrders = () => {
    // ถ้ายังไม่มีระบบ auth: ใช้ชื่อ "ฉัน" เป็นตัวกรอง
    setOrders(getOrdersByCustomer("ฉัน"));
  };

  useEffect(() => {
    loadMyOrders();
    // ฟังการเปลี่ยนแปลงออเดอร์จากแท็บ/หน้าต่างอื่น
    window.addEventListener(ORDERS_UPDATED_EVENT, loadMyOrders);
    window.addEventListener("storage", loadMyOrders);
    return () => {
      window.removeEventListener(ORDERS_UPDATED_EVENT, loadMyOrders);
      window.removeEventListener("storage", loadMyOrders);
    };
  }, []);

  // ลูกค้าทำได้แค่ "cancel"
  const handleAction = async (id, action) => {
    if (action !== "cancel") return;
    setOrderStatus(id, "cancelled"); // ✅ จะ trigger ORDERS_UPDATED_EVENT ให้อัตโนมัติ
  };

  return (
    <div className="home-wrapper">
      <div className="orders-container">
        <h2>รายการคำสั่งซื้อ</h2>

        {justOrdered && (
          <div
            className="order-success-banner"
            style={{
              margin: "12px 0 16px",
              padding: "10px 14px",
              background: "#e8f5e9",
              color: "#2e7d32",
              border: "1px solid #c8e6c9",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            ✅ สั่งซื้อสำเร็จ! นี่คือรายการคำสั่งซื้อของคุณ
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{ marginTop: 16, opacity: 0.8 }}>
            ยังไม่มีคำสั่งซื้อ
          </div>
        ) : (
          <OrderList
            role="customer"
            orders={orders}
            onAction={handleAction}
            basePath="/orders"   // ✅ เพิ่มตรงนี้
          />
        )}
      </div>
    </div>
  );
}
