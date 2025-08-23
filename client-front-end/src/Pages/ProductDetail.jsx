// src/Pages/ProductDetail.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../utils/products";
import { addItem, readCart } from "../utils/cart";
import "./ProductDetail.css";

const categoryLabel = (keyOrName) => {
  const map = {
    kitchen: "ของใช้ในครัวเรือน",
    household: "ของใช้ในครัวเรือน",
    food: "ผลิตภัณฑ์อาหาร",
    drink: "เครื่องดื่ม",
    medicine: "ยาสามัญ",
  };
  return map[keyOrName] || keyOrName || "-";
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = useMemo(() => getProductById(id), [id]);

  // ===== qty จาก localStorage (ซิงค์แบบเดียวกับหน้าอื่น)
  const getQtyFromStore = () => {
    const cart = readCart();
    const found = Object.values(cart).find((v) => String(v.id) === String(id));
    return found ? found.qty : 0;
  };
  const [qty, setQty] = useState(getQtyFromStore);

  useEffect(() => {
    const refresh = () => setQty(getQtyFromStore());
    window.addEventListener("cart:updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cart:updated", refresh);
      window.removeEventListener("storage", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!product) {
    return (
      <div className="home-wrapper">
        <div className="pd-container">
          <h2 className="pd-title center">ไม่พบสินค้า #{id}</h2>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button className="btn back-btn small" onClick={() => navigate(-1)} type="button">
              ← กลับ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const productForCart = {
    id: product.id,
    name: product.name,
    price: Number(product.price || 0),
    image: product.image || "",
  };

  const inc = () => {
    addItem(productForCart, +1);
    setQty(getQtyFromStore());   // ✅ อ่านจาก store จริงหลังเขียน
  };

  const dec = () => {
    addItem(productForCart, -1);
    setQty(getQtyFromStore());   // ✅ อ่านจาก store จริงหลังเขียน
  };

  return (
    <div className="home-wrapper">
      <div className="pd-container">
        {/* หัวข้อ: ปุ่มกลับเล็ก + ชื่อกลาง */}
        <div className="pd-header">
          <button className="back-btn small" onClick={() => navigate(-1)} type="button">
            ← กลับ
          </button>
          <h2 className="pd-title">{product.name}</h2>
        </div>

        <div className="pd-grid">
          <div className="pd-image">
            <img
              src={product.image || "https://via.placeholder.com/800x600?text=No+Image"}
              alt={product.name}
            />
          </div>

          <div className="pd-info">
            <div className="pd-price">
              <span className="pd-price-value">
                {Number(product.price || 0).toLocaleString()}
              </span>{" "}
              บาท
            </div>

            {product.volume && (
              <div className="pd-row">
                <label>ปริมาณ</label>
                <div>{product.volume}</div>
              </div>
            )}

            {product.category && (
              <div className="pd-row">
                <label>หมวดหมู่</label>
                <div>{categoryLabel(product.category)}</div>
              </div>
            )}

            {product.description && (
              <div className="pd-desc">
                <label>รายละเอียด</label>
                <p>{product.description}</p>
              </div>
            )}

            <div className="pd-actions">
              {qty === 0 ? (
                <button className="btn blue" onClick={inc} type="button">
                  เพิ่มลงตะกร้า
                </button>
              ) : (
                <div className="qty-control" aria-label={`จำนวน ${product.name}`}>
                  <button className="dec" onClick={dec} type="button">−</button>
                  <span className="qty" aria-live="polite">{qty}</span>
                  <button className="inc" onClick={inc} type="button">+</button>
                </div>
              )}

              <button className="btn outline" onClick={() => navigate("/cart")} type="button">
                ไปตะกร้า
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
