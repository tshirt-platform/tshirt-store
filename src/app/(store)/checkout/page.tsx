"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckoutForm, type SubmittedAddress } from "@/components/checkout/CheckoutForm"
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary"
import { ShippingChoices } from "@/components/checkout/ShippingChoices"
import { useCartStore, selectItems } from "@/lib/cart/cart.store"
import { cartSubtotal } from "@/lib/cart/line-item"
import {
  listShippingChoices,
  placeCodOrder,
  rememberOrder,
  type ShippingChoice,
} from "@/lib/checkout/api"
import type { CheckoutFormValues } from "@/lib/checkout/schema"

const FORM_ID = "checkout-form"

export default function CheckoutPage() {
  const router = useRouter()
  const status = useCartStore((s) => s.status)
  const cartId = useCartStore((s) => s.cart?.id ?? null)
  const items = useCartStore(selectItems)

  const [choices, setChoices] = useState<ShippingChoice[] | null>(null)
  const [choiceError, setChoiceError] = useState<string | null>(null)
  const [shippingId, setShippingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Once the order exists the cart is emptied; that must not bounce the customer back to /cart
  const [placed, setPlaced] = useState(false)

  useEffect(() => {
    void useCartStore.getState().hydrate()
  }, [])

  useEffect(() => {
    if (status === "ready" && items.length === 0 && !placed) router.replace("/cart")
  }, [status, items.length, placed, router])

  useEffect(() => {
    if (!cartId) return
    let cancelled = false
    listShippingChoices(cartId)
      .then((list) => {
        if (cancelled) return
        setChoices(list)
        setShippingId((current) => current ?? list[0]?.id ?? null)
      })
      .catch((e: unknown) => {
        if (!cancelled) setChoiceError(e instanceof Error ? e.message : "Không tải được phương thức vận chuyển")
      })
    return () => {
      cancelled = true
    }
  }, [cartId])

  async function submit(form: CheckoutFormValues, names: SubmittedAddress) {
    if (!cartId || !shippingId) return
    setSubmitting(true)
    try {
      const order = await placeCodOrder({ cartId, form, shippingOptionId: shippingId, ...names })
      setPlaced(true)
      rememberOrder(order)
      useCartStore.getState().clear()
      router.push(`/checkout/success?orderId=${encodeURIComponent(order.id)}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không đặt được hàng, vui lòng thử lại")
      setSubmitting(false)
    }
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-red-600">Không tải được giỏ hàng</p>
        <Button variant="outline" onClick={() => void useCartStore.getState().hydrate()}>Thử lại</Button>
      </div>
    )
  }

  // After the order the cart is empty on purpose; keep the page (and its overlay) until the success page loads
  if (items.length === 0 && !placed) {
    return <p className="text-muted-foreground py-24 text-center text-sm">Đang tải…</p>
  }

  const chosen = choices?.find((c) => c.id === shippingId) ?? null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Thanh toán</h1>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-8">
          <CheckoutForm id={FORM_ID} disabled={submitting} onSubmit={submit} />

          <section className="space-y-3">
            <h2 className="font-semibold">Vận chuyển</h2>
            {choiceError && (
              <p role="alert" className="text-sm text-red-600">{choiceError}</p>
            )}
            {!choices && !choiceError && (
              <p className="text-muted-foreground text-sm">Đang tải phương thức vận chuyển…</p>
            )}
            {choices && choices.length === 0 && (
              <p className="text-sm text-red-600">Hiện chưa có phương thức vận chuyển khả dụng.</p>
            )}
            {choices && choices.length > 0 && (
              <ShippingChoices choices={choices} value={shippingId} onChange={setShippingId} />
            )}
          </section>
        </div>

        <CheckoutSummary
          items={items}
          subtotal={cartSubtotal(items)}
          shipping={chosen?.amount ?? null}
          formId={FORM_ID}
          submitting={submitting}
          canSubmit={chosen !== null}
        />
      </div>

      {submitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm" role="status">
          <Loader2 className="size-8 animate-spin" aria-hidden />
          <p className="text-sm font-medium">Đang xử lý đơn hàng...</p>
        </div>
      )}
    </div>
  )
}
