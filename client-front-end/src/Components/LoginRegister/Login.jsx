import React, { useState } from 'react';
import './LoginRegister.css';
import { FaUser, FaUnlockAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { auth, db } from '../../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [action, setAction] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("กรุณากรอกเบอร์โทรให้ถูกต้อง (ตัวเลข 10 หลัก)");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        phone,
        role: "user" // ✅ เพิ่ม role เพื่อให้ Firestore Rules ยอมให้ user CRUD
      });

      alert('สมัครสมาชิกสำเร็จ!');
      setEmail('');
      setPassword('');
      setUsername('');
      setPhone('');
      setAction('');
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('เข้าสู่ระบบสำเร็จ!');
      navigate('/home');
    } catch (error) {
      alert('เข้าสู่ระบบล้มเหลว: ' + error.message);
    }
  };

  const registerLink = (e) => {
    e.preventDefault();
    setAction('active');
  };

  const loginLink = (e) => {
    e.preventDefault();
    setAction('');
  };

  return (
    <div className={`wrapper ${action}`}>
      {/* Login Form */}
      <div className='form-box login'>
        <form onSubmit={handleLogin}>
          <h1>เข้าสู่ระบบ</h1>
          <div className="input-box">
            <span className="icon"><FaUser /></span>
            <input type="text" placeholder="อีเมล" required onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-box">
            <span className="icon"><FaUnlockAlt /></span>
            <input type="password" placeholder="รหัสผ่าน" required onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">เข้าสู่ระบบ</button>
          <div className="register-link">
            <p>ไม่มีบัญชีผู้ใช้ <a href="#" onClick={registerLink}>สมัครสมาชิก</a></p>
          </div>
        </form>
      </div>

      {/* Register Form */}
      <div className='form-box register'>
        <form onSubmit={handleRegister}>
          <h1>สมัครสมาชิก</h1>
          <div className="input-box">
            <span className="icon"><FaUser /></span>
            <input type="text" placeholder="ชื่อผู้ใช้" required onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="input-box">
            <span className="icon"><FaEnvelope /></span>
            <input type="text" placeholder="อีเมล" required onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-box">
            <span className="icon"><FaPhone /></span>
            <input type="text" placeholder="เบอร์โทร" required onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="input-box">
            <span className="icon"><FaUnlockAlt /></span>
            <input type="password" placeholder="รหัสผ่าน" required onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">ยืนยัน</button>
          <div className="register-link">
            <p>มีบัญชีอยู่แล้ว <a href="#" onClick={loginLink}>เข้าสู่ระบบ</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
