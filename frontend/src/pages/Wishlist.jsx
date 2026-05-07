import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from 'lucide-react'
import { useWishlistStore } from '../stores/wishlistStore'
import { useCartStore } from '../stores/cartStore'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'

function Wishlist() {
  const { items, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemove = async (productId, productName) => {
    const success = await removeFromWishlist(productId)
    if (success) {
      toast.success(`Đã xóa ${productName} khỏi yêu thích`)
    }
  }

  const handleAddToCart = async (product) => {
    try {
      await addItem({
        productId: product.id,
        quantity: 1,
      })
      toast.success('Đã thêm vào giỏ hàng')
    } catch {
      toast.error('Thêm vào giỏ hàng thất bại')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-gray-600">Đang tải...</span>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Danh sách yêu thích trống</h2>
            <p className="text-gray-500 mb-6">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Danh sách yêu thích
            </h1>
            <p className="text-gray-500 mt-1">
              {items.length} sản phẩm trong danh sách
            </p>
          </div>
          <Link to="/" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const product = item.product
            if (!product) return null

            const originalPrice = product.originalPrice || product.price
            const hasDiscount = product.discountPercent > 0

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-card overflow-hidden group hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Link to={`/san-pham/${product.slug}`}>
                    <img
                      src={product.thumbnailUrl || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -{product.discountPercent}%
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product.id, product.name)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/san-pham/${product.slug}`}>
                    <h3 className="font-medium text-gray-800 line-clamp-2 hover:text-primary transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <Package className="w-4 h-4" />
                    <span>
                      {product.stockQuantity > 0
                        ? `Còn hàng (${product.stockQuantity})`
                        : 'Hết hàng'}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stockQuantity <= 0}
                    className="w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Wishlist
