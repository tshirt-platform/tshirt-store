"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, ShoppingBag } from "lucide-react"
import { useCartStore, selectCount } from "@/lib/cart/cart.store"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Bộ sưu tập" },
  { href: "/orders", label: "Tra cứu đơn" },
]

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-studio-charcoal px-1 text-[10px] font-medium leading-4 text-white">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const cartCount = useCartStore(selectCount)

  useEffect(() => {
    void useCartStore.getState().restore()
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-studio-charcoal"
        >
          TShirt Studio
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-studio-charcoal/50 transition-colors hover:text-studio-charcoal"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="relative" aria-label={`Giỏ hàng (${cartCount})`}>
            <ShoppingBag className="size-5 text-studio-charcoal/50 transition-colors hover:text-studio-charcoal" />
            <CartBadge count={cartCount} />
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-studio-charcoal text-white hover:bg-studio-charcoal/90"
          >
            <Link href="/products">Bắt đầu sáng tạo</Link>
          </Button>
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative" aria-label={`Giỏ hàng (${cartCount})`}>
            <ShoppingBag className="size-5 text-studio-charcoal/50" />
            <CartBadge count={cartCount} />
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="text-lg font-medium text-studio-charcoal"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
