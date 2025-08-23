// src/Pages/Cart.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./Cart.css";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { readCart, writeCart, addItem } from "../utils/cart";
import { createOrder } from "../utils/orders";
import { getProductById } from "../utils/products";

const Cart = () => {
  const navigate = useNavigate();
  const [cartMap, setCartMap] = useState(() => readCart());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    const reload = () => setCartMap(readCart());
    reload();
    window.addEventListener("cart:updated", reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("cart:updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const items = useMemo(() => Object.values(cartMap), [cartMap]);
  const total = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items]);

  const inc = (id) => {
    const it = cartMap[id];
    if (!it) return;
    const p = getProductById(id);
    const stock = Math.max(0, Number(p?.stock ?? 0));
    if (it.qty + 1 > stock) {
      alert(`สต็อกของ "${it.name}" เหลือ ${stock} ชิ้น`);
      return;
    }
    addItem(it, +1);
    setCartMap(readCart());
  };

  const dec = (id) => {
    const it = cartMap[id];
    if (!it) return;
    addItem(it, -1);
    setCartMap(readCart());
  };

  const removeItem = (id) => {
    const next = { ...cartMap };
    delete next[id];
    writeCart(next);
    setCartMap(next);
  };

  const handleOrderClick = () => {
    if (items.length === 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    if (isOrdering) return;
    setIsOrdering(true);
    try {
      // เตรียมรายการสำหรับออเดอร์
      const itemsForOrder = items.map(it => ({
        id: it.id,
        name: it.name,
        price: Number(it.price),
        qty: Number(it.qty),
      }));

      // สร้างออเดอร์ (ภายในจะตรวจ/ตัดสต็อกให้ ถ้าไม่พอจะ throw)
      await createOrder({ customerName: "ฉัน", items: itemsForOrder });

      // เคลียร์ตะกร้า
      writeCart({});
      setCartMap({});

      // ปิดโมดัลและไปหน้า orders
      setShowConfirmModal(false);
      navigate("/orders", { state: { justOrdered: true } });
    } catch (err) {
      alert(err?.message || "สั่งซื้อไม่สำเร็จ: สต็อกไม่เพียงพอ");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-wrapper">
        <div className="cart-content-box">
          <div className="cart-header"><h2>🛒 ตะกร้าสินค้า</h2></div>

          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ marginBottom: 12 }}>ยังไม่มีสินค้าในตะกร้า</p>
              <button className="order-button" onClick={() => navigate("/home")} type="button">
                เลือกซื้อสินค้า
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => {
                const p = getProductById(item.id);
                const stock = Math.max(0, Number(p?.stock ?? 0));
                const canInc = item.qty < stock;

                return (
                  <div key={item.id} className="cart-item">
                    <img
                      src={item.image || "https://via.placeholder.com/60"}
                      alt={item.name}
                      className="cart-image"
                    />
                    <div className="cart-info">
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div>{Number(item.price).toLocaleString()} บาท</div>
                      <div style={{ fontSize: 12, color: "#374151" }}>
                        คงเหลือในสต็อก: {stock}
                      </div>
                    </div>
                    <div className="cart-actions">
                      <button onClick={() => dec(item.id)} type="button">-</button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => inc(item.id)}
                        type="button"
                        disabled={!canInc}
                        title={canInc ? "เพิ่มจำนวน" : "สต็อกไม่พอ"}
                      >
                        +
                      </button>
                      <MdDelete
                        size={20}
                        style={{ marginLeft: 10, cursor: "pointer", color: "red" }}
                        onClick={() => removeItem(item.id)}
                        title="ลบรายการนี้"
                      />
                    </div>
                  </div>
                );
              })}

              <div className="cart-summary">
                <h3>รวม: {total.toLocaleString()} บาท</h3>
                <button
                  className="order-button"
                  onClick={handleOrderClick}
                  type="button"
                  disabled={items.length === 0}
                >
                  สั่งซื้อ
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal ยืนยันการสั่งซื้อ */}
      {showConfirmModal && (
        <div
          className="modal-overlay"
          onClick={() => !isOrdering && setShowConfirmModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p id="confirm-title">ยืนยันคำสั่งซื้อของคุณ?</p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <button
                onClick={handleConfirmOrder}
                type="button"
                className="confirm-button"
                disabled={isOrdering}
                style={{
                  padding: "10px 28px",
                  backgroundColor: isOrdering ? "#9ca3af" : "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: isOrdering ? "not-allowed" : "pointer",
                }}
              >
                {isOrdering ? "กำลังสั่งซื้อ..." : "ตกลง"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
