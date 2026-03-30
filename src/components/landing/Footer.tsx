import Link from "next/link"

const PRODUCT_LINKS = [
  { href: "/products", label: "Áo thun" },
  { href: "/products?type=polo", label: "Áo polo" },
  { href: "/products?type=hoodie", label: "Hoodie" },
]

const SUPPORT_LINKS = [
  { href: "#faq", label: "Câu hỏi thường gặp" },
  { href: "#", label: "Liên hệ" },
  { href: "#", label: "Hướng dẫn thiết kế" },
]

const POLICY_LINKS = [
  { href: "#", label: "Chính sách đổi trả" },
  { href: "#", label: "Chính sách bảo mật" },
  { href: "#", label: "Điều khoản sử dụng" },
]

export function Footer() {
  return (
    <footer className="border-border border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-bold">
              TShirt Custom
            </Link>
            <p className="text-muted-foreground mt-2 text-sm">
              Thiết kế áo thun theo ý bạn. In chất lượng cao, giao hàng toàn
              quốc.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold">Sản phẩm</h3>
            <ul className="mt-3 space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold">Hỗ trợ</h3>
            <ul className="mt-3 space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold">Chính sách</h3>
            <ul className="mt-3 space-y-2">
              {POLICY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-border mt-10 border-t pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} TShirt Custom. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
