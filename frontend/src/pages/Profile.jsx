import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Package,
  Heart,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

function Profile() {
  const { user, updateUser, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // API call would go here
      updateUser(profileData)
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      toast.error('Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    setLoading(true)
    try {
      // API call would go here
      toast.success('Đổi mật khẩu thành công')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('Đổi mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất')
    window.location.href = '/'
  }

  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'orders', label: 'Đơn hàng', icon: Package, link: '/don-hang' },
    { id: 'wishlist', label: 'Yêu thích', icon: Heart, link: '/yeu-thich' },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="breadcrumb mb-6">
          <Link to="/" className="breadcrumb-item">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Tài khoản</span>
        </nav>

        <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              {/* Avatar */}
              <div className="p-6 border-b text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="font-bold mt-3">{user?.fullName}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {/* Menu */}
              <nav className="p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  if (item.link) {
                    return (
                      <Link
                        key={item.id}
                        to={item.link}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-light text-primary'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-light text-primary'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  )
                })}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-card p-6">
              {activeTab === 'profile' && (
                <>
                  <h2 className="text-xl font-bold mb-6">
                    Thông tin cá nhân
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div>
                      <label className="label">Họ và tên</label>
                      <div className="relative">
                        <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fullName: e.target.value,
                            })
                          }
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Email</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="input pl-10 bg-gray-50"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Email không thể thay đổi
                      </p>
                    </div>

                    <div>
                      <label className="label">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-8 py-2.5 disabled:opacity-50"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'password' && (
                <>
                  <h2 className="text-xl font-bold mb-6">Đổi mật khẩu</h2>
                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                    <div>
                      <label className="label">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="input pl-10"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Mật khẩu mới</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="input pl-10"
                          placeholder="Tối thiểu 6 ký tự"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="input pl-10"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-8 py-2.5 disabled:opacity-50"
                      >
                        {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
