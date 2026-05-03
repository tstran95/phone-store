import { useEffect, useState } from 'react'
import { Search, Shield, User, CheckCircle, XCircle } from 'lucide-react'
import { adminApi } from '../../utils/api'
import toast from 'react-hot-toast'

const roleOptions = [
  { value: 'ADMIN', label: 'Admin', color: 'bg-red-100 text-red-800' },
  { value: 'MANAGER', label: 'Manager', color: 'bg-purple-100 text-purple-800' },
  { value: 'USER', label: 'User', color: 'bg-blue-100 text-blue-800' },
]

const statusOptions = [
  { value: 'ACTIVE', label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
  { value: 'INACTIVE', label: 'Vô hiệu', color: 'bg-gray-100 text-gray-800' },
  { value: 'SUSPENDED', label: 'Tạm khóa', color: 'bg-red-100 text-red-800' },
]

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getUsers({
        page,
        size: 10,
        search: search || undefined,
        role: roleFilter || undefined,
      })
      if (response.success) {
        setUsers(response.data.content)
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (id, newRole) => {
    try {
      const response = await adminApi.updateUserRole(id, newRole)
      if (response.success) {
        toast.success('Cập nhật vai trò thành công')
        fetchUsers()
      }
    } catch (error) {
      toast.error('Cập nhật vai trò thất bại')
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await adminApi.updateUserStatus(id, newStatus)
      if (response.success) {
        toast.success('Cập nhật trạng thái thành công')
        fetchUsers()
      }
    } catch (error) {
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const getRoleBadge = (role) => {
    const option = roleOptions.find(r => r.value === role)
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${option?.color || 'bg-gray-100 text-gray-800'}`}>
        {option?.label || role}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const option = statusOptions.find(s => s.value === status)
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${option?.color || 'bg-gray-100 text-gray-800'}`}>
        {option?.label || status}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa đăng nhập'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý ngườI dùng</h1>
        <p className="text-gray-500">Xem và quản lý tài khoản ngườI dùng</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm email, tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input"
          >
            <option value="">Tất cả vai trò</option>
            {roleOptions.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NgườI dùng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đăng nhập cuối</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Không có ngườI dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName || 'Chưa cập nhật'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.phone || 'Chưa có SĐT'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="text-sm border rounded-lg px-2 py-1"
                        >
                          {roleOptions.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        <select
                          value={user.status}
                          onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                          className="text-sm border rounded-lg px-2 py-1"
                        >
                          {statusOptions.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-secondary disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm text-gray-600">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-secondary disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
