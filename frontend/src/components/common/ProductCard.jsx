import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success('Đã thêm vào giỏ hàng')
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const discountPercent = product.salePrice
    ? Math.round(
        ((product.basePrice - product.salePrice) / product.basePrice) * 100
      )
    : 0

  return (
    <Link to={`/san-pham/${product.slug}`} className="product-card">
      {/* Image Container */}
      <div className="relative aspect-product bg-gray-100 overflow-hidden">
        <img
          src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 badge-discount">
            -{discountPercent}%
          </div>
        )}

        {/* New/Hot Badges */}
        {product.isNew && (
          <div className="absolute top-2 right-2 badge-new">Mới</div>
        )}
        {product.isHot && (
          <div className="absolute top-2 right-2 badge-hot">Hot</div>
        )}

        {/* Wishlist Button */}
        <button
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-primary text-white py-2.5 font-medium transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Brand */}
        <p className="text-xs text-gray-400 mb-1">{product.brand?.name}</p>

        {/* Product Name */}
        <h3 className="font-medium text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center text-accent-yellow">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-medium ml-0.5">
              {product.ratingAverage?.toFixed(1) || '5.0'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            ({product.ratingCount || 0} đánh giá)
          </span>
        </div>

        {/* Price */}
        <div className="mt-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="price-current">
              {formatPrice(product.salePrice || product.basePrice)}
            </span>
            {product.salePrice && (
              <span className="price-original">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>
          {discountPercent > 0 && (
            <p className="text-xs text-accent-orange mt-1">
              Tiết kiệm {formatPrice(product.basePrice - product.salePrice)}
            </p>
          )}
        </div>

        {/* Sold Count */}
        {product.soldCount > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            Đã bán {product.soldCount.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
