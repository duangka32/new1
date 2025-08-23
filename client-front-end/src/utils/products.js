// src/utils/products.js
// ===================== พื้นฐาน =====================
export const STORAGE_KEY = 'products';
export const PRODUCTS_UPDATED_EVENT = 'products:updated';

// อ่านสินค้า (ทั้งหมด)
export function readProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('readProducts error:', e);
    return [];
  }
}

// เขียนสินค้า (ทั้งหมด) + broadcast event
export function writeProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
  } catch (e) {
    console.error('writeProducts error:', e);
  }
}

// หา product ตาม id
export function getProductById(id) {
  return readProducts().find((p) => String(p.id) === String(id)) || null;
}

// next id แบบ auto-increment
function nextId() {
  const list = readProducts();
  const maxId = list.reduce(
    (max, p) => (typeof p.id === 'number' && p.id > max ? p.id : max),
    0
  );
  return maxId + 1;
}

// ===================== helper แปลงค่าปลอดภัย =====================
const toNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const clampMin = (n, min = 0) => (n < min ? min : n);

// ทำความสะอาด/เติมค่า default ให้ product
function normalizeProduct(input) {
  const out = { ...input };

  // ชื่อ
  out.name = String(out.name || '').trim();

  // ราคาเป็นตัวเลข >= 0
  out.price = clampMin(toNumber(out.price, 0), 0);

  // stock เป็นจำนวนเต็ม >= 0
  const stockNum = Math.floor(toNumber(out.stock, 0));
  out.stock = clampMin(stockNum, 0);

  // flag แสดงผล
  out.visible = Boolean(out.visible ?? true);

  // category, image, description, volume คงไว้ตามเดิม
  if (out.category == null) out.category = '';
  if (out.image == null) out.image = '';
  if (out.description == null) out.description = '';
  if (out.volume == null) out.volume = '';

  return out;
}

// ===================== upsert (เพิ่ม/แก้ไข) =====================
export function upsertProduct(product) {
  if (!product || !product.name) {
    throw new Error('invalid product payload');
  }

  const list = readProducts();
  let saved;

  const normalized = normalizeProduct(product);

  if (normalized.id != null) {
    // โหมดแก้ไข
    const idx = list.findIndex((p) => String(p.id) === String(normalized.id));
    if (idx >= 0) {
      // รวมค่าเดิม + ใหม่ แล้ว normalize อีกรอบกันค่าผิดพลาด
      saved = normalizeProduct({ ...list[idx], ...normalized });
      list[idx] = saved;
    } else {
      saved = normalizeProduct({
        ...normalized,
        id: Number(normalized.id) || nextId(),
      });
      list.push(saved);
    }
  } else {
    // โหมดเพิ่มใหม่
    saved = normalizeProduct({ ...normalized, id: nextId() });
    list.push(saved);
  }

  writeProducts(list);
  return saved; // คืนค่า product ที่บันทึก
}

// ===================== สต็อกสินค้า =====================

// เช็กว่ามีสต็อกพอหรือไม่ (>= qty)
export function hasEnoughStock(productId, qty) {
  const p = getProductById(productId);
  if (!p) return false;
  const need = Math.floor(toNumber(qty, 0));
  return clampMin(Math.floor(toNumber(p.stock, 0)), 0) >= clampMin(need, 0);
}

// ปรับสต็อกด้วย delta (เช่น -3 เพื่อลด 3 ชิ้น) → คืนค่า stock ล่าสุด
export function adjustStock(productId, delta) {
  const list = readProducts();
  const idx = list.findIndex((p) => String(p.id) === String(productId));
  if (idx === -1) throw new Error('product not found');

  const current = clampMin(Math.floor(toNumber(list[idx].stock, 0)), 0);
  const next = clampMin(current + Math.floor(toNumber(delta, 0)), 0);

  list[idx].stock = next;
  writeProducts(list);
  return next;
}

// เซ็ตสต็อกเป็นค่าที่กำหนด → คืนค่า stock ล่าสุด
export function setProductStock(productId, newStock) {
  const list = readProducts();
  const idx = list.findIndex((p) => String(p.id) === String(productId));
  if (idx === -1) throw new Error('product not found');

  const next = clampMin(Math.floor(toNumber(newStock, 0)), 0);
  list[idx].stock = next;
  writeProducts(list);
  return next;
}

// ===================== อื่น ๆ ที่อาจสะดวกใช้ =====================

// คืนสินค้าทั้งหมด (alias)
export const getProducts = readProducts;
