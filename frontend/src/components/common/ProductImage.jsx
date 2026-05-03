import { useState } from 'react'

// Default placeholder as data URI - prevents network requests
const DEFAULT_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3EKh%C3%B4ng c%C3%B3 %E1%BA%A3nh%3C/text%3E%3C/svg%3E`

function ProductImage({ src, alt, className = '', ...props }) {
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
  }

  const imageSrc = error || !src ? DEFAULT_PLACEHOLDER : src

  return (
    <img
      src={imageSrc}
      alt={alt || 'Sản phẩm'}
      className={className}
      onError={handleError}
      {...props}
    />
  )
}

export default ProductImage
export { DEFAULT_PLACEHOLDER }
