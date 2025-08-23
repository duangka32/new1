import React, { useState, useEffect } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { CiShoppingCart } from "react-icons/ci";
import { MdFilterList, MdClear, MdHome } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const TopBar = ({ searchText, setSearchText, onFiltersChange, categories }) => {
  const navigate = useNavigate();

  // ===== Local fallbacks =====
  const [internalSearch, setInternalSearch] = useState(searchText ?? "");
  useEffect(() => {
    // ถ้า parent เปลี่ยนค่า searchText ให้ sync กับ state ภายใน
    if (typeof searchText === "string") setInternalSearch(searchText);
  }, [searchText]);

  const sText = typeof searchText === "string" ? searchText : internalSearch;
  const setST =
    typeof setSearchText === "function" ? setSearchText : setInternalSearch;

  const notifyFilters =
    typeof onFiltersChange === "function" ? onFiltersChange : () => {};

  // ===== Filters =====
  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState({
    category: 'ทั้งหมด',
    priceMin: '',
    priceMax: '',
    sort: 'rel',
  });

  const catOptions =
    categories || ['ทั้งหมด','ของใช้ในครัวเรือน','ผลิตภัณฑ์อาหาร','เครื่องดื่ม','ยาสามัญ'];

  const updateFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    const cleared = { category: 'ทั้งหมด', priceMin: '', priceMax: '', sort: 'rel' };
    setFilters(cleared);
    notifyFilters(cleared);
  };

  const applyFilters = () => {
    notifyFilters(filters);
    setOpenFilter(false);
  };

  return (
    <>
      {/* ===== TopBar (fixed) ===== */}
      <div className="top-bar">
        <div className="left-bar">
          <button
            className="profile-icon"
            onClick={() => navigate('/profileAdmin')}
            aria-label="โปรไฟล์"
            title="โปรไฟล์"
            style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
          >
            <FaUserCircle size={60} color="white" />
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={sText}
            onChange={(e) => setST(e.target.value)}
          />
          {sText && (
            <button
              className="clear-btn"
              onClick={() => setST('')}
              aria-label="ล้างค้นหา"
            >
              ✖
            </button>
          )}
          <button className="search-btn" aria-label="ค้นหา">🔍</button>
        </div>

        <button
          className="filter-btn"
          onClick={() => setOpenFilter(v => !v)}
          aria-expanded={openFilter}
          aria-label="ตัวกรองสินค้า"
          title="ตัวกรอง"
        >
          <MdFilterList size={20} />
          <span className="filter-text">ตัวกรอง</span>
        </button>

        <div className="right-bar">
          <button
            className="cart-icon"
            onClick={() => navigate('/cart')}
            aria-label="ตะกร้าสินค้า"
            title="ตะกร้าสินค้า"
            style={{ background: 'transparent', border: 0 }}
          >
            <CiShoppingCart size={57} color="white" />
          </button>
          <button
            className="notification-icon"
            onClick={() => navigate('/notifications')}
            aria-label="การแจ้งเตือน"
            title="การแจ้งเตือน"
            style={{ background: 'transparent', border: 0 }}
          >
            🔔
          </button>

          {/* ปุ่ม Home อยู่หลังการแจ้งเตือน */}
          <button
            className="home-btn"
            onClick={() => navigate('/home', { replace: true })}
            aria-label="หน้าหลัก"
            title="หน้าหลัก"
          >
            <MdHome size={40} />
          </button>
        </div>

        {openFilter && (
          <div className="filter-panel">
            <div className="filter-row">
              <label>หมวดหมู่</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-row two">
              <div className="filter-col">
                <label>ราคาต่ำสุด</label>
                <input
                  type="number"
                  min="0"
                  placeholder="เช่น 50"
                  value={filters.priceMin}
                  onChange={(e) => updateFilter('priceMin', e.target.value)}
                />
              </div>
              <div className="filter-col">
                <label>ราคาสูงสุด</label>
                <input
                  type="number"
                  min="0"
                  placeholder="เช่น 500"
                  value={filters.priceMax}
                  onChange={(e) => updateFilter('priceMax', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-row">
              <label>เรียงลำดับ</label>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                <option value="rel">แนะนำ</option>
                <option value="price_asc">ราคาต่ำ → สูง</option>
                <option value="price_desc">ราคาสูง → ต่ำ</option>
                <option value="newest">มาใหม่ล่าสุด</option>
              </select>
            </div>

            <div className="filter-actions">
              <button className="btn clear" onClick={clearFilters}>
                <MdClear size={18} />
                ล้างตัวกรอง
              </button>
              <button className="btn apply" onClick={applyFilters}>ใช้ตัวกรอง</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TopBar;
