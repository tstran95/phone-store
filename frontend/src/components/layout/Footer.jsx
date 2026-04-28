import { Link } from 'react-router-dom'
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  CreditCard,
  Shield,
  Truck,
  RefreshCw,
  Headphones,
} from 'lucide-react'

const footerLinks = {
  support: [
    { name: 'Hướng dẫn mua hàng', href: '#' },
    { name: 'Hướng dẫn thanh toán', href: '#' },
    { name: 'Chính sách bảo hành', href: '#' },
    { name: 'Chính sách đổi trả', href: '#' },
    { name: 'Câu hỏi thường gặp', href: '#' },
  ],
  about: [
    { name: 'Giới thiệu công ty', href: '#' },
    { name: 'Tuyển dụng', href: '#' },
    { name: 'Tin tức khuyến mãi', href: '#' },
    { name: 'Chương trình đối tác', href: '#' },
    { name: 'Liên hệ', href: '#' },
  ],
  policy: [
    { name: 'Chính sách bảo mật', href: '#' },
    { name: 'Điều khoản sử dụng', href: '#' },
    { name: 'Chính sách cookie', href: '#' },
  ],
}

const paymentMethods = [
  { name: 'VNPAY', icon: '💳' },
  { name: 'Momo', icon: '💌' },
  { name: 'COD', icon: '💵' },
  { name: 'Visa', icon: '💴' },
  { name: 'Mastercard', icon: '💴' },
]

const shippingPartners = [
  { name: 'Giao hàng nhanh', icon: '🚚' },
  { name: 'Giao hàng tiết kiệm', icon: '🚚' },
  { name: 'Viettel Post', icon: '🚚' },
]

function Footer() {
  return (
    <footer className="bg-dark text-gray-300">
      {/* Features Bar */}
      <div className="border-b border-dark-light">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Chính hãng 100%</h4>
                <p className="text-xs text-gray-400">Cam kết sản phẩm chính hãng</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Giao hàng nhanh</h4>
                <p className="text-xs text-gray-400">Miễn phí toàn quốc</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Đổi trả 30 ngày</h4>
                <p className="text-xs text-gray-400">Dễ dàng đổi trả</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Hỗ trợ 24/7</h4>
                <p className="text-xs text-gray-400">Hotline: 1900 1234</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-xl font-bold">PS</span>
              </div>
              <span className="text-xl font-bold text-white">Phone Store</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">
              Hệ thống bán lẻ điện thoại và thiết bị công nghệ hàng đầu Việt Nam.
              Cam kết sản phẩm chính hãng, giá tốt, dịch vụ chuyên nghiệp.
            </p>
            <div className="space-y-3">
              <a href="tel:19001234" className="flex items-center text-sm hover:text-white">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                <span>1900 1234 (8:00 - 22:00)</span>
              </a>
              <a href="mailto:support@phonestore.com" className="flex items-center text-sm hover:text-white">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                <span>support@phonestore.com</span>
              </a>
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5" />
                <span>123 Nguyễn Văn A, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Về Phone Store</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2">
              {footerLinks.policy.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Payment & Shipping */}
      <div className="border-t border-dark-light">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Thanh toán:</span>
              <div className="flex gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="w-10 h-6 bg-white rounded flex items-center justify-center text-lg"
                    title={method.name}
                  >
                    {method.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Theo dõi:</span>
              <div className="flex gap-2">
                <a href="#" className="w-8 h-8 bg-dark-light hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-dark-light hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-dark-light hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-dark-light">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <p>© 2024 Phone Store. All rights reserved.</p>
            <p>Công ty TNHH Phone Store - MST: 0123456789</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
