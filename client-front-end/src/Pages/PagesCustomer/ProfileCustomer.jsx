import React, { useState } from 'react';

import './ProfileCustomer.css';           // จะใช้ CSS เดียวกับ admin หรือแยกไฟล์ก็ได้
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const ProfileCustomer = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  return (
    <div className="home-wrapper">


      <div className="profile-container">
        <div className="profile-box">
          <FaUserCircle size={100} />

          <label>ชื่อผู้ใช้</label>
          <input type="text" placeholder="ชื่อผู้ใช้" disabled />

          <label>อีเมล</label>
          <input type="email" placeholder="you@example.com" disabled />

          <label>เบอร์โทร</label>
          <input type="tel" placeholder="012-345-6789" disabled />

          <div className="profile-buttons">
            {/* ลูกค้า: มีแค่ การสั่งซื้อ + ออกจากระบบ */}
            <button className="btn blue" onClick={() => navigate('/orders')}>
              <span className="icon-text">
                <span>การสั่งซื้อ</span>
              </span>
            </button>

            <button className="btn logout">ออกจากระบบ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCustomer;
