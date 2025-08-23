// src/Pages/CategoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import background from "../Assets/background.jpg";
import "./CategoryPage.css";

import ProductGrid from '../../Pages/ProductGrid';
import { readCart, addItem } from '../../utils/cart';
import { readProducts } from '../../utils/products';// ← ใช้คลังสินค้าเดียวกับหน้าอื่น

const mapParamToLabel = {
  kitchen: "ของใช้ในครัวเรือน",
  food: "ผลิตภัณฑ์อาหาร",
  drink: "เครื่องดื่ม",
  medicine: "ยาสามัญ",
};

// บางหน้าบันทึก category เป็น key คนละแบบ (kitchen vs household)
// รองรับทั้งสองชื่อเพื่อให้ฟิลเตอร์ติดแน่นอน
const mapParamToKeys = (key) => {
  switch (key) {
    case "kitchen":
      return ["kitchen", "household"]; // รองรับสองคีย์
    case "food":
      return ["food"];
    case "drink":
      return ["drink"];
    case "medicine":
      return ["medicine"];
    default:
      return [key]; // เผื่อคีย์อื่นในอนาคต
  }
};

export default function CategoryPage() {
  const { name } = useParams(); // key จาก URL เช่น 'kitchen'
  const [searchText, setSearchText] = useState("");

  // ===== โหลดสินค้า (จาก localStorage ผ่าน utils/products) =====
  const [allProducts, setAllProducts] = useState(() => readProducts());

  useEffect(() => {
    // เผื่อมีหน้าอื่นอัปเดตสินค้า
    const reload = () => setAllProducts(readProducts());
    window.addEventListener("products:updated", reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("products:updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  // ===== qtyMap จาก localStorage (เหมือนหน้า Home) =====
  const buildQtyMap = () => {
    const c = readCart();
    const m = {};
    Object.values(c).forEach((v) => (m[v.id] = v.qty));
    return m;
  };
  const [qtyMap, setQtyMap] = useState(buildQtyMap);

  useEffect(() => {
    const onUpdate = () => setQtyMap(buildQtyMap());
    window.addEventListener("cart:updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cart:updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  // ===== ฟิลเตอร์ตามหมวด + ค้นหา =====
  const categoryKeys = mapParamToKeys(name);
  const items = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    let list = allProducts.filter((p) => categoryKeys.includes(p.category));
    if (q) list = list.filter((p) => p.name?.toLowerCase().includes(q));
    return list;
  }, [allProducts, categoryKeys, searchText]);

  // ===== Cart controls =====
  const getQty = (id) => qtyMap[id] || 0;
  const inc = (p) => {
    addItem(p, 1);
    setQtyMap(buildQtyMap());
  };
  const dec = (p) => {
    addItem(p, -1);
    setQtyMap(buildQtyMap());
  };

  return (
    <div className="category-page" style={{ backgroundImage: `url(${background})` }}>
      <div className="category-box">
        <div className="category-header">
          <h2>{mapParamToLabel[name] || name}</h2>

          <div className="category-search">
            <input
              type="text"
              placeholder={`ค้นหาในหมวด "${mapParamToLabel[name] || name}"...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <div className="category-content">
          <ProductGrid items={items} getQty={getQty} onInc={inc} onDec={dec} />
        </div>
      </div>
    </div>
  );
}
