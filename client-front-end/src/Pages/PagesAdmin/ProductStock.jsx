import React, { useState } from 'react';
import './ProductStock.css';
import { MdDelete, MdModeEdit, MdVisibility, MdVisibilityOff, MdAddPhotoAlternate } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'ชื่อ',
      category: 'หมวดหมู่',
      price: 0,
      image: null,
      visible: true,
    },
    {
      id: 2,
      name: 'ชื่อ',
      category: 'หมวดหมู่',
      price: 0,
      image: null,
      visible: false,
    },
  ]);

  const toggleVisibility = (id) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, visible: !p.visible } : p
    ));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="page-wrapper">
      <div className="page-content-box">

        <div className="product-stock-top-bar">
          <input type="text" placeholder="ค้นหา..." />
          <button className="add-button" onClick={() => navigate('/addproduct')}>
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
              <th>เปิด/ปิด</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt="product"
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '5px' }}
                    />
                  ) : (
                    <MdAddPhotoAlternate size={30} color="#666" />
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price.toFixed(2)}</td>
                <td>
                  {product.visible ? (
                    <MdVisibility
                      onClick={() => toggleVisibility(product.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <MdVisibilityOff
                      onClick={() => toggleVisibility(product.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </td>
                <td>
                  <MdModeEdit
                    style={{ marginRight: 8, cursor: 'pointer' }}
                    onClick={() => navigate('/addProduct', { state: { product } })}
                  />

                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default Inventory;
