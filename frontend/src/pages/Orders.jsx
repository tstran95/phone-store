import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
} from 'lucide-react'
import { orderApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { formatPrice, formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const orderStatuses = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-700', icon: RefreshCw },
  SHIPPED: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-700', icon: RefreshCw },
}

function Orders() {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderApi.getAll()
      console.log('Orders API response:', response)
      if (response.success && response.data) {
        // Handle PagedResponse structure
        const ordersData = response.data.content || response.data
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Fetch orders error:', err)
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderNumber) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return

    setCancellingOrder(orderNumber)
    try {
      const response = await orderApi.cancel(orderNumber)
      if (response.success) {
        toast.success('Đã hủy đơn hàng thành công')
        fetchOrders()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hủy đơn hàng thất bại')
    } finally {
      setCancellingOrder(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-2xl shadow-card p-8 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 mb-4">
            Bạn cần đăng nhập để xem đơn hàng
          </p>
          <Link to="/dang-nhap" className="btn-primary inline-block">
            Đăng nhập ngay
          </Link>
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
          <span className="text-gray-800 font-medium">Đơn hàng của tôi</span>
        </nav>

        <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

        {error ? (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Đã có lỗi xảy ra
            </h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={fetchOrders} className="btn-primary inline-block">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có đơn hàng
            </h2>
            <p className="text-gray-500 mb-6">
              Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm của chúng tôi.
            </p>
            <Link to="/" className="btn-primary inline-block">
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              if (!order) return null
              const status = orderStatuses[order.status] || orderStatuses.PENDING
              const StatusIcon = status.icon

              return (
                <div
                  key={order.id || order.orderNumber}
                  className="bg-white rounded-xl shadow-card overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{order.orderNumber || 'N/A'}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-sm text-gray-500">
                          {order.createdAt ? formatDate(order.createdAt) : '-'}
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 py-3 first:pt-0 last:pb-0 border-b last:border-0"
                      >
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item?.thumbnail || '/placeholder.jpg'}
                            alt={item?.productName || 'Sản phẩm'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-1">
                            {item?.productName || 'Sản phẩm'}
                          </h3>
                          {item?.variantName && (
                            <p className="text-sm text-gray-500">
                              {item.variantName}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            SL: {item?.quantity || 0} x {formatPrice(item?.unitPrice || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatPrice(item?.subtotal || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-gray-500">Tổng tiền: </span>
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(order.totalAmount || 0)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {['PENDING', 'CONFIRMED'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.orderNumber)}
                            disabled={cancellingOrder === order.orderNumber}
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50"
                          >
                            {cancellingOrder === order.orderNumber
                              ? 'Đang hủy...'
                              : 'Hủy đơn'}
                          </button>
                        )}
                        <Link
                          to={`/don-hang/${order.orderNumber}`}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center"
                        >
                          Chi tiết
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
