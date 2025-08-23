// src/Pages/ProctStock.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./ProductStock.css";
import {
  MdDelete,
  MdModeEdit,
  MdVisibility,
  MdVisibilityOff,
  MdAddPhotoAlternate
} from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import { 
  readProducts, 
  writeProducts, 
  PRODUCTS_UPDATED_EVENT 
} from '../../utils/products';

const Inventory = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState(() => readProducts());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const reload = () => setProducts(readProducts());
    window.addEventListener(PRODUCTS_UPDATED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const persist = (next) => {
    writeProducts(next);
    setProducts(next);
  };

  const toggleVisibility = (id) => {
    const next = products.map((p) =>
      p.id === id ? { ...p, visible: !p.visible } : p
    );
    persist(next);
  };

  const deleteProduct = (id) => {
    if (!window.confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;
    const next = products.filter((p) => p.id !== id);
    persist(next);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.category].some((v) => v?.toLowerCase().includes(q))
    );
  }, [products, query]);

  const fmtPrice = (n) => Number(n || 0).toLocaleString();
  const fmtStock = (n) => Math.max(0, Number.isFinite(+n) ? Math.floor(+n) : 0);

  return (
    <div className="page-wrapper">
      <div className="page-content-box">
        <div className="product-stock-top-bar">
          <input
            type="text"
            placeholder="ค้นหา..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="add-button"
            onClick={() => navigate("/addProduct")}
            type="button"
          >
            <FaPlus /> เพิ่มสินค้า
          </button>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>รูปภาพ</th>
              <th>ชื่อสินค้า</th>
              <th>หมวดหมู่</th>
              <th>ราคา</th>
              <th>คงเหลือ</th> {/* ✅ เพิ่มคอลัมน์สต็อก */}
              <th>เปิด/ปิด</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, index) => {
              const pid = product.id;
              const name = product.name || "-";
              const category = product.category || "-";
              const price = fmtPrice(product.price);
              const stock = fmtStock(product.stock); // ✅ แสดงจำนวนคงเหลือ
              const stockClass =
                stock === 0 ? "oos" : stock <= 5 ? "low" : "ok";

              return (
                <tr key={pid ?? index}>
                  <td>{index + 1}</td>
                  <td>
                    <Link
                      to={`/product/${pid}`}
                      aria-label={`ดูรายละเอียด ${name}`}
                      title={`ดูรายละเอียด ${name}`}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={name}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 5,
                          }}
                        />
                      ) : (
                        <MdAddPhotoAlternate size={30} color="#666" />
                      )}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/product/${pid}`} className="link" title={name}>
                      {name}
                    </Link>
                  </td>
                  <td>{category}</td>
                  <td>{price}</td>
                  <td>
                    {/* ✅ Badge แสดงคงเหลือ + สีเตือน */}
                    <span className={`stock-chip ${stockClass}`}>
                      {stock.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    {product.visible ? (
                      <button
                        type="button"
                        onClick={() => toggleVisibility(pid)}
                        className="icon-btn"
                        title="ซ่อนสินค้า"
                        aria-label="ซ่อนสินค้า"
                      >
                        <MdVisibility />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleVisibility(pid)}
                        className="icon-btn"
                        title="แสดงสินค้า"
                        aria-label="แสดงสินค้า"
                      >
                        <MdVisibilityOff />
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => navigate("/addProduct", { state: { product } })}
                      title="แก้ไขสินค้า"
                      aria-label="แก้ไขสินค้า"
                      style={{ marginRight: 8 }}
                    >
                      <MdModeEdit />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => deleteProduct(pid)}
                      title="ลบสินค้า"
                      aria-label="ลบสินค้า"
                      style={{ color: "red" }}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                {/* ✅ อัปเดต colSpan จาก 7 → 8 */}
                <td colSpan={8} style={{ textAlign: "center", padding: 16, opacity: 0.7 }}>
                  ไม่พบสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
