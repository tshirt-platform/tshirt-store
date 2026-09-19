import { medusa } from "@/lib/medusa"
import type { CartLine } from "./line-item"

export interface Cart {
  id: string
  currency_code: string
  items: CartLine[]
  completed_at?: string | null
}

const CART_KEY = "tshirt_cart_id"

// Storage can throw (private windows, blocked cookies); the cart then lives for the visit only
export function readStoredCartId(): string | null {
  try {
    return window.localStorage.getItem(CART_KEY)
  } catch {
    return null
  }
}

export function storeCartId(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(CART_KEY, id)
    else window.localStorage.removeItem(CART_KEY)
  } catch {
    // ignore
  }
}

const asCart = (c: unknown): Cart => {
  const cart = c as Cart
  return { ...cart, items: cart.items ?? [] }
}

/** The stored cart if it is still open; never creates one, so browsing does not litter carts */
export async function loadExistingCart(): Promise<Cart | null> {
  const id = readStoredCartId()
  if (!id) return null
  try {
    const { cart } = await medusa.store.cart.retrieve(id)
    return cart && !cart.completed_at ? asCart(cart) : null
  } catch {
    return null
  }
}

async function createCart(): Promise<Cart> {
  const { regions } = await medusa.store.region.list({ limit: 1 })
  if (regions.length === 0) throw new Error("Chưa có khu vực bán hàng")
  const { cart } = await medusa.store.cart.create({ region_id: regions[0].id })
  storeCartId(cart.id)
  return asCart(cart)
}

/** The visitor's open cart, or a new one when there is none, it is gone, or it was already ordered */
export async function loadOrCreateCart(): Promise<Cart> {
  const id = readStoredCartId()
  if (id) {
    try {
      const { cart } = await medusa.store.cart.retrieve(id)
      if (cart && !cart.completed_at) return asCart(cart)
    } catch {
      // unknown or expired cart: start over
    }
  }
  return createCart()
}

export async function addLine(
  cartId: string,
  input: { variantId: string; quantity: number; metadata?: Record<string, unknown> }
): Promise<Cart> {
  const { cart } = await medusa.store.cart.createLineItem(cartId, {
    variant_id: input.variantId,
    quantity: input.quantity,
    metadata: input.metadata,
  })
  return asCart(cart)
}

export async function updateLine(
  cartId: string,
  lineId: string,
  body: { quantity: number; metadata?: Record<string, unknown> }
): Promise<Cart> {
  const { cart } = await medusa.store.cart.updateLineItem(cartId, lineId, body)
  return asCart(cart)
}

export async function removeLine(cartId: string, lineId: string): Promise<Cart> {
  const res = await medusa.store.cart.deleteLineItem(cartId, lineId)
  return asCart((res as { parent?: unknown }).parent ?? res)
}
