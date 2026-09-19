import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center">
      <ShoppingBag className="text-muted-foreground size-12" />
      <div>
        <p className="font-medium">Giỏ hàng trống</p>
        <p className="text-muted-foreground text-sm">Hãy chọn một chiếc áo và bắt đầu thiết kế.</p>
      </div>
      <Button asChild>
        <Link href="/products">Bắt đầu thiết kế</Link>
      </Button>
    </div>
  )
}
