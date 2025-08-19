import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/Login';
import Home from './Pages/Home'; 
import ProfileAdmin from './Pages/PagesAdmin/ProfileAdmin';
import AddProduct from './Pages/PagesAdmin/AddProduct';
import ProductStock from './Pages/PagesAdmin/ProductStock';
import ProductDetail from './Pages/PagesAdmin/ProductDetail';
import CategoryPage from './Components/Category/CategoryPage';
import Cart from './Pages/Cart';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profileAdmin" element={<ProfileAdmin />} />
        <Route path="/addProduct" element={<AddProduct />} />
        <Route path="/productStock" element={<ProductStock />} />
        <Route path="/productDetail" element={<ProductDetail />} />
        <Route path="/category/:name" element={<CategoryPage />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  );
}

export default App;
