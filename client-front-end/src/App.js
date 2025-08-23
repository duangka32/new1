import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginRegister from "./Components/LoginRegister/Login";
import Home from "./Pages/Home";
import ProfileAdmin from "./Pages/PagesAdmin/ProfileAdmin";
import ProfileCustomer from "./Pages/PagesCustomer/ProfileCustomer";
import AddProduct from "./Pages/PagesAdmin/AddProduct";
import ProductStock from "./Pages/PagesAdmin/ProductStock";
import ProductDetail from "./Pages/ProductDetail";
import CategoryPage from "./Components/Category/CategoryPage";
import Cart from "./Pages/Cart";
import Notification from "./Pages/Notification";
import OrderAdmin from "./Pages/PagesAdmin/OrderAdmin";
import OrderCustomer from "./Pages/PagesCustomer/OrderCustomer";
import OrderDetail from "./Pages/OrderDetail";
import AppShell from "./AppShell";

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า login ไม่ต้องมี TopBar */}
        <Route path="/" element={<LoginRegister />} />

        {/* ส่วนที่เหลือครอบด้วย AppShell */}
        <Route element={<AppShell />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profileAdmin" element={<ProfileAdmin />} />
          <Route path="/profile" element={<ProfileCustomer />} />
          <Route path="/addProduct" element={<AddProduct />} />
          <Route path="/productStock" element={<ProductStock />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/admin/orders" element={<OrderAdmin />} />
          <Route path="/orders" element={<OrderCustomer />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/admin/orders/:id" element={<OrderDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
