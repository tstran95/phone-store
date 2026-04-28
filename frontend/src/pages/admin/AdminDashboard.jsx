import { useEffect, useState } from 'react'
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const statsCards = [
  {
    title: 'Tổng doanh thu',
    value: '₫125,000,000',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-green-500',
  },
  {
    title: 'Đơn hàng hôm nay',
    value: '24',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'bg-blue-500',
  },
  {
    title: 'Sản phẩm',
    value: '156',
    change: '+3',
    trend: 'up',
    icon: Package,
    color: 'bg-purple-500',
  },
  {
    title: 'Người dùng mới',
    value: '18',
    change: '-2.1%',
    trend: 'down',
    icon: Users,
    color: 'bg-orange-500',
  },
]

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Nguyễn Văn A',
    product: 'iPhone 15 Pro Max',
    amount: '32,990,000đ',
    status: 'completed',
    date: '2024-04-28',
  },
  {
    id: 'ORD-002',
    customer: 'Trần Thị B',
    product: 'Samsung Galaxy S24',
    amount: '24,990,000đ',
    status: 'pending',
    date: '2024-04-28',
  },
  {
    id: 'ORD-003',
    customer: 'Lê Văn C',
    product: 'iPhone 14',
    amount: '18,990,000đ',
    status: 'processing',
    date: '2024-04-27',
  },
  {
    id: 'ORD-004',
    customer: 'Phạm Thị D',
    product: 'Xiaomi 14',
    amount: '14,990,000đ',
    status: 'completed',
    date: '2024-04-27',
  },
  {
    id: 'ORD-005',
    customer: 'Hoàng Văn E',
    product: 'OPPO Find X7',
    amount: '21,990,000đ',
    status: 'cancelled',
    date: '2024-04-26',
  },
]

const getStatusBadge = (status) => {
  const styles = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  const labels = {
    completed: 'Hoàn thành',
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    cancelled: 'Đã hủy',
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Tổng quan hệ thống hôm nay</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon
          const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight
          return (
            <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon
                      className={`w-4 h-4 ${
                        card.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {card.change}
                    </span>
                    <span className="text-gray-400 text-sm">so với tháng trước</span>
                  </div>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
              <a
                href="/admin/orders"
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                Xem tất cả
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            <a
              href="/admin/products/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Thêm sản phẩm</p>
                <p className="text-sm text-gray-500">Tạo sản phẩm mới</p>
              </div>
            </a>

            <a
              href="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Quản lý đơn hàng</p>
                <p className="text-sm text-gray-500">Xem và xử lý đơn hàng</p>
              </div>
            </a>

            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Quản lý người dùng</p>
                <p className="text-sm text-gray-500">Xem danh sách user</p>
              </div>
            </a>

            <a
              href="/admin/analytics"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Xem thống kê</p>
                <p className="text-sm text-gray-500">Báo cáo doanh thu</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
