import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  ShoppingBag,
  Trash2,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react'
import { useNotificationStore } from '../stores/notificationStore'
import { formatDistanceToNow } from '../utils/format'
import toast from 'react-hot-toast'

const iconMap = {
  ORDER: Package,
  SHIPPING: Truck,
  PAYMENT: CreditCard,
  PROMOTION: ShoppingBag,
  SYSTEM: Bell,
}

const typeLabels = {
  ORDER: 'Đơn hàng',
  SHIPPING: 'Vận chuyển',
  PAYMENT: 'Thanh toán',
  PROMOTION: 'Khuyến mãi',
  SYSTEM: 'Hệ thống',
}

function Notifications() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    toast.success('Đã đánh dấu tất cả đã đọc')
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

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

  if (notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Chưa có thông báo</h2>
            <p className="text-gray-500 mb-6">
              Bạn chưa có thông báo nào
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Thông báo
            </h1>
            <p className="text-gray-500 mt-1">
              {unreadCount > 0
                ? `Bạn có ${unreadCount} thông báo chưa đọc`
                : 'Tất cả thông báo đã được đọc'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell
            const isUnread = !notification.isRead

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-card p-4 transition-all ${
                  isUnread ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isUnread ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isUnread
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {typeLabels[notification.type] || 'Hệ thống'}
                        </span>
                        <h3
                          className={`font-medium mt-1 ${
                            isUnread ? 'text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {notification.title}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3">
                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          className="text-sm text-primary hover:underline"
                        >
                          Xem chi tiết
                        </Link>
                      )}
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Notifications
