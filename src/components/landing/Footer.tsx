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
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-lg font-bold text-studio-charcoal"
            >
              TShirt Studio
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-studio-charcoal/70">
              Nơi mỗi chiếc áo là một tác phẩm nghệ thuật. Sáng tạo, in ấn,
              giao hàng toàn quốc.
            </p>
          </div>

          {/* Products */}
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-studio-charcoal/70 uppercase">
              Bộ sưu tập
            </h2>
            <ul className="mt-4 space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-studio-charcoal/70 transition-colors hover:text-studio-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-studio-charcoal/70 uppercase">
              Hỗ trợ
            </h2>
            <ul className="mt-4 space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-studio-charcoal/70 transition-colors hover:text-studio-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-studio-charcoal/70 uppercase">
              Chính sách
            </h2>
            <ul className="mt-4 space-y-3">
              {POLICY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-studio-charcoal/70 transition-colors hover:text-studio-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-black/5 pt-6 text-center text-xs text-studio-charcoal/70">
          &copy; {new Date().getFullYear()} TShirt Studio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
