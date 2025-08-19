import React, { useState } from 'react';
import TopBar from '../../Pages/TopBar'; 
import './ProfileAdmin.css';
import { FaUserCircle } from "react-icons/fa";
import { MdEditDocument } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


const ProfileAdmin = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  return (
    <div className="home-wrapper">
      <TopBar searchText={searchText} setSearchText={setSearchText} />

      <div className="profile-container">
        <div className="profile-box">
          <FaUserCircle size={100} />

          <label>ชื่อผู้ใช้</label>
          <input type="text" placeholder="ชื่อผู้ใช้" />

          <label>อีเมล</label>
          <input type="email" placeholder="admin@example.com" />

          <label>เบอร์โทร</label>
          <input type="tel" placeholder="012-345-6789" />

          <div className="profile-buttons">
            <button className="btn blue" onClick={() => navigate('/addProduct')}>
              <span className="icon-text">
                <FaPlus color="white" />
                <span>เพิ่มรายการสินค้า</span>
              </span>
            </button>

             <button className="btn blue" onClick={() => navigate('/productStock')}>
              <span className="icon-text">
                <MdEditDocument size={18} />
                <span>คลังสินค้า</span>
              </span>
            </button>

            <button className="btn logout">ออกจากระบบ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;
