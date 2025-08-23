// src/utils/cart.js
const CART_KEY = 'cart:v1';

export const readCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '{}'); }
  catch { return {}; }
};

export const writeCart = (cartObj) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cartObj));
  window.dispatchEvent(new Event('cart:updated')); // แจ้งทุกหน้า
};

export const addItem = (item, delta = 1) => {
  const cart = readCart();
  const id = String(item.id);
  const prev = cart[id]?.qty || 0;

  // ✅ ถ้ายังไม่มีในตะกร้า ให้เริ่มที่ 1
  const next = prev === 0 ? 1 : Math.max(0, prev + delta);

  if (next === 0) {
    delete cart[id];
  } else {
    cart[id] = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || '',
      qty: next,
    };
  }
  writeCart(cart);
};


export const getQty = (id) => (readCart()[String(id)]?.qty || 0);
