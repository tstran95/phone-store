import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import PaymentResult from './pages/PaymentResult'
import SearchResults from './pages/SearchResults'
import Wishlist from './pages/Wishlist'
import Notifications from './pages/Notifications'

// Admin imports
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCategories from './pages/admin/AdminCategories'
import AdminBanners from './pages/admin/AdminBanners'

function App() {
  return (
    <Routes>
      {/* Main routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="danh-muc/:slug" element={<ProductList />} />
        <Route path="tim-kiem" element={<SearchResults />} />
        <Route path="san-pham/:slug" element={<ProductDetail />} />
        <Route path="gio-hang" element={<Cart />} />
        <Route path="thanh-toan" element={<Checkout />} />
        <Route path="dang-nhap" element={<Login />} />
        <Route path="dang-ky" element={<Register />} />
        <Route path="quen-mat-khau" element={<ForgotPassword />} />
        <Route path="dat-lai-mat-khau" element={<ResetPassword />} />
        <Route path="tai-khoan" element={<Profile />} />
        <Route path="don-hang" element={<Orders />} />
        <Route path="don-hang/:orderNumber" element={<OrderDetail />} />
        <Route path="thanh-toan/ket-qua" element={<PaymentResult />} />
        <Route path="yeu-thich" element={<Wishlist />} />
        <Route path="thong-bao" element={<Notifications />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="analytics" element={<div>Analytics Page (Coming Soon)</div>} />
        <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
      </Route>
    </Routes>
  )
}

export default App
