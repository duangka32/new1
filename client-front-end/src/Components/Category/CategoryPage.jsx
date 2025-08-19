import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../../Pages/TopBar'

import background from '../Assets/background.jpg';
import './CategoryPage.css';



const CategoryPage = () => {
  const { name } = useParams();
  const [searchText, setSearchText] = useState('');
 
  return (
    <div className="category-page" style={{ backgroundImage: `url(${background})` }}>
      <TopBar searchText={searchText} setSearchText={setSearchText} />

      <div className="category-box">
        <div className="category-header">
          <h2>{decodeCategoryName(name)}</h2>
         
        </div>

        {/* 🔻 พื้นที่สินค้าในหมวดหมู่นี้ */}
        <div className="category-content">
          {/* <ProductCard ... /> */}
          <p style={{ color: '#777' }}>[แสดงสินค้าหมวดหมู่ "{decodeCategoryName(name)}" ที่นี่]</p>
        </div>
      </div>
    </div>
  );
};

// ✅ ใช้แสดงชื่อหมวดหมู่ให้สวยงาม
const decodeCategoryName = (key) => {
  const map = {
    kitchen: 'ของใช้ในครัวเรือน',
    food: 'ผลิตภัณฑ์อาหาร',
    drink: 'เครื่องดื่ม',
    medicine: 'ยาสามัญ',
  };
  return map[key] || key;
};

export default CategoryPage;