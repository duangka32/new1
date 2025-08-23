// src/Pages/PagesAdmin/OrderList.jsx
import React from "react";
import { Link } from "react-router-dom";

const ACTIONS_BY_ROLE = {
  admin: ["accept", "cancel"],
  customer: ["cancel"],
};

const STATUS_LABEL = {
  pending: "รอดำเนินการ",
  accepted: "รับออเดอร์แล้ว",
  cancelled: "ยกเลิกแล้ว",
};

function formatMoney(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "-";
  return num.toLocaleString();
}

function formatDate(ts) {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "-";
  }
}

export default function OrderList({
  role,
  orders = [],
  onAction,
  basePath = "/orders",
}) {
  const allowedActions = ACTIONS_BY_ROLE[role] || [];
  const isEmpty = !orders || orders.length === 0;

  return (
    <table className="orders-table">
      <thead>
        <tr>
          <th>รหัส</th>
          <th>ลูกค้า</th>
          <th>ยอดรวม</th>
          <th>สถานะ</th>
          <th>วันที่</th>
          <th>รายละเอียด</th>
          <th>การทำงาน</th>
        </tr>
      </thead>

      <tbody>
        {isEmpty ? (
          <tr>
            <td colSpan={7} style={{ textAlign: "center", padding: 16, opacity: 0.7 }}>
              ยังไม่มีคำสั่งซื้อ
            </td>
          </tr>
        ) : (
          orders.map((o) => {
            const showAccept = allowedActions.includes("accept") && o.status === "pending";
            const showCancel = allowedActions.includes("cancel") && o.status === "pending";

            return (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customerName ?? "-"}</td>
                <td>{formatMoney(o.total)}</td>
                <td>
                  <span className={`status-badge status-${o.status}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </td>
                <td>{formatDate(o.createdAt)}</td>
                <td>
                  <Link
                    className="btn outline"
                    to={`${basePath}/${o.id}`}
                    aria-label={`ดูรายละเอียดออเดอร์หมายเลข ${o.id}`}
                    title="ดูรายการสินค้า"
                  >
                    ดูรายการ
                  </Link>
                </td>
                <td>
                  <div className="row-actions">
                    {showAccept && (
                      <button
                        type="button"
                        className="btn blue"
                        onClick={() => onAction?.(o.id, "accept")}
                        title="รับออเดอร์"
                        data-action="accept"
                        data-id={o.id}
                      >
                        รับออเดอร์
                      </button>
                    )}

                    {showCancel && (
                      <button
                        type="button"
                        className="btn logout"
                        onClick={() => onAction?.(o.id, "cancel")}
                        title="ยกเลิกออเดอร์"
                        data-action="cancel"
                        data-id={o.id}
                      >
                        ยกเลิก
                      </button>
                    )}

                    {/* ถ้าไม่มีปุ่มใดเลย ให้ขีดเส้นประแทน */}
                    {!showAccept && !showCancel && <span style={{ opacity: 0.6 }}>—</span>}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
