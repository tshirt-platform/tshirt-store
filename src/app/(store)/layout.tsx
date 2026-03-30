export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="border-border sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <a href="/" className="text-xl font-bold">
            TShirt Custom
          </a>
          <nav className="flex items-center gap-6">
            <a
              href="/products"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Sản phẩm
            </a>
            <a
              href="/cart"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Giỏ hàng
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-border border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} TShirt Custom. All rights reserved.
        </div>
      </footer>
    </>
  )
}
