import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Flame,
  Zap,
  Gift,
  Clock,
  Shield,
  Truck,
  RefreshCw,
  Headphones,
} from 'lucide-react'
import ProductCard from '../components/common/ProductCard'
import {
  ProductCardSkeleton,
  CategorySkeleton,
} from '../components/common/LoadingSkeleton'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const banners = [
  {
    id: 1,
    image: '/banners/banner-1.jpg',
    title: 'iPhone 15 Pro Max',
    subtitle: 'Sức mạnh vượt trội - Giá tốt nhất',
    cta: 'Mua ngay',
    link: '/san-pham/iphone-15-pro-max',
    color: 'from-purple-600 to-blue-600',
  },
  {
    id: 2,
    image: '/banners/banner-2.jpg',
    title: 'Samsung Galaxy S24 Ultra',
    subtitle: 'AI mạnh mẽ - Giảm đến 5 triệu',
    cta: 'Khám phá',
    link: '/san-pham/samsung-galaxy-s24-ultra',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 3,
    image: '/banners/banner-3.jpg',
    title: 'Laptop Gaming 2024',
    subtitle: 'Hiệu năng cao - Giá sinh viên',
    cta: 'Xem ngay',
    link: '/danh-muc/laptop',
    color: 'from-red-600 to-orange-500',
  },
]

const categories = [
  { id: 1, name: 'Điện thoại', slug: 'dien-thoai', icon: '📱', color: 'bg-blue-100 text-blue-600' },
  { id: 2, name: 'Laptop', slug: 'laptop', icon: '💻', color: 'bg-purple-100 text-purple-600' },
  { id: 3, name: 'Tablet', slug: 'may-tinh-bang', icon: '📚', color: 'bg-green-100 text-green-600' },
  { id: 4, name: 'Smartwatch', slug: 'dong-ho', icon: '⌚', color: 'bg-orange-100 text-orange-600' },
  { id: 5, name: 'Tai nghe', slug: 'tai-nghe', icon: '🎧', color: 'bg-pink-100 text-pink-600' },
  { id: 6, name: 'Sạc dự phòng', slug: 'sac-du-phong', icon: '🔌', color: 'bg-yellow-100 text-yellow-600' },
  { id: 7, name: 'Ốp lưng', slug: 'op-lung', icon: '🖼️', color: 'bg-cyan-100 text-cyan-600' },
  { id: 8, name: 'Cáp sạc', slug: 'cap-sac', icon: '🔌', color: 'bg-red-100 text-red-600' },
]

const flashSaleProducts = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', basePrice: 34990000, salePrice: 32990000, image: '/products/iphone15.jpg', rating: 4.9, sold: 1250 },
  { id: 2, name: 'Samsung S24 Ultra 512GB', basePrice: 33990000, salePrice: 30990000, image: '/products/s24.jpg', rating: 4.8, sold: 890 },
  { id: 3, name: 'Xiaomi 14 Ultra 512GB', basePrice: 27990000, salePrice: 25990000, image: '/products/xiaomi14.jpg', rating: 4.7, sold: 650 },
  { id: 4, name: 'OPPO Find X7 Ultra', basePrice: 24990000, salePrice: 22990000, image: '/products/oppox7.jpg', rating: 4.6, sold: 420 },
  { id: 5, name: 'iPhone 15 128GB', basePrice: 22990000, salePrice: 20990000, image: '/products/iphone15.jpg', rating: 4.8, sold: 2100 },
]

const newProducts = [
  { id: 6, name: 'MacBook Pro M3 14"', basePrice: 44990000, salePrice: 42990000, image: '/products/macbook.jpg', rating: 4.9, sold: 320, isNew: true },
  { id: 7, name: 'iPad Pro M2 12.9"', basePrice: 31990000, salePrice: 29990000, image: '/products/ipad.jpg', rating: 4.8, sold: 280, isNew: true },
  { id: 8, name: 'Apple Watch Ultra 2', basePrice: 21990000, salePrice: 19990000, image: '/products/watch.jpg', rating: 4.7, sold: 190, isNew: true },
  { id: 9, name: 'AirPods Pro 2', basePrice: 6990000, salePrice: 5990000, image: '/products/airpods.jpg', rating: 4.8, sold: 1500, isNew: true },
  { id: 10, name: 'Galaxy Watch 6 Classic', basePrice: 8990000, salePrice: 7990000, image: '/products/gwatch.jpg', rating: 4.6, sold: 340, isNew: true },
]

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 32,
    seconds: 15,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1">
      <span className="w-8 h-8 bg-white text-primary font-bold rounded flex items-center justify-center">
        {pad(timeLeft.hours)}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="w-8 h-8 bg-white text-primary font-bold rounded flex items-center justify-center">
        {pad(timeLeft.minutes)}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="w-8 h-8 bg-white text-primary font-bold rounded flex items-center justify-center">
        {pad(timeLeft.seconds)}
      </span>
    </div>
  )
}

function Home() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="aspect-[21/9] md:aspect-[3/1] max-h-[500px]"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className={`relative w-full h-full bg-gradient-to-r ${banner.color} flex items-center`}>
                <div className="container-custom relative z-10">
                  <div className="max-w-xl text-white">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                      {banner.title}
                    </h2>
                    <p className="text-lg md:text-xl mb-6 text-white/90">
                      {banner.subtitle}
                    </p>
                    <Link
                      to={banner.link}
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {banner.cta}
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
                  <div className="absolute right-20 top-20 w-64 h-64 border-4 border-white/30 rounded-full" />
                  <div className="absolute right-40 bottom-20 w-48 h-48 border-4 border-white/20 rounded-full" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Categories */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="section-title text-center">Khám phá theo danh mục</h2>
          {loading ? (
            <CategorySkeleton />
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/danh-muc/${cat.slug}`}
                  className="category-card group"
                >
                  <div className={`w-14 h-14 mx-auto ${cat.color} rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-primary">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="section bg-gradient-to-r from-primary to-accent-orange">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Flame className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">FLASH SALE</h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>Kết thúc sau:</span>
                <CountdownTimer />
              </div>
            </div>
            <Link
              to="/khuyen-mai"
              className="flex items-center text-white hover:text-white/80 font-medium"
            >
              Xem tất cả
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : flashSaleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent-green" />
              <h2 className="section-title mb-0">Sản phẩm mới</h2>
            </div>
            <Link
              to="/danh-muc?sort=newest"
              className="flex items-center text-primary hover:text-primary-hover font-medium"
            >
              Xem tất cả
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid-products">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : newProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/khuyen-mai"
              className="relative overflow-hidden rounded-2xl aspect-[4/3] group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />
              <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                <Gift className="w-10 h-10 mb-3" />
                <h3 className="text-xl font-bold mb-1">Khuyến mãi hot</h3>
                <p className="text-white/80">Giảm đến 50%</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
            </Link>

            <Link
              to="/tra-gop"
              className="relative overflow-hidden rounded-2xl aspect-[4/3] group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700" />
              <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                <Zap className="w-10 h-10 mb-3" />
                <h3 className="text-xl font-bold mb-1">Trả góp 0%</h3>
                <p className="text-white/80">Lãi suất ưu đãi</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
            </Link>

            <Link
              to="/doi-tac"
              className="relative overflow-hidden rounded-2xl aspect-[4/3] group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700" />
              <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                <Shield className="w-10 h-10 mb-3" />
                <h3 className="text-xl font-bold mb-1">Bảo hành 2 năm</h3>
                <p className="text-white/80">Toàn diện tại cửa hàng</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Chính hãng 100%</h3>
              <p className="text-sm text-gray-500">Cam kết sản phẩm chính hãng</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Giao hàng nhanh</h3>
              <p className="text-sm text-gray-500">Miễn phí toàn quốc</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Đổi trả dễ dàng</h3>
              <p className="text-sm text-gray-500">30 ngày đổi trả miễn phí</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Hỗ trợ 24/7</h3>
              <p className="text-sm text-gray-500">Hotline: 1900 1234</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
