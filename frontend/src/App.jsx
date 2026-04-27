import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import SearchResults from './pages/SearchResults'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="danh-muc/:slug" element={<ProductList />} />
        <Route path="tim-kiem" element={<SearchResults />} />
        <Route path="san-pham/:slug" element={<ProductDetail />} />
        <Route path="gio-hang" element={<Cart />} />
        <Route path="thanh-toan" element={<Checkout />} />
        <Route path="dang-nhap" element={<Login />} />
        <Route path="dang-ky" element={<Register />} />
        <Route path="tai-khoan" element={<Profile />} />
        <Route path="don-hang" element={<Orders />} />
      </Route>
    </Routes>
  )
}

export default App
