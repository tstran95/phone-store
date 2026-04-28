import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
  ArrowLeft,
  Tag,
  X,
} from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'

const availableCoupons = [
  { code: 'WELCOME10', discountValue: 100000, minOrder: 500000, description: 'Giảm 100K cho đơn từ 500K' },
  { code: 'SALE20', discountValue: 200000, minOrder: 1000000, description: 'Giảm 200K cho đơn từ 1 triệu' },
  { code: 'VIP50', discountValue: 500000, minOrder: 5000000, description: 'Giảm 500K cho đơn từ 5 triệu' },
]

function Cart() {
  const navigate = useNavigate()
  const {
    items,
    coupon,
    discount,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getTotal,
    getTotalItems,
  } = useCartStore()

  const [couponCode, setCouponCode] = useState('')
  const [showCoupons, setShowCoupons] = useState(false)

  const subtotal = getSubtotal()
  const total = getTotal()
  const totalItems = getTotalItems()

  const handleApplyCoupon = () => {
    const foundCoupon = availableCoupons.find(
      (c) => c.code.toLowerCase() === couponCode.trim().toLowerCase()
    )

    if (!foundCoupon) {
      toast.error('Mã giảm giá không hợp lệ')
      return
    }

    if (subtotal < foundCoupon.minOrder) {
      toast.error(`Đơn hàng tối thiểu ${formatPrice(foundCoupon.minOrder)}`)
      return
    }

    applyCoupon(foundCoupon)
    toast.success('Áp dụng mã giảm giá thành công')
    setCouponCode('')
    setShowCoupons(false)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-xl mx-auto text-center bg-white rounded-2xl shadow-card p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-500 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi.
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
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
        {/* Breadcrumb */}
        <nav className="breadcrumb mb-6">
          <Link to="/" className="breadcrumb-item">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Giỏ hàng</span>
        </nav>

        <h1 className="text-2xl font-bold mb-6">
          Giỏ hàng ({totalItems} sản phẩm)
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-600">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center"
                  >
                    {/* Product Info */}
                    <div className="md:col-span-6 flex gap-4 mb-4 md:mb-0">
                      <Link
                        to={`/san-pham/${item.slug}`}
                        className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/san-pham/${item.slug}`}
                          className="font-medium text-gray-900 hover:text-primary line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.variantName}
                          </p>
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 text-sm hover:underline mt-2 md:hidden"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 md:text-center mb-2 md:mb-0">
                      <span className="md:hidden text-gray-500 mr-2">Đơn giá:</span>
                      <span className="font-medium">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice > item.price && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(item.originalPrice)}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 md:text-center mb-4 md:mb-0">
                      <span className="md:hidden text-gray-500 mr-2">
                        Số lượng:
                      </span>
                      <div className="inline-flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          disabled={item.quantity >= item.maxQuantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 md:text-right flex items-center justify-between md:block">
                      <span className="md:hidden font-medium">Thành tiền:</span>
                      <div>
                        <span className="font-bold text-primary text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="hidden md:block text-red-500 text-sm hover:text-red-600 mt-1"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
                <Link
                  to="/"
                  className="flex items-center text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Tiếp tục mua sắm
                </Link>
                <button
                  onClick={() => {
                    clearCart()
                    toast.success('Đã xóa giỏ hàng')
                  }}
                  className="text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa giỏ hàng
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h2>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={coupon}
                    />
                  </div>
                  {coupon ? (
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                    >
                      Áp dụng
                    </button>
                  )}
                </div>

                {/* Available Coupons */}
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  {showCoupons ? 'Ẩn mã giảm giá' : 'Xem mã giảm giá có sẵn'}
                </button>

                {showCoupons && (
                  <div className="mt-3 space-y-2">
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCouponCode(c.code)
                          toast.success(`Đã chọn mã ${c.code}`)
                        }}
                        className="w-full p-3 border rounded-lg hover:border-primary hover:bg-primary-light text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">{c.code}</span>
                          <span className="text-sm text-gray-500">
                            Giảm {formatPrice(c.discountValue)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {c.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {coupon && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 font-medium">
                        Đã áp dụng: {coupon.code}
                      </span>
                      <span className="text-green-700">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/thanh-toan')}
                className="w-full btn-primary py-4 text-lg mt-6"
              >
                Thanh toán
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc tiến hành thanh toán, bạn đồng ý với điều khoản sử dụng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
