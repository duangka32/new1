// src/Pages/ProductGrid.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./ProductGrid.css";

/**
 * props:
 * - items:  [{ id, name, price, image, stock, ... }]
 * - getQty: (id) => number                 // จำนวนในตะกร้าปัจจุบันของสินค้านั้น
 * - onInc:  (product) => void              // เพิ่ม 1 ชิ้น (จะถูกปิดเมื่อสต็อกหมด)
 * - onDec:  (product) => void              // ลด 1 ชิ้น
 */
export default function ProductGrid({ items = [], getQty = () => 0, onInc, onDec }) {
  if (!items.length) {
    return <div className="products-empty">ไม่พบสินค้า</div>;
  }

  return (
    <div className="products-grid">
      {items.map((p) => {
        const qtyInCart = Number(getQty(p.id) || 0);
        const stock = Math.max(0, Number(p.stock ?? 0));
        const remaining = Math.max(0, stock - qtyInCart);
        const outOfStock = stock <= 0;

        return (
          <div className="product-card" key={p.id}>
            <div className="image">
              <Link
                to={`/product/${p.id}`}
                className="thumb"
                aria-label={`ดูรายละเอียด ${p.name}`}
                title={`ดูรายละเอียด ${p.name}`}
              >
                <img
                  src={p.image || "https://via.placeholder.com/400x300?text=Product"}
                  alt={p.name}
                />
              </Link>

              {/* ป้ายหมดสต็อก */}
              {outOfStock && <span className="stock-badge oos">หมดสต็อก</span>}
            </div>

            <div className="info">
              <Link to={`/product/${p.id}`} className="name" title={p.name}>
                {p.name}
              </Link>
              <div className="price">{Number(p.price || 0).toLocaleString()} บาท</div>
            </div>

            <div className="actions">
              {qtyInCart === 0 ? (
                <button
                  className="add-btn"
                  onClick={() => !outOfStock && onInc && onInc(p)}
                  type="button"
                  disabled={outOfStock}
                  aria-disabled={outOfStock}
                  title={outOfStock ? "หมดสต็อก" : "เพิ่มลงตะกร้า"}
                >
                  {outOfStock ? "หมดสต็อก" : "เพิ่มลงตะกร้า"}
                </button>
              ) : (
                <div className="qty-control" aria-label={`จำนวน ${p.name}`}>
                  <button className="dec" onClick={() => onDec && onDec(p)} type="button">−</button>
                  <span className="qty" aria-live="polite">{qtyInCart}</span>
                  <button
                    className="inc"
                    onClick={() => onInc && onInc(p)}
                    type="button"
                    disabled={remaining <= 0}
                    aria-disabled={remaining <= 0}
                    title={remaining <= 0 ? "สต็อกไม่พอ" : "เพิ่มจำนวน"}
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* แสดงคงเหลือ (ถ้ามีสต็อก) */}
            <div className="stock-left">
              {outOfStock ? "คงเหลือ 0" : `คงเหลือ ${remaining.toLocaleString()}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
