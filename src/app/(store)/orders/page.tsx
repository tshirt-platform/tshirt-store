"use client"

import { useRouter } from "next/navigation"
import { OrderLookupForm } from "@/components/orders/OrderLookupForm"
import { rememberLookup } from "@/lib/orders/api"

export default function OrderLookupPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Tra cứu đơn hàng</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        Nhập mã đơn hàng và email bạn đã dùng khi đặt hàng. Không cần đăng nhập.
      </p>
      <OrderLookupForm
        onFound={(order, email) => {
          rememberLookup(order.id, email)
          router.push(`/orders/${encodeURIComponent(order.id)}`)
        }}
      />
    </div>
  )
}
