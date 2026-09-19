import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/format"

interface Props {
  subtotal: number
  count: number
}

export function OrderSummary({ subtotal, count }: Props) {
  const empty = count === 0
  return (
    <aside className="h-fit rounded-xl border p-5 lg:sticky lg:top-20">
      <h2 className="font-semibold">Tóm tắt đơn hàng</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tạm tính ({count} sản phẩm)</dt>
          <dd>{formatVND(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Phí vận chuyển</dt>
          <dd className="text-muted-foreground">Tính khi thanh toán</dd>
        </div>
        <div className="flex justify-between border-t pt-3 text-base font-semibold">
          <dt>Tổng cộng</dt>
          <dd>{formatVND(subtotal)}</dd>
        </div>
      </dl>
      <Button asChild={!empty} disabled={empty} size="lg" className="mt-5 w-full">
        {empty ? <span>Tiến hành thanh toán</span> : <Link href="/checkout">Tiến hành thanh toán</Link>}
      </Button>
    </aside>
  )
}
