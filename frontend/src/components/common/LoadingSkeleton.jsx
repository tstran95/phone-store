function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-product bg-gray-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-3 space-y-3">
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-1">
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Skeleton */}
        <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />

        {/* Info Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl">
      <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="category-card">
          <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full animate-pulse mb-2" />
          <div className="h-3 w-16 mx-auto bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export {
  ProductCardSkeleton,
  ProductDetailSkeleton,
  CartItemSkeleton,
  CategorySkeleton,
}
