import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Star,
  ChevronRight,
  Minus,
  Plus,
  Check,
} from 'lucide-react'
import { productApi } from '../utils/api'
import { useCartStore } from '../stores/cartStore'
import { formatPrice } from '../utils/format'
import ProductCard from '../components/common/ProductCard'
import { ProductCardSkeleton } from '../components/common/LoadingSkeleton'
import toast from 'react-hot-toast'

function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const response = await productApi.getBySlug(slug)
        if (response.success) {
          setProduct(response.data)
          if (response.data.variants?.length > 0) {
            setSelectedVariant(response.data.variants[0])
          }
          // Fetch related products
          try {
            const relatedResponse = await productApi.getRelated(response.data.id)
            if (relatedResponse.success) {
              setRelatedProducts(relatedResponse.data)
            }
          } catch (error) {
            console.error('Failed to fetch related products:', error)
          }
        }
      } catch (error) {
        toast.error('Không thể tải sản phẩm')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug, navigate])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, selectedVariant, quantity)
    toast.success('Đã thêm vào giỏ hàng')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/gio-hang')
  }

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product?.salePrice || product?.basePrice

  const discountPercent =
    product?.salePrice && product?.basePrice
      ? Math.round(
          ((product.basePrice - product.salePrice) / product.basePrice) * 100
        )
      : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 animate-pulse rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
                <div className="h-12 bg-gray-200 animate-pulse rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Sản phẩm không tồn tại
          </h1>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-item">
              Trang chủ
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  to={`/danh-muc/${product.category.slug}`}
                  className="breadcrumb-item"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-800 font-medium line-clamp-1">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img
                  src={
                    product.images?.[activeImage] ||
                    product.thumbnail ||
                    '/placeholder.jpg'
                  }
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        activeImage === index
                          ? 'border-primary'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                {product.brand && (
                  <Link
                    to={`/thuong-hieu/${product.brand.slug}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {product.brand.name}
                  </Link>
                )}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-accent-yellow fill-current" />
                    <span className="font-medium">
                      {product.ratingAverage?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">
                    {product.ratingCount || 0} đánh giá
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">
                    Đã bán {product.soldCount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.salePrice && product.salePrice < product.basePrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.basePrice)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="badge-discount">-{discountPercent}%</span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <p className="text-sm text-accent-orange mt-2">
                    Tiết kiệm: {formatPrice(product.basePrice - (product.salePrice || currentPrice))}
                  </p>
                )}
              </div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">
                    Phiên bản: {selectedVariant?.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                          selectedVariant?.id === variant.id
                            ? 'border-primary bg-primary-light text-primary'
                            : 'border-gray-200 hover:border-primary'
                        }`}
                      >
                        {variant.name}
                        <span className="block text-xs text-gray-500">
                          {formatPrice(variant.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Số lượng</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {selectedVariant?.stockQuantity || product.stockQuantity} sản phẩm có sẵn
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary py-4 text-lg gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 btn-secondary py-4 text-lg"
                >
                  Mua ngay
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-4 border rounded-lg transition-colors ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`}
                  />
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-gray-600">Miễn phí vận chuyển</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-gray-600">Bảo hành chính hãng</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <RefreshCw className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-gray-600">Đổi trả 30 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specs */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
              <div className="prose max-w-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p className="text-gray-500">
                    Chưa có mô tả cho sản phẩm này.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật</h2>
              {product.specifications ? (
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-500">{key}</span>
                      <span className="font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có thông số kỹ thuật.</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">Sản phẩm tương tự</h2>
              <Link
                to={`/danh-muc/${product.category?.slug}`}
                className="flex items-center text-primary hover:text-primary-hover font-medium"
              >
                Xem tất cả
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid-products">
              {relatedProducts.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
