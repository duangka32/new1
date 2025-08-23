// src/Pages/PagesOrders/OrderDetail.jsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
// แก้ path ให้ถูกกับโครงจริงของโปรเจกต์คุณ ถ้า utils อยู่ที่ src/utils/*
import { getOrderById } from "../utils/orders";
import "./OrderDetail.css";

const STATUS_LABEL = {
  pending: "รอดำเนินการ",
  accepted: "รับออเดอร์แล้ว",
  cancelled: "ยกเลิกแล้ว",
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const order = useMemo(() => getOrderById(id), [id]);

  if (!order) {
    return (
      <div className="home-wrapper">
        <div className="orders-container">
          <h2>ไม่พบออเดอร์ #{id}</h2>
          <button className="btn" onClick={() => navigate(-1)} type="button">
            ← กลับ
          </button>
        </div>
      </div>
    );
  }

  const total = order.items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div className="home-wrapper">
      <div className="orders-container">

        {/* ✅ Header แบบ Grid: ซ้าย=ปุ่มกลับ กลาง=ชื่อออเดอร์ ขวา=ตัวเว้นที่ */}
        <div className="order-detail-header">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="กลับ"
            title="กลับ"
          >
            ← กลับ
          </button>

          <h2 className="order-title">ออเดอร์ #{order.id}</h2>

          <span className="header-spacer" aria-hidden="true"></span>
        </div>

        <div style={{ marginBottom: 12 }}>
          ลูกค้า: <strong>{order.customerName}</strong>{" "}
          | สถานะ:{" "}
          <span className={`status-badge status-${order.status}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            วันที่: {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>

        <table className="orders-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>สินค้า</th>
              <th>จำนวน</th>
              <th>ราคา/ชิ้น</th>
              <th>ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id}>
                <td style={{ textAlign: "left" }}>{it.name}</td>
                <td style={{ textAlign: "center" }}>{it.qty}</td>
                <td style={{ textAlign: "right" }}>{it.price.toLocaleString()}</td>
                <td style={{ textAlign: "right" }}>{(it.price * it.qty).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: 700 }}>
                รวมทั้งหมด
              </td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>
                {total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
