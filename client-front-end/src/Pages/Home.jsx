// Home.jsx
import React, { useState } from 'react'; 
import './Home.css';
import background from '../Components/Assets/background.jpg';
import adBanner from '../Components/Assets/orange2.jpg';
import kitchenIcon from '../Components/Assets/kitchenIcon.png';
import foodIcon from '../Components/Assets/foodIcon.png';
import drinkIcon from '../Components/Assets/drinkIcon.png';
import medicineIcon from '../Components/Assets/medicineIcon.png';
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";

const categories = [
  { name: 'ของใช้ในครัวเรือน', icon: kitchenIcon, key: 'kitchen' },
  { name: 'ผลิตภัณฑ์อาหาร', icon: foodIcon, key: 'food' },
  { name: 'เครื่องดื่ม', icon: drinkIcon, key: 'drink' },
  { name: 'ยาสามัญ', icon: medicineIcon, key: 'medicine' },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  return (
    <div className="home-wrapper" style={{ backgroundImage: `url(${background})` }}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="left-bar">
          <div className="profile-icon" onClick={() => navigate('/profileAdmin')}>
            <FaUserCircle size={60} color="white" />
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button className="clear-btn" onClick={() => setSearchText('')}>✖</button>
          )}
          <button className="search-btn">🔍</button>
        </div>

        <div className="right-bar">
          <div className="cart-icon" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
            <CiShoppingCart size={57} color="white" />
          </div>

          <div className="notification-icon">🔔</div>
        </div>
      </div>

      {/* Content */}
      <div className="home-content">
        <div className="main-content-box">
          {/* Banner */}
          <div className="ad-image">
            <img src={adBanner} alt="แบนเนอร์สินค้า" />
          </div>

          {/* หมวดหมู่ */}
          <div className="category-grid">
            {categories.map((cat) => (
              <div
                className="category-item"
                key={cat.key}
                onClick={() => navigate(`/category/${cat.key}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={cat.icon} alt={cat.name} className="category-icon" />
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
