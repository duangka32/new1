import React, { useState } from 'react';
import './LoginRegister.css';
import { FaUser, FaUnlockAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [action, setAction] = useState(''); // '' = login, 'active' = register
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
        email, username, phone, role: "user"
      });
      alert('สมัครสมาชิกสำเร็จ!');
      setEmail(''); setPassword(''); setUsername(''); setPhone('');
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
    // เคลียร์ฟิลด์เพื่อกันสับสน
    setPassword('');
  };

  const loginLink = (e) => {
    e.preventDefault();
    setAction('');
    // เคลียร์ฟิลด์เพื่อกันสับสน
    setPassword('');
  };

  return (
    // ✅ ครอบด้วย auth-page เพื่อจัดกลางทั้งแนวตั้ง/แนวนอน
    <div className="auth-page">
      <div className={`wrapper ${action}`}>
        {/* Login Form */}
        <div className='form-box login'>
          <form onSubmit={handleLogin} noValidate>
            <h1>เข้าสู่ระบบ</h1>

            <div className="input-box">
              <span className="icon"><FaUser /></span>
              <input
                type="email"
                placeholder="อีเมล"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-box">
              <span className="icon"><FaUnlockAlt /></span>
              <input
                type="password"
                placeholder="รหัสผ่าน"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit">เข้าสู่ระบบ</button>

            <div className="register-link">
              <p>
                ไม่มีบัญชีผู้ใช้{' '}
                <button type="button" onClick={registerLink} className="link-btn">
                  สมัครสมาชิก
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className='form-box register'>
          <form onSubmit={handleRegister} noValidate>
            <h1>สมัครสมาชิก</h1>

            <div className="input-box">
              <span className="icon"><FaUser /></span>
              <input
                type="text"
                placeholder="ชื่อผู้ใช้"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-box">
              <span className="icon"><FaEnvelope /></span>
              <input
                type="email"
                placeholder="อีเมล"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-box">
              <span className="icon"><FaPhone /></span>
              <input
                type="tel"
                placeholder="เบอร์โทร (10 หลัก)"
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="input-box">
              <span className="icon"><FaUnlockAlt /></span>
              <input
                type="password"
                placeholder="รหัสผ่าน"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit">ยืนยัน</button>

            <div className="register-link">
              <p>
                มีบัญชีอยู่แล้ว{' '}
                <button type="button" onClick={loginLink} className="link-btn">
                  เข้าสู่ระบบ
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
