import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { adminApi, categoryApi, brandApi } from '../../utils/api'
import toast from 'react-hot-toast'
import ProductImage from '../common/ProductImage'

const INITIAL_PRODUCT = {
  sku: '',
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  categoryId: '',
  brandId: '',
  basePrice: '',
  salePrice: '',
  costPrice: '',
  isActive: true,
  isFeatured: false,
  variants: [],
  images: []
}

function ProductForm({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState(INITIAL_PRODUCT)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState([''])

  const isEditing = !!product?.id

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (formData.categoryId) {
      fetchBrands(formData.categoryId)
    } else {
      setBrands([])
    }
  }, [formData.categoryId])

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        categoryId: product.category?.id || '',
        brandId: product.brand?.id || '',
        basePrice: product.basePrice || '',
        salePrice: product.salePrice || '',
        costPrice: product.costPrice || ''
      })
      if (product.images?.length > 0) {
        setImageUrls(product.images.map(img => img.imageUrl).concat(['']))
      } else {
        setImageUrls([''])
      }
    } else {
      setFormData(INITIAL_PRODUCT)
      setImageUrls([''])
    }
  }, [product])

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll()
      if (response.success) {
        setCategories(response.data || [])
      }
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục')
    }
  }

  const fetchBrands = async (categoryId) => {
    try {
      const response = await brandApi.getAll(categoryId)
      if (response.success) {
        setBrands(response.data || [])
      }
    } catch (error) {
      toast.error('Không thể tải danh sách thương hiệu')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    setFormData(prev => ({
      ...prev,
      categoryId,
      brandId: ''
    }))
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    const slug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, name, slug }))
  }

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    if (index === newUrls.length - 1 && value) {
      newUrls.push('')
    }
    setImageUrls(newUrls)
  }

  const removeImageUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    if (newUrls.length === 0 || newUrls[newUrls.length - 1] !== '') {
      newUrls.push('')
    }
    setImageUrls(newUrls)
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { sku: '', variantName: '', attributes: '', priceAdjustment: 0, stockQuantity: 0, isActive: true }
      ]
    }))
  }

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    }))
  }

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validImages = imageUrls
        .filter(url => url.trim())
        .map((url, index) => ({
          imageUrl: url,
          altText: formData.name,
          isPrimary: index === 0,
          displayOrder: index
        }))

      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        images: validImages,
        variants: formData.variants.map(v => ({
          ...v,
          priceAdjustment: parseFloat(v.priceAdjustment) || 0,
          stockQuantity: parseInt(v.stockQuantity) || 0
        }))
      }

      let response
      if (isEditing) {
        response = await adminApi.updateProduct(product.id, payload)
      } else {
        response = await adminApi.createProduct(payload)
      }

      if (response.success) {
        toast.success(isEditing ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công')
        onSuccess()
        onClose()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thương hiệu
                {!formData.categoryId && <span className="text-gray-400 text-xs ml-1">(Chọn danh mục trước)</span>}
              </label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                disabled={!formData.categoryId || brands.length === 0}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
              >
                <option value="">
                  {!formData.categoryId ? 'Chọn danh mục trước' :
                   brands.length === 0 ? 'Không có thương hiệu' : 'Chọn thương hiệu'}
                </option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá gốc <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi</label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá vốn</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm">Đang bán</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm">Nổi bật</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  {url && (
                    <ProductImage src={url} alt="" className="w-10 h-10 object-cover rounded" />
                  )}
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Nhập URL hình ảnh. Ảnh đầu tiên sẽ là ảnh chính.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Biến thể sản phẩm</label>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Thêm biến thể
              </button>
            </div>

            {formData.variants.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Chưa có biến thể nào</p>
            ) : (
              <div className="space-y-3">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Tên biến thể (vd: 128GB - Đen)"
                        value={variant.variantName}
                        onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="SKU biến thể"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder={`Thuộc tính (vd: {\"color\":\"black\"})`}
                        value={variant.attributes}
                        onChange={(e) => updateVariant(index, 'attributes', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Chênh lệch giá"
                        value={variant.priceAdjustment}
                        onChange={(e) => updateVariant(index, 'priceAdjustment', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Tồn kho"
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(index, 'stockQuantity', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={variant.isActive}
                            onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Active</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm sản phẩm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
