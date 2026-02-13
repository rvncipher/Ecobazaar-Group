import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import SellerOrders from './pages/SellerOrders'
import MonthlyReport from './pages/MonthlyReport'
import SellerReport from './pages/SellerReport'
import SellerDashboard from './features/seller/SellerDashboard'
import ProductForm from './features/seller/ProductForm'
import AdminDashboard from './features/admin/AdminDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/monthly-report" element={<MonthlyReport />} />
        <Route path="/seller/report" element={<SellerReport />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/product/new" element={<ProductForm />} />
        <Route path="/seller/product/edit/:id" element={<ProductForm />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
