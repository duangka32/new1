// src/utils/orders.js
// =====================================================
//  Orders utils: สร้าง/แก้ไขออเดอร์ + จัดการสต็อกสินค้า
//  นโยบาย: ตัดสต็อกทันทีตอนสร้างออเดอร์ (ลูกค้ากดยืนยันสั่งซื้อ)
//          ถ้าออเดอร์ถูกยกเลิก -> คืนสต็อกกลับ
// =====================================================

import {
  getProductById as getProduct,
  hasEnoughStock,
  adjustStock,
} from "./products";

export const STORAGE_KEY = "orders";
export const ORDERS_UPDATED_EVENT = "orders:updated";

export const ORDER_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "รอดำเนินการ",
  [ORDER_STATUS.ACCEPTED]: "รับออเดอร์แล้ว",
  [ORDER_STATUS.CANCELLED]: "ยกเลิกแล้ว",
};

// ---------- Core IO ----------

export const readOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const writeOrders = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders || []));
  // แจ้งหน้า/แท็บอื่น ๆ ให้รีเฟรช
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
};

// ---------- Helpers ----------

const nextOrderId = () => {
  const list = readOrders();
  const maxId = list.reduce((m, o) => (typeof o.id === "number" && o.id > m ? o.id : m), 0);
  return maxId + 1;
};

const isValidItem = (it) =>
  it &&
  typeof it.id !== "undefined" &&
  typeof it.name === "string" &&
  typeof it.price === "number" &&
  typeof it.qty === "number" &&
  it.qty > 0;

const normQty = (q) => Math.max(0, Math.floor(Number(q) || 0));

/**
 * ตรวจว่าสินค้าในออเดอร์มีสต็อกเพียงพอ
 * ถ้าไม่พอ -> throw error พร้อมบอกรายการที่ขาด
 */
function assertStockEnough(items) {
  for (const it of items) {
    const pid = it.id;
    const qty = normQty(it.qty);
    const p = getProduct(pid);
    if (!p) {
      throw new Error(`ไม่พบสินค้า (id=${pid})`);
    }
    if (!hasEnoughStock(pid, qty)) {
      const remain = Math.max(0, Number(p.stock || 0));
      throw new Error(`สต็อกของ "${p.name || "สินค้า"}" ไม่พอ (คงเหลือ ${remain}, ต้องการ ${qty})`);
    }
  }
}

/**
 * ตัดสต็อกตามรายการ
 */
function lockStock(items) {
  for (const it of items) {
    adjustStock(it.id, -normQty(it.qty));
  }
}

/**
 * คืนสต็อกตามรายการ
 */
function unlockStock(items) {
  for (const it of items) {
    adjustStock(it.id, +normQty(it.qty));
  }
}

// ---------- Public APIs ----------

/**
 * สร้างออเดอร์ใหม่และบันทึก (ตัดสต็อกทันที)
 * @param {{customerName?: string, items: Array<{id:any,name:string,price:number,qty:number}>}} param0
 * @returns {object} order
 */
export const createOrder = ({ customerName = "ฉัน", items }) => {
  const list = (Array.isArray(items) ? items : []).filter(isValidItem);
  if (list.length === 0) {
    throw new Error("createOrder: items ไม่ถูกต้องหรือว่างเปล่า");
  }

  // 1) ตรวจสต็อกก่อน
  assertStockEnough(list);

  // 2) ตัดสต็อก
  lockStock(list);

  const total = list.reduce((s, it) => s + it.price * normQty(it.qty), 0);

  const order = {
    id: nextOrderId(),
    customerName,
    total,
    status: ORDER_STATUS.PENDING,
    items: list.map(({ id, name, price, qty }) => ({ id, name, price, qty: normQty(qty) })),
    createdAt: Date.now(),

    // ธงสำหรับจัดการสต็อกตอนเปลี่ยนสถานะ
    stockLocked: true, // ถูกตัดแล้วตอนสร้าง
  };

  const all = readOrders();
  all.unshift(order);
  writeOrders(all);
  return order;
};

/**
 * ตัวช่วย: placeOrder(items, customerName) -> createOrder(...)
 */
export const placeOrder = (items, customerName = "ฉัน") =>
  createOrder({ customerName, items });

/**
 * คืนรายการออเดอร์ตามชื่อลูกค้า (ถ้าไม่มีระบบ login)
 */
export const getOrdersByCustomer = (customerName = "ฉัน") => {
  const all = readOrders();
  return all.filter((o) => o.customerName === customerName);
};

/**
 * คืนออเดอร์ตาม id
 */
export const getOrderById = (id) => {
  const all = readOrders();
  return all.find((o) => String(o.id) === String(id)) || null;
};

/**
 * เปลี่ยนสถานะออเดอร์ (ใช้ใน admin/customer)
 *  - ถ้าเปลี่ยนเป็น CANCELLED และเคยตัดสต็อกไว้ -> คืนสต็อก
 *  - ถ้าเปลี่ยนจาก CANCELLED -> PENDING และยังไม่ได้ล็อกสต็อก -> ตรวจแล้วตัดสต็อกใหม่
 * @param {number} id
 * @param {'accepted'|'cancelled'|'pending'} status
 */
export const setOrderStatus = (id, status) => {
  const allowed = new Set(Object.values(ORDER_STATUS));
  if (!allowed.has(status)) throw new Error("setOrderStatus: status ไม่ถูกต้อง");

  const all = readOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  const current = all[idx];

  // จัดการสต็อกตามการเปลี่ยนแปลงสถานะ
  if (status === ORDER_STATUS.CANCELLED && current.stockLocked) {
    // ออเดอร์นี้ถูกตัดสต็อกไว้ -> คืนกลับ
    unlockStock(current.items);
    current.stockLocked = false;
  }

  if (status === ORDER_STATUS.PENDING && !current.stockLocked) {
    // เคยคืนสต็อกไปแล้ว แล้วดันกลับมา pending อีกรอบ -> ต้องล็อกสต็อกใหม่
    assertStockEnough(current.items);
    lockStock(current.items);
    current.stockLocked = true;
  }

  // เปลี่ยนสถานะ
  const updated = { ...current, status };
  const next = [...all];
  next[idx] = updated;

  writeOrders(next);
  return updated;
};

/**
 * อัปเดตฟิลด์บางส่วนของออเดอร์ (ไม่ยุ่งกับสต็อก)
 * @param {number} id 
 * @param {Partial<{customerName:string,total:number,status:string,items:any[]}>} patch 
 */
export const updateOrder = (id, patch = {}) => {
  const all = readOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  const updated = { ...all[idx], ...patch };
  const next = [...all];
  next[idx] = updated;

  writeOrders(next);
  return updated;
};

/**
 * ลบออเดอร์ (สำหรับงานทดสอบ/รีเซ็ต)
 * หมายเหตุ: ไม่คืนสต็อกอัตโนมัติ—ใช้ setOrderStatus(id, 'cancelled') ก่อนถ้าต้องการคืน
 */
export const removeOrder = (id) => {
  const all = readOrders().filter((o) => o.id !== id);
  writeOrders(all);
};

/**
 * ลบทุกออเดอร์ (สำหรับ dev tools)
 */
export const clearOrders = () => {
  writeOrders([]);
};
