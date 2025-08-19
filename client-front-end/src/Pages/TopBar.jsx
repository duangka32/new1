import React from 'react';
import { FaUserCircle } from "react-icons/fa";
import { CiShoppingCart } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';

const TopBar = ({ searchText, setSearchText }) => {
  const navigate = useNavigate();

  return (
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
        <div className="cart-icon">
          <CiShoppingCart size={57} color="white" />
        </div>
        <div className="notification-icon">🔔</div>
      </div>
    </div>
  );
};

export default TopBar;
