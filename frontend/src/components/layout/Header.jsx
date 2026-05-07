import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  ChevronDown,
  Heart,
  Bell,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useCategoryStore } from '../../stores/categoryStore'

// Icon mapping for categories
const iconMap = {
  'dien-thoai': '📱',
  'laptop': '💻',
  'may-tinh-bang': '📚',
  'dong-ho': '⌚',
  'phu-kien': '🔌',
  'am-thanh': '🎧',
  'smartphone': '📱',
  'tablet': '📚',
  'watch': '⌚',
  'accessory': '🔌',
  'audio': '🎧',
}

function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items: cartItems, getTotalItems } = useCartStore()
  const { count: wishlistCount, fetchCount } = useWishlistStore()
  const { unreadCount, fetchUnreadCount, subscribe, unsubscribe } = useNotificationStore()
  const { categories, fetchCategories } = useCategoryStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const searchRef = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Fetch categories on mount
    fetchCategories()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCount()
      fetchUnreadCount()
      subscribe()
      return () => unsubscribe()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}
    >
      {/* Top Bar */}
      <div className="bg-dark text-gray-300 text-xs py-2">
        <div className="container-custom flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <a href="tel:19001234" className="flex items-center hover:text-white">
              <Phone className="w-3.5 h-3.5 mr-1.5" />
              <span>Hotline: 1900 1234</span>
            </a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              <span>Hệ thống 50+ cửa hàng</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/tin-tuc" className="hover:text-white">Tin tức</Link>
            <Link to="/huong-dan" className="hover:text-white">Hướng dẫn</Link>
            <Link to="/lien-he" className="hover:text-white">Liên hệ</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-primary text-white">
        <div className="container-custom">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-2">
                <span className="text-primary text-xl font-bold">PS</span>
              </div>
              <span className="text-xl font-bold hidden sm:block">Phone Store</span>
            </Link>

            {/* Category Button */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 mr-2" />
                <span className="font-medium">Danh mục</span>
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${
                    isCategoryOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Category Dropdown */}
              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-dropdown py-2 animate-fade-in max-h-96 overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/danh-muc/${cat.slug}`}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        <span className="text-xl mr-3">
                          {cat.icon || iconMap[cat.slug] || '📦'}
                        </span>
                        <span className="font-medium">{cat.name}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400 text-sm">
                      Đang tải danh mục...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-2xl"
              ref={searchRef}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Bạn cần tìm gì?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Wishlist */}
              <Link
                to="/yeu-thich"
                className="hidden md:flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors relative"
              >
                <div className="relative">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent-orange text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">Yêu thích</span>
              </Link>

              {/* Notifications */}
              <Link
                to="/thong-bao"
                className="hidden md:flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors relative"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">Thông báo</span>
              </Link>

              {/* Cart */}
              <Link
                to="/gio-hang"
                className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors relative"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent-yellow text-dark text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {getTotalItems() > 99 ? '99+' : getTotalItems()}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5 hidden sm:inline">Giỏ hàng</span>
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="hidden md:block text-sm font-medium max-w-24 truncate">
                      {user?.fullName}
                    </span>
                    <ChevronDown className="w-4 h-4 hidden md:block" />
                  </button>
                ) : (
                  <Link
                    to="/dang-nhap"
                    className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-xs mt-0.5 hidden sm:inline">Đăng nhập</span>
                  </Link>
                )}

                {/* User Dropdown */}
                {isUserMenuOpen && isAuthenticated && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-dropdown py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.fullName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/tai-khoan"
                      className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-primary"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Tài khoản của tôi
                    </Link>
                    <Link
                      to="/don-hang"
                      className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-primary"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-3" />
                      Đơn hàng
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg animate-fade-in">
          <div className="container-custom py-4">
            <nav className="space-y-2">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/danh-muc/${cat.slug}`}
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl mr-3">
                      {cat.icon || iconMap[cat.slug] || '📦'}
                    </span>
                    <span className="font-medium">{cat.name}</span>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400 text-sm">
                  Đang tải danh mục...
                </div>
              )}
            </nav>
            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t">
                <Link
                  to="/dang-nhap"
                  className="btn-primary w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/dang-ky"
                  className="btn-outline w-full justify-center mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
