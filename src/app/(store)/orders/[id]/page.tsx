"use client"

import { use, useCallback, useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderItems } from "@/components/orders/OrderItems"
import { OrderLookupForm } from "@/components/orders/OrderLookupForm"
import { ProgressTracker } from "@/components/orders/ProgressTracker"
import { formatVND } from "@/lib/format"
import { lookupOrder, orderLabel, recallLookup, rememberLookup, type TrackedOrder } from "@/lib/orders/api"
import {
  PAYMENT_METHOD_LABEL,
  deliveryWindow,
  deriveProgress,
  paymentStatusLabel,
  trackingNumbers,
} from "@/lib/orders/status"

type View =
  | { kind: "loading" }
  | { kind: "ask-email" }
  | { kind: "error"; message: string }
  | { kind: "ready"; order: TrackedOrder }

const day = (d: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(d)

const subscribe = () => () => {}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // sessionStorage only exists in the browser: undefined on the server, then the email or null
  const remembered = useSyncExternalStore(subscribe, () => recallLookup(id), () => undefined)
  const [loaded, setView] = useState<View | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const view: View = loaded ?? (remembered === null ? { kind: "ask-email" } : { kind: "loading" })

  const load = useCallback(
    async (email: string) => {
      try {
        const order = await lookupOrder({ order: id, email })
        rememberLookup(order.id, email)
        setView({ kind: "ready", order })
      } catch (e) {
        setView({ kind: "error", message: e instanceof Error ? e.message : "Không tải được đơn hàng" })
      }
    },
    [id]
  )

  useEffect(() => {
    if (!remembered) return
    let cancelled = false
    lookupOrder({ order: id, email: remembered })
      .then((order) => {
        if (cancelled) return
        rememberLookup(order.id, remembered)
        setView({ kind: "ready", order })
      })
      .catch((e: unknown) => {
        if (!cancelled) setView({ kind: "error", message: e instanceof Error ? e.message : "Không tải được đơn hàng" })
      })
    return () => {
      cancelled = true
    }
  }, [id, remembered])

  async function refresh() {
    const email = recallLookup(id)
    if (!email) return
    setRefreshing(true)
    await load(email)
    setRefreshing(false)
  }

  if (view.kind === "loading") {
    return (
      <div className="flex justify-center py-24" role="status" aria-label="Đang tải đơn hàng">
        <Loader2 className="size-6 animate-spin" aria-hidden />
      </div>
    )
  }

  if (view.kind === "ask-email" || view.kind === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold">Xem đơn hàng</h1>
        <p className="text-muted-foreground mt-1 mb-6 text-sm">
          {view.kind === "error" ? view.message : "Nhập email đã dùng khi đặt hàng để xem đơn này."}
        </p>
        <OrderLookupForm
          initialOrder={id}
          onFound={(order, email) => {
            rememberLookup(order.id, email)
            setView({ kind: "ready", order })
          }}
        />
      </div>
    )
  }

  const { order } = view
  const progress = deriveProgress(order.jobs)
  const tracking = trackingNumbers(order.jobs)
  const window = deliveryWindow(order.created_at)
  const address = order.shipping_address

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng {orderLabel(order)}</h1>
          <p className="text-muted-foreground text-sm">
            Đặt ngày {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(order.created_at))}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={refreshing}>
          <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} aria-hidden />
          Cập nhật
        </Button>
      </header>

      <section className="rounded-xl border p-5">
        <ProgressTracker progress={progress} />
        {tracking.length > 0 && (
          <p className="mt-4 text-sm">
            Mã vận đơn: <span className="font-mono font-medium">{tracking.join(", ")}</span>
          </p>
        )}
        {!progress.cancelled && progress.step < 3 && (
          <p className="text-muted-foreground mt-2 text-sm">
            Dự kiến giao: {day(window.from)} – {day(window.to)} (3-5 ngày làm việc)
          </p>
        )}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="mb-4 font-semibold">Sản phẩm</h2>
        <OrderItems items={order.items} jobs={order.jobs} />
        <dl className="mt-5 space-y-1.5 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tạm tính</dt>
            <dd>{formatVND(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phí vận chuyển</dt>
            <dd>{formatVND(order.shipping_total)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Tổng cộng</dt>
            <dd>{formatVND(order.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl border p-5 text-sm">
          <h2 className="mb-2 font-semibold">Giao đến</h2>
          {address ? (
            <p className="text-muted-foreground">
              {address.name} · {address.phone}
              <br />
              {[address.line, address.ward, address.province].filter(Boolean).join(", ")}
            </p>
          ) : (
            <p className="text-muted-foreground">Chưa có địa chỉ</p>
          )}
          {order.note && <p className="text-muted-foreground mt-2">Ghi chú: {order.note}</p>}
        </section>
        <section className="rounded-xl border p-5 text-sm">
          <h2 className="mb-2 font-semibold">Thanh toán</h2>
          <p className="text-muted-foreground">
            {PAYMENT_METHOD_LABEL[order.payment.method] ?? order.payment.method}
            <br />
            {paymentStatusLabel(order.payment.method, order.payment.status)}
          </p>
        </section>
      </div>

      <p className="text-center text-sm">
        <Link href="/orders" className="text-muted-foreground underline">
          Tra cứu đơn hàng khác
        </Link>
      </p>
    </div>
  )
}
