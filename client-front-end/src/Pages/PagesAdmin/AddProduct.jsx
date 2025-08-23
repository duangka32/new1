// src/Pages/PagesAdmin/AddProduct.jsx
import React, { useState, useEffect, useRef } from 'react';
import './AddProduct.css';
import { MdAddPhotoAlternate } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';

import { upsertProduct } from '../../utils/products';
import { resizeImage } from '../../utils/image';

// ✅ เพิ่มหน่วยชิ้น + หน่วยยอดนิยมอื่น ๆ
const UNIT_LABELS = {
  g: 'กรัม',
  kg: 'กิโลกรัม',
  ml: 'มิลลิลิตร',
  l: 'ลิตร',
  pc: 'ชิ้น',
  pack: 'แพ็ค',
  box: 'กล่อง',
  bottle: 'ขวด',
};

function parseVolume(str = '') {
  // ดึงตัวเลข + เดาหน่วยจากข้อความเดิม เช่น "4 ชิ้น", "500 กรัม", "1 ลิตร"
  const raw = String(str).trim();
  if (!raw) return { value: '', unit: 'g' };

  const numMatch = raw.match(/[\d.,]+/);
  const value = numMatch ? numMatch[0].replace(',', '') : '';

  const lower = raw.toLowerCase();

  // ✅ ตรวจคำไทย+อังกฤษยอดนิยม
  if (/(ชิ้น|pcs?\b)/.test(lower)) return { value, unit: 'pc' };
  if (/(แพ็ค|pack\b)/.test(lower))  return { value, unit: 'pack' };
  if (/(กล่อง|box\b)/.test(lower))  return { value, unit: 'box' };
  if (/(ขวด|bottle\b)/.test(lower))  return { value, unit: 'bottle' };

  if (/(กิโล|kg\b)/.test(lower))     return { value, unit: 'kg' };
  if (/(ลิตร|\bl\b)/.test(lower))    return { value, unit: 'l' };
  if (/(มิลลิ|ml\b)/.test(lower))    return { value, unit: 'ml' };
  if (/(กรัม|\bg\b)/.test(lower))    return { value, unit: 'g' };

  // ดีฟอลต์เป็นกรัมถ้าจับอะไรไม่ได้
  return { value, unit: 'g' };
}

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editProduct = location.state?.product || null;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // ⬇️ ปริมาณ: แยก "ค่า" + "หน่วย"
  const [volumeValue, setVolumeValue] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('g');

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [visible, setVisible] = useState(true);

  // สต็อก: เริ่มว่าง + placeholder เทา (ไม่ต้องลบ 0 เอง)
  const [stock, setStock] = useState('');

  // รูปภาพ
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState(null);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name ?? '');
      setPrice(String(editProduct.price ?? ''));
      const pv = parseVolume(editProduct.volume);
      setVolumeValue(pv.value);
      setVolumeUnit(pv.unit);
      setCategory(editProduct.category ?? '');
      setDescription(editProduct.description ?? '');
      setImagePreview(editProduct.image ?? null);
      setVisible(editProduct.visible ?? true);
      setStock(
        typeof editProduct.stock === 'number'
          ? String(Math.max(0, Math.floor(editProduct.stock)))
          : ''
      );
    } else {
      setStock('');
    }
  }, [editProduct]);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  const fileToDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    const url = URL.createObjectURL(file);
    setPreviewObjectUrl(url);
    setImagePreview(url);
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewObjectUrl(null);
    setImagePreview(null);
    setImageFile(null);
    const el = document.getElementById('fileInput');
    if (el) el.value = null;
  };

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'กรุณากรอกชื่อสินค้า';
    if (price === '' || Number(price) < 0) next.price = 'กรุณากรอกราคาให้ถูกต้อง';

    // ปริมาณต้องมีค่าเลข > 0 และเลือกหน่วยได้
    if (volumeValue === '' || Number(volumeValue) <= 0) next.volume = 'กรุณากรอกปริมาณเป็นตัวเลขมากกว่า 0';
    if (!volumeUnit || !UNIT_LABELS[volumeUnit]) next.volumeUnit = 'กรุณาเลือกหน่วย';

    if (!category) next.category = 'กรุณาเลือกหมวดหมู่';
    if (!imagePreview && !imageFile) next.image = 'กรุณาเลือกรูปสินค้า';

    // สต็อกต้องเป็นจำนวนเต็ม >= 0
    const stockNum = Math.floor(Number(stock));
    if (stock === '' || Number.isNaN(stockNum) || stockNum < 0) {
      next.stock = 'กรุณากรอกจำนวนสต็อกเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (saving || submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setSaving(true);

    try {
      // ย่อรูป (ถ้ามี)
      let image = imagePreview || '';
      if (imageFile) {
        try {
          image = await resizeImage(imageFile, 800, 800);
        } catch {
          image = await fileToDataURL(imageFile);
        }
      }

      // รวมปริมาณเป็นข้อความ เช่น "4 ชิ้น", "500 กรัม"
      const volumeText = `${Number(volumeValue)} ${UNIT_LABELS[volumeUnit]}`;

      const payload = {
        ...(editProduct?.id ? { id: editProduct.id } : {}),
        name: name.trim(),
        price: Number(price) || 0,
        volume: volumeText,
        category, // 'food' | 'drink' | 'household' | 'medicine'
        description: (description || '').trim(),
        image,
        visible: Boolean(visible),
        stock: Math.max(0, Math.floor(Number(stock) || 0)),
      };

      const saved = await upsertProduct(payload);
      if (!saved || !saved.id) throw new Error('save failed: no id returned');

      // ✅ แจ้งสำเร็จ (ไม่เด้งหน้า)
      alert('บันทึกสำเร็จ!');

      // ถ้าเป็น “เพิ่มใหม่” เคลียร์ฟอร์มให้กรอกต่อได้ทันที
      if (!editProduct) {
        setName('');
        setPrice('');
        setVolumeValue('');
        setVolumeUnit('pc'); // แนะนำให้เดฟอลต์เป็น “ชิ้น” ก็ได้
        setCategory('');
        setDescription('');
        setImagePreview(null);
        setImageFile(null);
        setPreviewObjectUrl(null);
        setStock('');
        setVisible(true);
        const el = document.getElementById('fileInput');
        if (el) el.value = null;
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="add-product-container">
      <div className="header-bar">
        <h2>{editProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h2>
        <button
          className="to-stock-button"
          onClick={() => navigate('/productStock')}
          type="button"
        >
          กลับไปคลังสินค้า
        </button>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <label>ชื่อ</label>
        <input
          type="text"
          placeholder="ชื่อสินค้า"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name && <div className="form-error">{errors.name}</div>}

        <label>รูปสินค้า</label>
        <div
          className="image-upload"
          onClick={() => !imagePreview && document.getElementById('fileInput')?.click()}
          aria-invalid={!!errors.image}
        >
          {imagePreview ? (
            <div className="image-preview-wrapper">
              <img src={imagePreview} alt="preview" className="preview-image" />
              <button
                className="remove-image-button"
                onClick={handleRemoveImage}
                type="button"
                title="ลบรูป"
              >
                <FaTrashAlt />
              </button>
            </div>
          ) : (
            <MdAddPhotoAlternate size={60} color="#666" />
          )}
        </div>
        {errors.image && <div className="form-error">{errors.image}</div>}

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
          placeholder="เช่น 79"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="1"
          aria-invalid={!!errors.price}
          onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
        />
        {errors.price && <div className="form-error">{errors.price}</div>}

        {/* ✅ ปริมาณ/หน่วย — รองรับ 'ชิ้น' ด้วย */}
        <label>ปริมาณ / หน่วย</label>
        <div className="row-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            type="number"
            placeholder="เช่น 4"
            value={volumeValue}
            onChange={(e) => setVolumeValue(e.target.value)}
            min="0"
            step="any"
            aria-invalid={!!errors.volume}
            onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
          />
          <select
            value={volumeUnit}
            onChange={(e) => setVolumeUnit(e.target.value)}
            aria-invalid={!!errors.volumeUnit}
          >
            <option value="pc">ชิ้น (pcs)</option>
            <option value="pack">แพ็ค</option>
            <option value="box">กล่อง</option>
            <option value="bottle">ขวด</option>
            <option value="g">กรัม (g)</option>
            <option value="kg">กิโลกรัม (kg)</option>
            <option value="ml">มิลลิลิตร (ml)</option>
            <option value="l">ลิตร (L)</option>
          </select>
        </div>
        {(errors.volume || errors.volumeUnit) && (
          <div className="form-error">{errors.volume || errors.volumeUnit}</div>
        )}

        <label>หมวดหมู่</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-invalid={!!errors.category}
        >
          <option value="">กรุณาเลือกหมวดหมู่สินค้า</option>
          <option value="food">ผลิตภัณฑ์อาหาร</option>
          <option value="drink">เครื่องดื่ม</option>
          <option value="household">ของใช้ในครัวเรือน</option>
          <option value="medicine">ยาสามัญ</option>
        </select>
        {errors.category && <div className="form-error">{errors.category}</div>}

        <label>จำนวนสต็อก</label>
        <input
          type="number"
          placeholder="เช่น 10"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          aria-invalid={!!errors.stock}
          onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
        />
        {errors.stock && <div className="form-error">{errors.stock}</div>}

        <label>รายละเอียดเพิ่มเติมของสินค้า</label>
        <textarea
          placeholder="อธิบายลักษณะ/จุดเด่นของสินค้า..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="visible-row">
          <input id="visible" type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          <label htmlFor="visible">แสดงสินค้านี้ในหน้าร้าน</label>
        </div>

        <button className="save-button" type="submit" disabled={saving}>
          {saving ? 'กำลังบันทึก...' : editProduct ? 'บันทึกการแก้ไข' : 'บันทึกรายการสินค้า'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
