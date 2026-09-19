import { beforeEach, describe, expect, it, vi } from "vitest"

const sdk = {
  region: { list: vi.fn() },
  cart: {
    create: vi.fn(),
    retrieve: vi.fn(),
    createLineItem: vi.fn(),
    updateLineItem: vi.fn(),
    deleteLineItem: vi.fn(),
  },
}
vi.mock("@/lib/medusa", () => ({ medusa: { store: sdk } }))

const storage = new Map<string, string>()
vi.stubGlobal("window", {
  localStorage: {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => void storage.set(k, v),
    removeItem: (k: string) => void storage.delete(k),
  },
})

const line = (id: string, quantity = 1) => ({ id, title: "Tee", quantity, unit_price: 100 })
const cartOf = (id: string, items: ReturnType<typeof line>[] = []) => ({ id, currency_code: "vnd", items })

async function fresh() {
  vi.resetModules()
  const mod = await import("../cart.store")
  return mod
}

beforeEach(() => {
  storage.clear()
  Object.values(sdk.cart).forEach((f) => f.mockReset())
  sdk.region.list.mockReset().mockResolvedValue({ regions: [{ id: "reg_1" }] })
})

describe("hydrate", () => {
  it("creates a cart in the first region and remembers its id", async () => {
    sdk.cart.create.mockResolvedValue({ cart: cartOf("cart_new") })
    const { useCartStore } = await fresh()
    await useCartStore.getState().hydrate()

    expect(sdk.cart.create).toHaveBeenCalledWith({ region_id: "reg_1" })
    expect(useCartStore.getState().status).toBe("ready")
    expect(storage.get("tshirt_cart_id")).toBe("cart_new")
  })

  it("reuses the stored cart", async () => {
    storage.set("tshirt_cart_id", "cart_old")
    sdk.cart.retrieve.mockResolvedValue({ cart: cartOf("cart_old", [line("l1", 2)]) })
    const { useCartStore, selectCount } = await fresh()
    await useCartStore.getState().hydrate()

    expect(sdk.cart.create).not.toHaveBeenCalled()
    expect(selectCount(useCartStore.getState())).toBe(2)
  })

  it.each([
    ["is gone", () => sdk.cart.retrieve.mockRejectedValue(new Error("404"))],
    ["was already ordered", () => sdk.cart.retrieve.mockResolvedValue({ cart: { ...cartOf("cart_old"), completed_at: "2026-01-01" } })],
  ])("starts a new cart when the stored one %s", async (_l, arrange) => {
    storage.set("tshirt_cart_id", "cart_old")
    arrange()
    sdk.cart.create.mockResolvedValue({ cart: cartOf("cart_new") })
    const { useCartStore } = await fresh()
    await useCartStore.getState().hydrate()

    expect(useCartStore.getState().cart?.id).toBe("cart_new")
    expect(storage.get("tshirt_cart_id")).toBe("cart_new")
  })

  it("reports an error when there is no sales region", async () => {
    sdk.region.list.mockResolvedValue({ regions: [] })
    const { useCartStore } = await fresh()
    await useCartStore.getState().hydrate()
    expect(useCartStore.getState().status).toBe("error")
    expect(useCartStore.getState().error).toContain("khu vực")
  })
})

describe("selectors", () => {
  it("return the same array while the cart is empty, so React can tell nothing changed", async () => {
    const { useCartStore, selectItems } = await fresh()
    const a = selectItems(useCartStore.getState())
    const b = selectItems(useCartStore.getState())
    expect(a).toBe(b)
    expect(a).toEqual([])
  })
})

describe("restore", () => {
  it("loads an existing cart without ever creating one", async () => {
    storage.set("tshirt_cart_id", "cart_old")
    sdk.cart.retrieve.mockResolvedValue({ cart: cartOf("cart_old", [line("l1", 4)]) })
    const { useCartStore, selectCount } = await fresh()
    await useCartStore.getState().restore()
    expect(selectCount(useCartStore.getState())).toBe(4)
    expect(sdk.cart.create).not.toHaveBeenCalled()
  })

  it("does nothing for a first-time visitor", async () => {
    const { useCartStore } = await fresh()
    await useCartStore.getState().restore()
    expect(useCartStore.getState().cart).toBeNull()
    expect(sdk.cart.retrieve).not.toHaveBeenCalled()
    expect(sdk.cart.create).not.toHaveBeenCalled()
  })

  it("ignores a cart that is gone or already ordered", async () => {
    storage.set("tshirt_cart_id", "cart_old")
    sdk.cart.retrieve.mockResolvedValue({ cart: { ...cartOf("cart_old"), completed_at: "2026-01-01" } })
    const { useCartStore } = await fresh()
    await useCartStore.getState().restore()
    expect(useCartStore.getState().cart).toBeNull()
  })
})

describe("mutations", () => {
  async function ready(items = [line("l1", 2)]) {
    storage.set("tshirt_cart_id", "cart_1")
    sdk.cart.retrieve.mockResolvedValue({ cart: cartOf("cart_1", items) })
    const mod = await fresh()
    await mod.useCartStore.getState().hydrate()
    return mod.useCartStore
  }

  it("adds a design with its metadata and a clamped quantity", async () => {
    const store = await ready([])
    sdk.cart.createLineItem.mockResolvedValue({ cart: cartOf("cart_1", [line("l9")]) })
    await store.getState().addDesign({ variantId: "var_1", quantity: 500, metadata: { designs: [] } })

    expect(sdk.cart.createLineItem).toHaveBeenCalledWith("cart_1", {
      variant_id: "var_1",
      quantity: 100,
      metadata: { designs: [] },
    })
    expect(store.getState().cart?.items).toHaveLength(1)
  })

  it("creates the cart on the fly when adding to an empty session", async () => {
    sdk.cart.create.mockResolvedValue({ cart: cartOf("cart_new") })
    sdk.cart.createLineItem.mockResolvedValue({ cart: cartOf("cart_new", [line("l1")]) })
    const { useCartStore } = await fresh()
    await useCartStore.getState().addDesign({ variantId: "v", quantity: 1, metadata: {} })
    expect(sdk.cart.createLineItem.mock.calls[0][0]).toBe("cart_new")
  })

  it("shows a new quantity at once and settles on the server's answer", async () => {
    const store = await ready()
    let seen = 0
    sdk.cart.updateLineItem.mockImplementation(async () => {
      seen = store.getState().cart!.items[0].quantity
      return { cart: cartOf("cart_1", [line("l1", 5)]) }
    })
    await store.getState().setQuantity("l1", 5)

    expect(seen).toBe(5)
    expect(store.getState().cart?.items[0].quantity).toBe(5)
    expect(store.getState().busyLineId).toBeNull()
  })

  it("rolls back and reports when a quantity change fails", async () => {
    const store = await ready()
    sdk.cart.updateLineItem.mockRejectedValue(new Error("Hết hàng"))
    await expect(store.getState().setQuantity("l1", 9)).rejects.toThrow("Hết hàng")

    expect(store.getState().cart?.items[0].quantity).toBe(2)
    expect(store.getState().error).toBe("Hết hàng")
    expect(store.getState().busyLineId).toBeNull()
  })

  it("removes a line and restores it if the server refuses", async () => {
    const store = await ready()
    sdk.cart.deleteLineItem.mockResolvedValue({ parent: cartOf("cart_1", []) })
    await store.getState().remove("l1")
    expect(store.getState().cart?.items).toHaveLength(0)

    const again = await ready()
    sdk.cart.deleteLineItem.mockRejectedValue(new Error("boom"))
    await expect(again.getState().remove("l1")).rejects.toThrow("boom")
    expect(again.getState().cart?.items).toHaveLength(1)
  })

  it("replaces a design while keeping the quantity", async () => {
    const store = await ready([line("l1", 3)])
    sdk.cart.updateLineItem.mockResolvedValue({ cart: cartOf("cart_1", [line("l1", 3)]) })
    await store.getState().replaceDesign("l1", { designs: ["new"] })

    expect(sdk.cart.updateLineItem).toHaveBeenCalledWith("cart_1", "l1", { quantity: 3, metadata: { designs: ["new"] } })
  })

  it("will not replace a design on a line that is gone", async () => {
    const store = await ready()
    await expect(store.getState().replaceDesign("nope", {})).rejects.toThrow("không còn")
    expect(sdk.cart.updateLineItem).not.toHaveBeenCalled()
  })
})

describe("clear", () => {
  it("forgets the cart and its stored id", async () => {
    storage.set("tshirt_cart_id", "cart_1")
    sdk.cart.retrieve.mockResolvedValue({ cart: cartOf("cart_1", [line("li_1")]) })
    const { useCartStore } = await fresh()
    await useCartStore.getState().hydrate()

    useCartStore.getState().clear()

    expect(useCartStore.getState().cart).toBeNull()
    expect(useCartStore.getState().status).toBe("idle")
    expect(storage.has("tshirt_cart_id")).toBe(false)
  })
})
