import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  Phone,
  User,
} from 'lucide-react'
import { orderApi } from '../utils/api'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'

const statusConfig = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Đơn hàng đang chờ xác nhận',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    description: 'Đơn hàng đã được xác nhận',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Package,
    description: 'Đang chuẩn bị hàng',
  },
  SHIPPED: {
    label: 'Đang giao',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
    description: 'Đơn hàng đang được giao',
  },
  DELIVERED: {
    label: 'Đã giao',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Đơn hàng đã giao thành công',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Đơn hàng đã bị hủy',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: 'bg-gray-100 text-gray-800',
    icon: CreditCard,
    description: 'Đã hoàn tiền cho đơn hàng',
  },
}

const paymentStatusConfig = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
}

function OrderDetail() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderNumber])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await orderApi.getByOrderNumber(orderNumber)
      if (response.success) {
        setOrder(response.data)
      } else {
        toast.error('Không tìm thấy đơn hàng')
        navigate('/don-hang')
      }
    } catch (error) {
      toast.error('Lỗi tải thông tin đơn hàng')
      navigate('/don-hang')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return

    try {
      setCancelling(true)
      const response = await orderApi.cancel(orderNumber, 'Khách hàng hủy')
      if (response.success) {
        toast.success('Đã hủy đơn hàng thành công')
        setOrder(response.data)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hủy đơn hàng thất bại')
    } finally {
      setCancelling(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-gray-600">Đang tải...</span>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Đơn hàng không tồn tại</p>
          <Link to="/don-hang" className="text-primary hover:underline mt-2 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = status.icon
  const paymentStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.PENDING

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status)

  return (
    <div className="min-h-screen bg-gray-50 py-6 print:bg-white print:py-0">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
          <div>
            <Link
              to="/don-hang"
              className="inline-flex items-center text-gray-600 hover:text-primary mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại danh sách
            </Link>
            <h1 className="text-2xl font-bold">Đơn hàng #{order.orderNumber}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              In đơn
            </button>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-danger inline-flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
              </button>
            )}
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">HÓA ĐƠN BÁN HÀNG</h1>
          <p className="text-gray-600">Mã đơn: {order.orderNumber}</p>
          <p className="text-gray-600">
            Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${status.color}`}>
                  <StatusIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{status.label}</h2>
                  <p className="text-gray-500">{status.description}</p>

                  {/* Timeline */}
                  <div className="mt-6 relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    {order.statusHistory?.map((item, index) => {
                      const ItemStatus = statusConfig[item.status] || statusConfig.PENDING
                      const ItemIcon = ItemStatus.icon
                      return (
                        <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              index === 0 ? ItemStatus.color : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{ItemStatus.label}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.createdAt).toLocaleString('vi-VN')}
                            </p>
                            {item.note && (
                              <p className="text-sm text-gray-600 mt-1">{item.note}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Sản phẩm đặt mua</h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage || '/placeholder.jpg'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/san-pham/${item.productSlug}`}
                        className="font-medium hover:text-primary line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      {item.variantName && (
                        <p className="text-sm text-gray-500">{item.variantName}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        SL: {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đơn hàng</span>
                  <span className="font-medium">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày đặt</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Trạng thái</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Thanh toán</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}
                  >
                    {paymentStatus.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức</span>
                  <span>{order.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Địa chỉ giao hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="font-medium">{order.shippingAddress?.fullName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span>{order.shippingAddress?.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span>
                    {order.shippingAddress?.address}, {order.shippingAddress?.ward},{' '}
                    {order.shippingAddress?.district}, {order.shippingAddress?.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 rounded-xl p-6 print:hidden">
              <h3 className="font-semibold mb-2">Cần hỗ trợ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Liên hệ với chúng tôi nếu bạn cần trợ giúp
              </p>
              <a
                href="tel:19001234"
                className="btn-secondary w-full inline-flex justify-center items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                1900 1234
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
