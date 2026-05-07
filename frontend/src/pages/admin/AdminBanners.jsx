import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, ImageIcon, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import { adminApi } from '../../utils/api'
import FileUpload from '../../components/common/FileUpload'
import toast from 'react-hot-toast'

function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: 'Xem ngay',
    displayOrder: 0,
    isActive: true,
    position: 'HOME_MAIN',
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getBanners()
      if (response.success) {
        setBanners(response.data)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách banner')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingBanner(null)
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      buttonText: 'Xem ngay',
      displayOrder: banners.length,
      isActive: true,
      position: 'HOME_MAIN',
    })
    setShowForm(true)
  }

  const handleEdit = (banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      buttonText: banner.buttonText || 'Xem ngay',
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive !== false,
      position: banner.position || 'HOME_MAIN',
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBanner(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBanner) {
        const response = await adminApi.updateBanner(editingBanner.id, formData)
        if (response.success) {
          toast.success('Đã cập nhật banner')
          fetchBanners()
          handleCloseForm()
        }
      } else {
        const response = await adminApi.createBanner(formData)
        if (response.success) {
          toast.success('Đã thêm banner mới')
          fetchBanners()
          handleCloseForm()
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) {
      return
    }
    try {
      await adminApi.deleteBanner(id)
      toast.success('Đã xóa banner')
      fetchBanners()
    } catch (error) {
      toast.error('Xóa banner thất bại')
    }
  }

  const handleMove = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= banners.length) return

    const newBanners = [...banners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[newIndex]
    newBanners[newIndex] = temp

    // Update display order
    const updatedBanners = newBanners.map((b, i) => ({ ...b, displayOrder: i }))
    setBanners(updatedBanners)

    // Save to server
    try {
      const orders = updatedBanners.map((b) => ({ id: b.id, displayOrder: b.displayOrder }))
      await adminApi.reorderBanners(orders)
      toast.success('Đã cập nhật thứ tự')
    } catch (error) {
      toast.error('Cập nhật thứ tự thất bại')
      fetchBanners()
    }
  }

  const toggleStatus = async (banner) => {
    try {
      const updated = { ...banner, isActive: !banner.isActive }
      await adminApi.updateBanner(banner.id, updated)
      toast.success(updated.isActive ? 'Đã bật hiển thị' : 'Đã ẩn banner')
      fetchBanners()
    } catch (error) {
      toast.error('Cập nhật thất bại')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý banner</h1>
          <p className="text-gray-500">Quản lý banner hiển thị trên trang chủ</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500">
            Chưa có banner nào
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Banner Image */}
              <div className="aspect-[21/9] bg-gray-100 relative overflow-hidden">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {/* Status Badge */}
                <button
                  onClick={() => toggleStatus(banner)}
                  className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                    banner.isActive !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {banner.isActive !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {banner.isActive !== false ? 'Đang hiển thị' : 'Ẩn'}
                </button>

                {/* Position Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {banner.position === 'HOME_MAIN' ? 'Banner chính' : banner.position}
                </div>
              </div>

              {/* Banner Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{banner.description}</p>
                )}

                {/* Link */}
                {banner.linkUrl && (
                  <p className="text-sm text-primary mt-2 truncate">{banner.linkUrl}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                      title="Lên trên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                      title="Xuống dưới"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">
                {editingBanner ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="input"
                  placeholder="Ví dụ: Khuyến mãi mùa hè"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="input"
                  rows={2}
                  placeholder="Mô tả ngắn..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh banner *
                </label>
                <FileUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  folder="banners"
                  previewClassName="w-full aspect-[21/9]"
                  placeholder="Tải ảnh banner (21:9, 1920x820px)"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link đích
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))
                  }
                  className="input"
                  placeholder="/san-pham/khuyen-mai"
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text nút bấm
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, buttonText: e.target.value }))
                  }
                  className="input"
                  placeholder="Xem ngay"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí
                </label>
                <select
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, position: e.target.value }))
                  }
                  className="input"
                >
                  <option value="HOME_MAIN">Banner chính trang chủ</option>
                  <option value="HOME_SECONDARY">Banner phụ trang chủ</option>
                  <option value="CATEGORY">Banner trang danh mục</option>
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input"
                  min={0}
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Hiển thị banner
                </label>
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div className="border rounded-lg overflow-hidden">
                  <p className="text-xs text-gray-500 p-2 bg-gray-50">Xem trước:</p>
                  <div className="aspect-[21/9] bg-gray-100">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseForm} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingBanner ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBanners
