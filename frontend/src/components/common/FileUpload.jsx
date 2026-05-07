import { useState, useRef } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { uploadApi } from '../../utils/api'
import toast from 'react-hot-toast'

function FileUpload({
  value,
  onChange,
  folder = 'temp',
  accept = 'image/*',
  maxSize = 10,
  className = '',
  previewClassName = '',
  placeholder = 'Chọn hoặc kéo ảnh vào đây',
}) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(value || null)
  const inputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File quá lớn. Tối đa ${maxSize}MB`)
      return
    }

    // Create local preview
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    // Upload
    setLoading(true)
    try {
      const response = await uploadApi.uploadImage(file, folder)
      if (response.success) {
        onChange?.(response.data.url)
        toast.success('Tải ảnh lên thành công')
      } else {
        setPreview(value || null)
        toast.error(response.message || 'Tải ảnh thất bại')
      }
    } catch (error) {
      setPreview(value || null)
      toast.error(error.response?.data?.message || 'Tải ảnh thất bại')
    } finally {
      setLoading(false)
      // Clean up object URL
      URL.revokeObjectURL(localPreview)
    }
  }

  const handleRemove = async () => {
    if (preview && preview !== value) {
      // Delete from server if it was uploaded
      try {
        await uploadApi.deleteFile(preview)
      } catch {
        // Silent fail
      }
    }
    setPreview(null)
    onChange?.(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh')
      return
    }

    // Simulate file input change
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    inputRef.current.files = dataTransfer.files

    // Trigger change event manually
    const event = { target: { files: dataTransfer.files } }
    await handleFileSelect(event)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Update preview when value prop changes
  useState(() => {
    setPreview(value)
  }, [value])

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className={`relative group ${previewClassName}`}>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            <button
              type="button"
              onClick={handleClick}
              className="p-2 bg-white rounded-full hover:bg-gray-100"
              title="Thay đổi"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white rounded-full hover:bg-red-100 text-red-600"
              title="Xóa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          disabled={loading}
          className={`w-full h-full min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">{placeholder}</span>
              <span className="text-xs text-gray-400">
                Click hoặc kéo thả ảnh (tối đa {maxSize}MB)
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default FileUpload
