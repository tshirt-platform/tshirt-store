import Link from "next/link"

const PRODUCT_LINKS = [
  { href: "/products", label: "Áo thun" },
  { href: "/products?type=polo", label: "Áo polo" },
  { href: "/products?type=hoodie", label: "Hoodie" },
]

const SUPPORT_LINKS = [
  { href: "#faq", label: "Câu hỏi thường gặp" },
  { href: "#", label: "Liên hệ" },
  { href: "#", label: "Hướng dẫn sáng tạo" },
]

const POLICY_LINKS = [
  { href: "#", label: "Chính sách đổi trả" },
  { href: "#", label: "Chính sách bảo mật" },
  { href: "#", label: "Điều khoản sử dụng" },
]

export function Footer() {
  return (
    <footer className="border-t border-studio-wash bg-studio-cream">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-lg font-bold text-studio-charcoal"
            >
              TShirt Studio
            </Link>
            <p className="mt-2 text-sm text-studio-charcoal/60">
              Nơi mỗi chiếc áo là một tác phẩm nghệ thuật. Sáng tạo, in ấn,
              giao hàng toàn quốc.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-studio-charcoal">
              Bộ sưu tập
            </h3>
            <ul className="mt-3 space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-studio-charcoal/60 transition-colors hover:text-studio-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-studio-charcoal">
              Hỗ trợ
            </h3>
            <ul className="mt-3 space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-studio-charcoal/60 transition-colors hover:text-studio-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-studio-charcoal">
              Chính sách
            </h3>
            <ul className="mt-3 space-y-2">
              {POLICY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-studio-charcoal/60 transition-colors hover:text-studio-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-studio-charcoal/10 pt-6 text-center text-sm text-studio-charcoal/40">
          &copy; {new Date().getFullYear()} TShirt Studio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
