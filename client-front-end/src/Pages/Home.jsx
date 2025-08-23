// src/Pages/Home.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Home.css';
import background from '../Components/Assets/background.jpg';
import adBanner from '../Components/Assets/orange2.jpg';
import kitchenIcon from '../Components/Assets/kitchenIcon.png';
import foodIcon from '../Components/Assets/foodIcon.png';
import drinkIcon from '../Components/Assets/drinkIcon.png';
import medicineIcon from '../Components/Assets/medicineIcon.png';

import TopBar from '../Pages/TopBar';
import ProductGrid from '../Pages/ProductGrid';

// ✅ ดึงจาก storage จริง
import {
  readProducts,
  PRODUCTS_UPDATED_EVENT,
  getProductById,
} from '../utils/products';
import { readCart, addItem } from '../utils/cart';

// ตัวเลือกหมวดหมู่ (label ที่โชว์ใน UI ↔ value ภายในสินค้า)
const CATEGORY_OPTIONS = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ของใช้ในครัวเรือน', value: 'household', icon: kitchenIcon },
  { label: 'ผลิตภัณฑ์อาหาร', value: 'food', icon: foodIcon },
  { label: 'เครื่องดื่ม', value: 'drink', icon: drinkIcon },
  { label: 'ยาสามัญ', value: 'medicine', icon: medicineIcon },
];

export default function Home() {
  // ---- Top filters/search ----
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    category: 'ทั้งหมด', // ← TopBar ส่ง label กลับมา
    priceMin: '',
    priceMax: '',
    sort: 'rel', // rel | price_asc | price_desc | newest
  });

  // ---- Products from storage ----
  const [products, setProducts] = useState(() => readProducts());
  useEffect(() => {
    const reload = () => setProducts(readProducts());
    // อัปเดตเมื่อมีการเพิ่ม/แก้/ลบสินค้า หรือข้ามแท็บ
    window.addEventListener(PRODUCTS_UPDATED_EVENT, reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  // ---- Cart state (สำหรับปุ่ม + / -) ----
  const [cartMap, setCartMap] = useState(() => readCart());
  useEffect(() => {
    const reloadCart = () => setCartMap(readCart());
    window.addEventListener('cart:updated', reloadCart);
    window.addEventListener('storage', reloadCart);
    return () => {
      window.removeEventListener('cart:updated', reloadCart);
      window.removeEventListener('storage', reloadCart);
    };
  }, []);
  const getQty = (id) => cartMap[id]?.qty || 0;

  const inc = (p) => {
    const prod = getProductById(p.id);
    const stock = Math.max(0, Number(prod?.stock ?? 0));
    const current = getQty(p.id);
    if (current + 1 > stock) {
      alert(`สต็อกของ "${p.name}" เหลือ ${stock} ชิ้น`);
      return;
    }
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image }, +1);
    setCartMap(readCart());
  };
  const dec = (p) => {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image }, -1);
    setCartMap(readCart());
  };

  // ---- Map label → value ----
  const currentCatValue =
    CATEGORY_OPTIONS.find((o) => o.label === filters.category)?.value || 'all';

  // ---- Filtered products (เฉพาะ visible) ----
  const filtered = useMemo(() => {
    let list = (products || []).filter((p) => p?.visible !== false);

    // หมวดหมู่
    if (currentCatValue !== 'all') {
      list = list.filter((p) => p.category === currentCatValue);
    }

    // ค้นหาชื่อ
    const q = searchText.trim().toLowerCase();
    if (q) list = list.filter((p) => String(p.name || '').toLowerCase().includes(q));

    // ราคา
    const min = filters.priceMin !== '' ? Number(filters.priceMin) : null;
    const max = filters.priceMax !== '' ? Number(filters.priceMax) : null;
    if (min !== null) list = list.filter((p) => Number(p.price || 0) >= min);
    if (max !== null) list = list.filter((p) => Number(p.price || 0) <= max);

    // เรียง
    switch (filters.sort) {
      case 'price_asc':
        list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price_desc':
        list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'newest': {
        // ถ้าไม่มี createdAt ใช้ id แทน
        const key = (p) => Number(p.createdAt ?? p.id ?? 0);
        list.sort((a, b) => key(b) - key(a));
        break;
      }
      default:
        break; // แนะนำ = ไม่เปลี่ยนลำดับ
    }

    return list;
  }, [products, searchText, filters, currentCatValue]);

  // ---- กดไอคอนหมวดหมู่ด้านขวาใน hero ----
  const heroPickCategory = (catValue) => {
    const label = CATEGORY_OPTIONS.find((x) => x.value === catValue)?.label || 'ทั้งหมด';
    setFilters((prev) => ({ ...prev, category: label }));
    // เลื่อนลงไปที่โซนสินค้า
    productRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const productRef = useRef(null);

  return (
    <div className="home-wrapper" style={{ backgroundImage: `url(${background})` }}>
      {/* TopBar: ไม่ยุ่งโค้ดภายใน, ส่งเฉพาะ labels ไปแสดง */}
      <TopBar
        searchText={searchText}
        setSearchText={setSearchText}
        categories={CATEGORY_OPTIONS.map((o) => o.label)}
        onFiltersChange={setFilters}
      />

      <div className="home-content">
        {/* แผ่นใส: โฆษณา + หมวดหมู่ */}
        <div className="main-content-box">
          <div className="hero-grid">
            <div className="ad-image">
              <img src={adBanner} alt="แบนเนอร์สินค้า" />
            </div>

            <div className="category-compact">
              {CATEGORY_OPTIONS.filter((o) => o.value !== 'all').map((cat) => (
                <button
                  key={cat.value}
                  className="cat-item"
                  onClick={() => heroPickCategory(cat.value)}
                  title={cat.label}
                >
                  <img className="cat-bubble" src={cat.icon} alt={cat.label} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* โซนสินค้า (อยู่นอกแผ่นใส) */}
        <section ref={productRef} className="products-section">
          <h3 className="products-title">
            สินค้า{filters.category && filters.category !== 'ทั้งหมด' ? ` - ${filters.category}` : ''}
          </h3>

          <ProductGrid
            items={filtered}
            getQty={(id) => getQty(id)}
            onInc={inc}
            onDec={dec}
          />
        </section>
      </div>
    </div>
  );
}
