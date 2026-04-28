import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  ArrowRight,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { paymentApi } from '../utils/api'
import toast from 'react-hot-toast'

function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing') // processing, success, failed
  const [order, setOrder] = useState(null)
  const [countdown, setCountdown] = useState(5)

  // VNPay params
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode')
  const vnp_TxnRef = searchParams.get('vnp_TxnRef')
  const vnp_OrderInfo = searchParams.get('vnp_OrderInfo')
  const vnp_Amount = searchParams.get('vnp_Amount')

  useEffect(() => {
    if (vnp_ResponseCode) {
      handleVNPayReturn()
    } else {
      // Check if there's a pending order
      const pendingOrder = localStorage.getItem('pendingOrder')
      if (pendingOrder) {
        setOrder(JSON.parse(pendingOrder))
        setStatus('success')
      } else {
        setStatus('failed')
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (status === 'success' && countdown === 0) {
      // Optional: Auto redirect
    }
  }, [status, countdown])

  const handleVNPayReturn = async () => {
    try {
      // Extract order number from TxnRef (format: ORDER_123456_1234567890)
      const orderNumber = vnp_TxnRef?.split('_')[1]

      if (!orderNumber) {
        setStatus('failed')
        return
      }

      // Verify payment with backend
      const response = await paymentApi.checkStatus(orderNumber)

      if (vnp_ResponseCode === '00' && response.success) {
        setStatus('success')
        setOrder({
          orderNumber,
          amount: parseInt(vnp_Amount) / 100, // VNPay amount is in VND * 100
          orderInfo: vnp_OrderInfo,
        })
        // Clear pending order
        localStorage.removeItem('pendingOrder')
        toast.success('Thanh toán thành công!')
      } else {
        setStatus('failed')
        toast.error('Thanh toán thất bại')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setStatus('failed')
      toast.error('Không thể xác minh thanh toán')
    }
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Đang xử lý thanh toán...</h2>
          <p className="text-gray-500">Vui lòng không đóng trang này</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-lg">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-500 mb-6">
              Cảm ơn bạn đã mua hàng tại Phone Store
            </p>

            {/* Order Info */}
            {order && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Mã đơn hàng</span>
                  <span className="font-medium">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Số tiền</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="font-medium">VNPay</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link
                to={`/don-hang/${order?.orderNumber}`}
                className="btn-primary w-full inline-flex justify-center items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Xem chi tiết đơn hàng
              </Link>

              <Link
                to="/"
                className="btn-secondary w-full inline-flex justify-center items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Tiếp tục mua sắm
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Countdown */}
            <p className="text-sm text-gray-400 mt-4">
              Tự động chuyển sau {countdown} giây...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-lg">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          {/* Failed Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán thất bại
          </h1>
          <p className="text-gray-500 mb-6">
            Đã có lỗi xảy ra trong quá trình thanh toán
          </p>

          {/* Error Details */}
          <div className="bg-red-50 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">
              {vnp_ResponseCode === '24'
                ? 'Bạn đã hủy giao dịch'
                : vnp_ResponseCode === '51'
                  ? 'Tài khoản không đủ số dư'
                  : 'Giao dịch không thành công. Vui lòng thử lại.'}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-primary w-full inline-flex justify-center items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Thử lại
            </button>

            <Link
              to="/gio-hang"
              className="btn-secondary w-full inline-flex justify-center items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentResult
