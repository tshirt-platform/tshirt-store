import { env } from "@/lib/env"

export interface TrackedJob {
  id: string
  order_item_id: string | null
  side: "front" | "back" | null
  status: string
  tracking_number: string | null
}

export interface TrackedItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail: string | null
  designs: { side: "front" | "back"; image_url: string }[]
  garment: { color_name?: string; size?: string } | null
}

export interface TrackedOrder {
  id: string
  display_id: number
  created_at: string
  currency_code: string
  items: TrackedItem[]
  subtotal: number
  shipping_total: number
  total: number
  shipping_address: { name: string; phone: string; line: string; ward: string; province: string } | null
  payment: { method: string; status: string }
  note: string | null
  jobs: TrackedJob[]
}

/** The order number as customers know it, or the full id when there is no number */
export const orderLabel = (o: Pick<TrackedOrder, "id" | "display_id">) => (o.display_id ? `#${o.display_id}` : o.id)

/** Looks an order up by number and email; no account is involved */
export async function lookupOrder(input: { order: string; email: string }): Promise<TrackedOrder> {
  const res = await fetch(`${env.NEXT_PUBLIC_MEDUSA_URL}/store/order-lookup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ order: input.order.trim(), email: input.email.trim() }),
  })
  const body = (await res.json().catch(() => ({}))) as { order?: TrackedOrder; message?: string }
  if (!res.ok || !body.order) {
    throw new Error(body.message ?? `Không tra cứu được đơn hàng (${res.status})`)
  }
  return body.order
}

const LOOKUP_KEY = "tshirt_order_lookup"

/**
 * Remembers, for this tab only, which email opened which order, so the order page
 * can reload without asking again. The email never goes into a URL.
 */
export function rememberLookup(orderId: string, email: string): void {
  try {
    window.sessionStorage.setItem(LOOKUP_KEY, JSON.stringify({ orderId, email }))
  } catch {
    // the order page then asks for the email
  }
}

export function recallLookup(orderId: string): string | null {
  try {
    const raw = window.sessionStorage.getItem(LOOKUP_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as { orderId?: string; email?: string }
    return saved.orderId === orderId && typeof saved.email === "string" ? saved.email : null
  } catch {
    return null
  }
}
