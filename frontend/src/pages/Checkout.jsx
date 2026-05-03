import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Truck,
  Check,
  ArrowLeft,
  Package,
} from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { orderApi, paymentApi, cartApi } from '../utils/api'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'

const paymentMethods = [
  { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', icon: Package },
  { id: 'vnpay', name: 'Thanh toán qua VNPay', icon: CreditCard },
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: CreditCard },
]

function Checkout() {
  const navigate = useNavigate()
  const { items, coupon, discount, getSubtotal, getTotal, clearCart, getSessionId, clearSessionId } =
    useCartStore()
  const { user, isAuthenticated } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('cod')
  const [backendCart, setBackendCart] = useState(null)

  // Sync local cart to backend on mount
  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      syncCartToBackend()
    }
  }, [isAuthenticated])

  const syncCartToBackend = async () => {
    setSyncing(true)
    try {
      // First try to merge any existing guest cart
      const sessionId = getSessionId()
      if (sessionId) {
        try {
          await cartApi.merge(sessionId)
          clearSessionId()
        } catch (e) {
          console.log('No guest cart to merge')
        }
      }

      // Add all local items to backend cart
      for (const item of items) {
        try {
          await cartApi.addItem({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          })
        } catch (e) {
          console.log('Failed to add item to backend cart:', item.id, e)
        }
      }

      // Get updated backend cart
      const response = await cartApi.get()
      if (response.success) {
        setBackendCart(response.data)
      }
    } catch (error) {
      console.error('Cart sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
  })

  const subtotal = getSubtotal()
  const total = getTotal()

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-2xl shadow-card p-8 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            Vui lòng đăng nhập</h2>
          <p className="text-gray-500 mb-4">
            Bạn cần đăng nhập để tiến hành thanh toán
          </p>
          <Link to="/dang-nhap" className="btn-primary inline-block">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  if (syncing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-2xl shadow-card p-8 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <h2 className="text-xl font-bold mb-2">Đang đồng bộ giỏ hàng...</h2>
          <p className="text-gray-500 mb-4">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-2xl shadow-card p-8 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-4">
            Bạn cần có sản phẩm trong giỏ hàng để thanh toán
          </p>
          <Link to="/" className="btn-primary inline-block">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    // Validate shipping info
    if (
      !shippingInfo.fullName ||
      !shippingInfo.phone ||
      !shippingInfo.address ||
      !shippingInfo.city
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    setLoading(true)
    try {
      // Map cart items to order items
      const orderItems = items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.name,
        productImage: typeof item.image === 'string' ? item.image : null,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }))

      const orderData = {
        shippingName: shippingInfo.fullName,
        shippingPhone: shippingInfo.phone,
        shippingAddress: shippingInfo.address,
        shippingProvince: shippingInfo.city,
        shippingDistrict: shippingInfo.district,
        shippingWard: shippingInfo.ward,
        shippingMethod: 'standard',
        customerNote: shippingInfo.note,
        paymentMethod: selectedPayment.toUpperCase(),
        couponCode: coupon?.code,
        items: orderItems,
        subtotal: subtotal,
        discountAmount: discount
      }

      const response = await orderApi.create(orderData)

      if (response.success) {
        const order = response.data

        if (selectedPayment === 'vnpay') {
          // Redirect to VNPay
          const paymentResponse = await paymentApi.createPayment(order.orderNumber)
          if (paymentResponse.success && paymentResponse.data?.paymentUrl) {
            window.location.href = paymentResponse.data.paymentUrl
            return
          }
        }

        // COD or bank transfer - clear cart and go to success page
        clearCart()
        toast.success('Đặt hàng thành công!')
        navigate(`/don-hang/${order.orderNumber}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại')
    } finally {
      setLoading(false)
    }
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
          <Link to="/gio-hang" className="breadcrumb-item">
            Giỏ hàng
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Thanh toán</span>
        </nav>

        <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Thông tin giao hàng
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={shippingInfo.fullName}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Số điện thoại *</label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, phone: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, email: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    placeholder="TP. Hồ Chí Minh"
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, city: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Quận/Huyện</label>
                  <input
                    type="text"
                    placeholder="Quận 1"
                    value={shippingInfo.district}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, district: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phường/Xã</label>
                  <input
                    type="text"
                    placeholder="Phường Bến Nghé"
                    value={shippingInfo.ward}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, ward: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    placeholder="Số nhà, đường, ..."
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Ghi chú (tùy chọn)</label>
                  <textarea
                    placeholder="Ghi chú cho đơn hàng..."
                    value={shippingInfo.note}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, note: e.target.value })
                    }
                    className="input min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="sr-only"
                      />
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Đơn hàng ({items.length} sản phẩm)
              </h2>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      {item.variantName && (
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        SL: {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({coupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full btn-primary py-4 text-lg mt-6 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    Đặt hàng
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>

              <Link
                to="/gio-hang"
                className="flex items-center justify-center text-primary hover:underline mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
