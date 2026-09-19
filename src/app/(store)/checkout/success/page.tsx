"use client"

import { Suspense, useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/format"
import { parseRememberedOrder, readRememberedOrder } from "@/lib/checkout/api"

const subscribe = () => () => {}

function SuccessContent() {
  const orderId = useSearchParams().get("orderId")
  // sessionStorage only exists in the browser; undefined marks the server render, before it is read
  const raw = useSyncExternalStore(subscribe, readRememberedOrder, () => undefined)
  const order = useMemo(
    () => (orderId && raw !== undefined ? parseRememberedOrder(raw, orderId) : null),
    [raw, orderId]
  )

  if (raw === undefined) return null

  // Only an order this browser just placed is confirmed here; anything else must go through the lookup
  if (!orderId || !order) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground text-sm">Không tìm thấy đơn hàng vừa đặt trên thiết bị này.</p>
        <Button asChild className="mt-4">
          <Link href={orderId ? `/orders/${encodeURIComponent(orderId)}` : "/orders"}>Tra cứu đơn hàng</Link>
        </Button>
      </div>
    )
  }

  const shown = order.displayId ? `#${order.displayId}` : orderId

  async function copy() {
    try {
      await navigator.clipboard.writeText(orderId ?? "")
      toast.success("Đã sao chép mã đơn hàng")
    } catch {
      toast.error("Không sao chép được, hãy chép thủ công")
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600"
        >
          <Check className="size-8" aria-hidden />
        </motion.div>
        <h1 className="mt-4 text-2xl font-bold">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Cảm ơn bạn. Chúng tôi sẽ in và giao áo trong 3-5 ngày làm việc.
        </p>
        <button
          type="button"
          onClick={copy}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
          aria-label="Sao chép mã đơn hàng"
        >
          Mã đơn: <span className="font-mono font-medium">{shown}</span>
          <Copy className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="mt-8 space-y-5 rounded-xl border p-5 text-sm">
        <ul className="space-y-3">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">{i.title} × {i.quantity}</span>
              <span className="shrink-0">{formatVND(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t pt-4">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tạm tính</dt>
            <dd>{formatVND(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phí vận chuyển</dt>
            <dd>{formatVND(order.shippingTotal)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Tổng cộng (thu khi nhận hàng)</dt>
            <dd>{formatVND(order.total)}</dd>
          </div>
        </dl>
        {order.address && (
          <div className="border-t pt-4">
            <p className="font-medium">Giao đến</p>
            <p className="text-muted-foreground mt-1">
              {order.address.name} · {order.address.phone}
              <br />
              {[order.address.line, order.address.ward, order.address.province].filter(Boolean).join(", ")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild><Link href={`/orders/${encodeURIComponent(orderId)}`}>Theo dõi đơn hàng</Link></Button>
        <Button asChild variant="outline"><Link href="/products">Thiết kế thêm áo</Link></Button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}
