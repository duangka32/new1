import React, { useState, useEffect } from 'react';
import './AddProduct.css';
import { MdAddPhotoAlternate } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editProduct = location.state?.product || null;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // สำหรับอัปโหลดในอนาคต

  // โหลดข้อมูลสินค้าหากเป็นโหมดแก้ไข
  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name || '');
      setPrice(editProduct.price || '');
      setVolume(editProduct.volume || '');
      setCategory(editProduct.category || '');
      setDescription(editProduct.description || '');
      setImagePreview(editProduct.image || null); // แสดงรูป preview เดิม
    }
  }, [editProduct]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file); // เก็บไฟล์จริงไว้สำหรับอัปโหลด
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    document.getElementById('fileInput').value = null;
  };

  const handleSubmit = () => {
    if (!name || !price || !volume || !category || (!imagePreview && !imageFile)) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const productData = {
      name,
      price,
      volume,
      category,
      description,
      image: imagePreview, // ใช้ imagePreview สำหรับตอนนี้ (ในอนาคตให้แทนด้วย URL จาก Storage)
    };

    if (editProduct) {
      console.log('📦 อัปเดตสินค้า:', productData);
      // TODO: ส่งคำสั่งไป backend หรือ Firestore เพื่ออัปเดต
    } else {
      console.log('📥 เพิ่มสินค้าใหม่:', productData);
      // TODO: ส่งคำสั่งไป backend หรือ Firestore เพื่อเพิ่ม
    }

    navigate('/productStock');
  };

  return (
    <div className="add-product-container">
      <div className="header-bar">
        <h2>{editProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h2>
        <button className="to-stock-button" onClick={() => navigate('/productStock')}>
          กลับไปคลังสินค้า
        </button>
      </div>

      <label>ชื่อ</label>
      <input
        type="text"
        placeholder="ชื่อสินค้า"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>รูปสินค้า</label>
      <div className="image-upload" onClick={() => !imagePreview && document.getElementById('fileInput').click()}>
        {imagePreview ? (
          <div className="image-preview-wrapper">
            <img src={imagePreview} alt="preview" className="preview-image" />
            <button className="remove-image-button" onClick={handleRemoveImage} type="button">
              <FaTrashAlt />
            </button>
          </div>
        ) : (
          <MdAddPhotoAlternate size={60} color="#666" />
        )}
      </div>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />

      <label>ราคาสินค้า</label>
      <input
        type="number"
        placeholder="ราคาสินค้า"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <label>ปริมาณ</label>
      <input
        type="text"
        placeholder="เช่น 1 ลิตร, 500 กรัม"
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
      />

      <label>หมวดหมู่</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">กรุณาเลือกหมวดหมู่สินค้า</option>
        <option value="food">ผลิตภัณฑ์อาหาร</option>
        <option value="drink">เครื่องดื่ม</option>
        <option value="household">ของใช้ในครัวเรือน</option>
        <option value="medicine">ยาสามัญ</option>
      </select>

      <label>รายละเอียดเพิ่มเติมของสินค้า</label>
      <textarea
        placeholder="อธิบายลักษณะ/จุดเด่นของสินค้า..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button className="save-button" onClick={handleSubmit}>
        {editProduct ? 'บันทึกการแก้ไข' : 'บันทึกรายการสินค้า'}
      </button>
    </div>
  );
};

export default AddProduct;
