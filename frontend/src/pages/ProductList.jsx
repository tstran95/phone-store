import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Filter, ChevronDown, Grid3X3, LayoutList, SlidersHorizontal } from 'lucide-react'
import { productApi, categoryApi } from '../utils/api'
import ProductCard from '../components/common/ProductCard'
import { ProductCardSkeleton } from '../components/common/LoadingSkeleton'
import toast from 'react-hot-toast'

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'best_selling', label: 'Bán chạy nhất' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
]

const priceRanges = [
  { min: 0, max: 5000000, label: 'Dưới 5 triệu' },
  { min: 5000000, max: 10000000, label: '5 - 10 triệu' },
  { min: 10000000, max: 20000000, label: '10 - 20 triệu' },
  { min: 20000000, max: 50000000, label: '20 - 50 triệu' },
  { min: 50000000, max: null, label: 'Trên 50 triệu' },
]

function ProductList() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 0,
    size: 20,
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
  })

  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll()
        if (response.success) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: filters.page,
        size: filters.size,
        sort: filters.sort,
      }

      if (slug) {
        params.category = slug
        // Fetch category details
        try {
          const catResponse = await categoryApi.getBySlug(slug)
          if (catResponse.success) {
            setCategory(catResponse.data)
          }
        } catch (error) {
          console.error('Failed to fetch category:', error)
        }
      }

      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.brand) params.brand = filters.brand

      // Search query
      const searchQuery = searchParams.get('q')
      if (searchQuery) {
        params.keyword = searchQuery
      }

      const response = await productApi.getAll(params)

      if (response.success) {
        setProducts(response.data.content)
        setPagination({
          page: response.data.number,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
        })
      }
    } catch (error) {
      toast.error('Không thể tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }, [filters, slug, searchParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.page > 0) params.set('page', filters.page.toString())
    if (filters.sort !== 'newest') params.set('sort', filters.sort)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.brand) params.set('brand', filters.brand)

    setSearchParams(params)
  }, [filters, setSearchParams])

  const handleSortChange = (sortValue) => {
    setFilters((prev) => ({ ...prev, sort: sortValue, page: 0 }))
  }

  const handlePriceFilter = (min, max) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
      page: 0,
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setFilters({
      page: 0,
      size: 20,
      sort: 'newest',
      minPrice: '',
      maxPrice: '',
      brand: '',
    })
  }

  const searchQuery = searchParams.get('q')
  const pageTitle = searchQuery
    ? `Kết quả tìm kiếm: "${searchQuery}"`
    : category?.name || 'Tất cả sản phẩm'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-item">
              Trang chủ
            </Link>
            <span>/</span>
            {category ? (
              <>
                <Link to="/danh-muc" className="breadcrumb-item">
                  Danh mục
                </Link>
                <span>/</span>
                <span className="text-gray-800 font-medium">{category.name}</span>
              </>
            ) : searchQuery ? (
              <span className="text-gray-800 font-medium">Tìm kiếm</span>
            ) : (
              <span className="text-gray-800 font-medium">Sản phẩm</span>
            )}
          </nav>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 flex-shrink-0 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-xl shadow-card p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Bộ lọc
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Xóa lọc
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Danh mục</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/danh-muc/${cat.slug}`}
                      className={`block text-sm py-1 px-2 rounded ${
                        slug === cat.slug
                          ? 'bg-primary-light text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Khoảng giá</h4>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceFilter(range.min, range.max)}
                      className={`block w-full text-left text-sm py-1 px-2 rounded ${
                        filters.minPrice === range.min.toString()
                          ? 'bg-primary-light text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold">{pageTitle}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {pagination.totalElements} sản phẩm
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Lọc
                  </button>

                  {/* Sort Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
                      {sortOptions.find((o) => o.value === filters.sort)?.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-dropdown py-1 hidden group-hover:block z-10">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            filters.sort === option.value
                              ? 'text-primary font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* View Mode */}
                  <div className="hidden sm:flex items-center border rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${
                        viewMode === 'grid'
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${
                        viewMode === 'list'
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid-products">
                {Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid-products'
                    : 'space-y-4'
                }
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500 mb-4">
                  Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          pagination.page === page
                            ? 'bg-primary text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {page + 1}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages - 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductList
