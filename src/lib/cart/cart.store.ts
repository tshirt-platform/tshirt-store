import { create } from "zustand"
import * as api from "./api"
import { clampQuantity, itemCount, type CartLine } from "./line-item"

interface CartState {
  cart: api.Cart | null
  status: "idle" | "loading" | "ready" | "error"
  /** Line being changed, so its row can show a spinner */
  busyLineId: string | null
  error: string | null
  hydrate: () => Promise<void>
  /** Loads the cart only if this visitor already has one (header badge) */
  restore: () => Promise<void>
  addDesign: (input: {
    variantId: string
    quantity: number
    metadata: Record<string, unknown>
  }) => Promise<void>
  setQuantity: (lineId: string, quantity: number) => Promise<void>
  replaceDesign: (lineId: string, metadata: Record<string, unknown>) => Promise<void>
  remove: (lineId: string) => Promise<void>
}

const message = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback)

export const useCartStore = create<CartState>((set, get) => {
  /** Runs a cart change, keeping the previous cart if it fails */
  async function mutate(
    lineId: string | null,
    optimistic: ((cart: api.Cart) => api.Cart) | null,
    run: (cartId: string, cart: api.Cart) => Promise<api.Cart>
  ): Promise<void> {
    if (!get().cart) await get().hydrate()
    const previous = get().cart
    if (!previous) throw new Error(get().error ?? "Không mở được giỏ hàng")

    set({ busyLineId: lineId, error: null, ...(optimistic ? { cart: optimistic(previous) } : {}) })
    try {
      set({ cart: await run(previous.id, previous), busyLineId: null })
    } catch (e) {
      set({ cart: previous, busyLineId: null, error: message(e, "Không cập nhật được giỏ hàng") })
      throw e
    }
  }

  return {
    cart: null,
    status: "idle",
    busyLineId: null,
    error: null,

    hydrate: async () => {
      set({ status: "loading", error: null })
      try {
        set({ cart: await api.loadOrCreateCart(), status: "ready" })
      } catch (e) {
        set({ status: "error", error: message(e, "Không tải được giỏ hàng") })
      }
    },

    restore: async () => {
      if (get().cart) return
      const cart = await api.loadExistingCart()
      if (cart) set({ cart, status: "ready" })
    },

    addDesign: ({ variantId, quantity, metadata }) =>
      mutate(null, null, (id) => api.addLine(id, { variantId, quantity: clampQuantity(quantity), metadata })),

    setQuantity: (lineId, quantity) => {
      const q = clampQuantity(quantity)
      return mutate(
        lineId,
        (cart) => ({ ...cart, items: cart.items.map((l) => (l.id === lineId ? { ...l, quantity: q } : l)) }),
        (id) => api.updateLine(id, lineId, { quantity: q })
      )
    },

    replaceDesign: (lineId, metadata) =>
      mutate(lineId, null, (id, cart) => {
        const line = cart.items.find((l) => l.id === lineId)
        if (!line) throw new Error("Sản phẩm không còn trong giỏ hàng")
        return api.updateLine(id, lineId, { quantity: line.quantity, metadata })
      }),

    remove: (lineId) =>
      mutate(
        lineId,
        (cart) => ({ ...cart, items: cart.items.filter((l) => l.id !== lineId) }),
        (id) => api.removeLine(id, lineId)
      ),
  }
})

// A fresh [] per call would make React think the store changed on every render
const NO_ITEMS: CartLine[] = []
export const selectItems = (s: CartState): CartLine[] => s.cart?.items ?? NO_ITEMS
export const selectCount = (s: CartState): number => itemCount(selectItems(s))
