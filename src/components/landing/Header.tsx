"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, ShoppingBag } from "lucide-react"
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
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-studio-wash bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-studio-charcoal"
        >
          TShirt Studio
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-studio-charcoal/60 transition-colors hover:text-studio-charcoal"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="relative">
            <ShoppingBag className="size-5 text-studio-charcoal/60 transition-colors hover:text-studio-charcoal" />
          </Link>
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative">
            <ShoppingBag className="size-5 text-studio-charcoal/60" />
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
