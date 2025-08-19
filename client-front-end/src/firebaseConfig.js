// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzqNQofLFRA08iOTHrXR6EdbBr6uqye5Y",
  authDomain: "groceryshop-webapp-aedbd.firebaseapp.com",
  projectId: "groceryshop-webapp-aedbd",
  storageBucket: "groceryshop-webapp-aedbd.firebasestorage.app",
  messagingSenderId: "611689448415",
  appId: "1:611689448415:web:9fffa70cdc703e32ecfa6a"
};

// เริ่มการเชื่อมต่อ
const app = initializeApp(firebaseConfig);

// ส่งออกเพื่อใช้ในส่วนต่าง ๆ
export const db = getFirestore(app);
export const auth = getAuth(app);