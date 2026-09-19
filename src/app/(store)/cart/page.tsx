"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/components/cart/CartItem"
import { CartSkeleton } from "@/components/cart/CartSkeleton"
import { EmptyCart } from "@/components/cart/EmptyCart"
import { OrderSummary } from "@/components/cart/OrderSummary"
import { useCartStore, selectItems, selectCount } from "@/lib/cart/cart.store"
import { cartSubtotal } from "@/lib/cart/line-item"
import { friendlyError } from "@/lib/errors"

export default function CartPage() {
  const status = useCartStore((s) => s.status)
  const error = useCartStore((s) => s.error)
  const busyLineId = useCartStore((s) => s.busyLineId)
  const items = useCartStore(selectItems)
  const count = useCartStore(selectCount)
  const { hydrate, setQuantity, remove } = useCartStore.getState()

  useEffect(() => {
    void useCartStore.getState().hydrate()
  }, [])

  const run = (task: Promise<void>) => task.catch((e: unknown) =>
    toast.error(friendlyError(e, "Không cập nhật được giỏ hàng"))
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Giỏ hàng</h1>

      {(status === "idle" || status === "loading") && items.length === 0 && <CartSkeleton />}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={() => void hydrate()}>Thử lại</Button>
        </div>
      )}

      {status === "ready" && items.length === 0 && <EmptyCart />}

      {items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-3">
            {items.map((line) => (
              <CartItem
                key={line.id}
                line={line}
                busy={busyLineId === line.id}
                onQuantity={(q) => void run(setQuantity(line.id, q))}
                onRemove={() => void run(remove(line.id))}
              />
            ))}
          </ul>
          <OrderSummary subtotal={cartSubtotal(items)} count={count} />
        </div>
      )}
    </div>
  )
}
