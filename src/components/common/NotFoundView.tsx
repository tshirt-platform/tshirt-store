import Link from "next/link"
import { Button } from "@/components/ui/button"

export function NotFoundView() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <svg viewBox="0 0 120 100" className="text-studio-charcoal/30 size-32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" aria-hidden>
        <path d="M40 10 L20 22 L6 44 L24 54 L32 44 V90 H88 V44 L96 54 L114 44 L100 22 L80 10 C76 20 44 20 40 10 Z" />
        <text x="60" y="68" textAnchor="middle" fontSize="22" fontWeight="700" fill="currentColor" stroke="none">404</text>
      </svg>
      <h1 className="text-2xl font-bold">Trang không tồn tại</h1>
      <p className="text-muted-foreground text-sm">
        Đường dẫn này không có gì cả, hoặc sản phẩm đã được gỡ. Về trang chủ để xem các mẫu áo nhé.
      </p>
      <Button asChild>
        <Link href="/">Về trang chủ</Link>
      </Button>
    </div>
  )
}
