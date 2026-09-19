import { medusa } from "@/lib/medusa"
import type { CheckoutFormValues } from "./schema"

/** Medusa's built-in manual provider: the order is placed and cash is collected on delivery */
export const COD_PROVIDER_ID = "pp_system_default"

export interface ShippingChoice {
  id: string
  name: string
  description: string
  amount: number
}

export interface PlacedOrder {
  id: string
  displayId: number | null
  email: string | null
  currency: string
  subtotal: number
  shippingTotal: number
  total: number
  address: {
    name: string
    phone: string
    line: string
    ward: string
    province: string
  } | null
  items: { id: string; title: string; quantity: number; unitPrice: number; thumbnail: string | null }[]
}

export interface PlaceOrderInput {
  cartId: string
  form: CheckoutFormValues
  provinceName: string
  wardName: string
  shippingOptionId: string
}

const VN = "vn"

/** Cheapest first; the store ships to one country, so the options do not depend on the address form */
export async function listShippingChoices(cartId: string): Promise<ShippingChoice[]> {
  const { shipping_options } = await medusa.store.fulfillment.listCartOptions({ cart_id: cartId })
  return (shipping_options as RawShippingOption[])
    .map((o) => ({
      id: o.id,
      name: o.name,
      description: o.type?.description ?? "",
      amount: o.amount ?? o.calculated_price?.calculated_amount ?? 0,
    }))
    .sort((a, b) => a.amount - b.amount)
}

export function toShippingAddress(form: CheckoutFormValues, provinceName: string, wardName: string) {
  return {
    first_name: form.fullName.trim(),
    last_name: "",
    phone: form.phone.trim(),
    address_1: form.addressLine.trim(),
    address_2: wardName,
    city: provinceName,
    province: provinceName,
    country_code: VN,
  }
}

/** The slice of Medusa's completed order this store reads */
export interface CompletedOrder {
  id: string
  display_id?: number | null
  email?: string | null
  currency_code: string
  item_subtotal?: number
  subtotal?: number
  shipping_total?: number
  total: number
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    address_1?: string | null
    address_2?: string | null
    city?: string | null
  } | null
  items?: { id: string; title: string; quantity: number; unit_price: number; thumbnail?: string | null }[] | null
}

interface RawShippingOption {
  id: string
  name: string
  amount?: number | null
  calculated_price?: { calculated_amount?: number | null } | null
  type?: { description?: string | null } | null
}

export function summarizeOrder(order: CompletedOrder, wardName: string, provinceName: string): PlacedOrder {
  const a = order.shipping_address
  return {
    id: order.id,
    displayId: order.display_id ?? null,
    email: order.email ?? null,
    currency: order.currency_code,
    subtotal: order.item_subtotal ?? order.subtotal ?? 0,
    shippingTotal: order.shipping_total ?? 0,
    total: order.total,
    address: a
      ? {
          name: [a.first_name, a.last_name].filter(Boolean).join(" "),
          phone: a.phone ?? "",
          line: a.address_1 ?? "",
          ward: a.address_2 || wardName,
          province: a.city || provinceName,
        }
      : null,
    items: (order.items ?? []).map((i) => ({
      id: i.id,
      title: i.title,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      thumbnail: i.thumbnail ?? null,
    })),
  }
}

/** Cash on delivery: address → shipping → payment session → complete. Throws with a message the customer can read. */
export async function placeCodOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  const { cartId, form, provinceName, wardName, shippingOptionId } = input
  const address = toShippingAddress(form, provinceName, wardName)

  await medusa.store.cart.update(cartId, {
    email: form.email.trim(),
    shipping_address: address,
    billing_address: address,
    ...(form.note ? { metadata: { note: form.note } } : {}),
  })
  await medusa.store.cart.addShippingMethod(cartId, { option_id: shippingOptionId })

  const { cart } = await medusa.store.cart.retrieve(cartId)
  await medusa.store.payment.initiatePaymentSession(cart, { provider_id: COD_PROVIDER_ID })

  const result = await medusa.store.cart.complete(cartId)
  if (result.type !== "order") {
    throw new Error(result.error?.message ?? "Không hoàn tất được đơn hàng")
  }
  return summarizeOrder(result.order as unknown as CompletedOrder, wardName, provinceName)
}

const LAST_ORDER_KEY = "tshirt_last_order"

/** The store API only shows an order to a signed-in customer, so the success page reads the order it was just given */
export function rememberOrder(order: PlacedOrder): void {
  try {
    window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
  } catch {
    // the page then shows the order number alone
  }
}

/** The stored order as text: a string is a stable snapshot for useSyncExternalStore, a parsed object is not */
export function readRememberedOrder(): string | null {
  try {
    return window.sessionStorage.getItem(LAST_ORDER_KEY)
  } catch {
    return null
  }
}

export function parseRememberedOrder(raw: string | null, id: string): PlacedOrder | null {
  if (!raw) return null
  try {
    const order = JSON.parse(raw) as PlacedOrder
    return order.id === id ? order : null
  } catch {
    return null
  }
}

export const recallOrder = (id: string): PlacedOrder | null => parseRememberedOrder(readRememberedOrder(), id)
