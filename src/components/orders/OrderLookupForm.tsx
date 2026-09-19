"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/checkout/Field"
import { lookupOrder, type TrackedOrder } from "@/lib/orders/api"

interface Props {
  initialOrder?: string
  onFound: (order: TrackedOrder, email: string) => void
}

export function OrderLookupForm({ initialOrder = "", onFound }: Props) {
  const [order, setOrder] = useState(initialOrder)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!order.trim() || !email.trim()) {
      setError("Nhập mã đơn hàng và email đã dùng khi đặt hàng")
      return
    }
    setBusy(true)
    setError(null)
    try {
      onFound(await lookupOrder({ order, email }), email.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tra cứu được đơn hàng")
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="lookup-order" label="Mã đơn hàng">
        <Input
          id="lookup-order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="Ví dụ: #12"
          autoComplete="off"
        />
      </Field>
      <Field id="lookup-email" label="Email đặt hàng">
        <Input
          id="lookup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Tra cứu đơn hàng"}
      </Button>
    </form>
  )
}
