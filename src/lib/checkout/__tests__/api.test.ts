import { beforeEach, describe, expect, it, vi } from "vitest"

const sdk = vi.hoisted(() => ({
  cart: { update: vi.fn(), addShippingMethod: vi.fn(), retrieve: vi.fn(), complete: vi.fn() },
  fulfillment: { listCartOptions: vi.fn() },
  payment: { initiatePaymentSession: vi.fn() },
}))
vi.mock("@/lib/medusa", () => ({ medusa: { store: sdk } }))

const store = new Map<string, string>()
vi.stubGlobal("window", {
  sessionStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  },
})

import {
  COD_PROVIDER_ID,
  listShippingChoices,
  placeCodOrder,
  recallOrder,
  rememberOrder,
  summarizeOrder,
  toShippingAddress,
  type CompletedOrder,
} from "../api"

const form = {
  fullName: " Nguyễn Văn A ",
  phone: "0912345678",
  email: " a@example.com ",
  provinceCode: "1",
  wardCode: "4",
  addressLine: " 12 Phố Huế ",
  paymentMethod: "cod" as const,
}

const order: CompletedOrder = {
  id: "order_1",
  display_id: 7,
  email: "a@example.com",
  currency_code: "vnd",
  item_subtotal: 398000,
  shipping_total: 25000,
  total: 423000,
  shipping_address: { first_name: "Nguyễn Văn A", last_name: "", phone: "0912345678", address_1: "12 Phố Huế", address_2: "Phường Ba Đình", city: "Thành phố Hà Nội" },
  items: [{ id: "li_1", title: "Tee", quantity: 2, unit_price: 199000, thumbnail: null }],
}

beforeEach(() => {
  store.clear()
  sdk.cart.update.mockReset().mockResolvedValue({})
  sdk.cart.addShippingMethod.mockReset().mockResolvedValue({})
  sdk.cart.retrieve.mockReset().mockResolvedValue({ cart: { id: "cart_1" } })
  sdk.cart.complete.mockReset().mockResolvedValue({ type: "order", order })
  sdk.fulfillment.listCartOptions.mockReset()
  sdk.payment.initiatePaymentSession.mockReset().mockResolvedValue({})
})

describe("listShippingChoices", () => {
  it("lists options cheapest first without touching the cart", async () => {
    sdk.fulfillment.listCartOptions.mockResolvedValue({
      shipping_options: [
        { id: "so_far", name: "Liên tỉnh", amount: 35000, type: { description: "3-5 ngày" } },
        { id: "so_near", name: "Nội thành", calculated_price: { calculated_amount: 25000 } },
      ],
    })
    const choices = await listShippingChoices("cart_1")

    expect(sdk.fulfillment.listCartOptions).toHaveBeenCalledWith({ cart_id: "cart_1" })
    expect(sdk.cart.update).not.toHaveBeenCalled()
    expect(choices.map((c) => [c.id, c.amount])).toEqual([["so_near", 25000], ["so_far", 35000]])
    expect(choices[1].description).toBe("3-5 ngày")
  })
})

describe("toShippingAddress", () => {
  it("trims, keeps the ward in address_2 and ships to Vietnam", () => {
    expect(toShippingAddress(form, "Thành phố Hà Nội", "Phường Ba Đình")).toEqual({
      first_name: "Nguyễn Văn A",
      last_name: "",
      phone: "0912345678",
      address_1: "12 Phố Huế",
      address_2: "Phường Ba Đình",
      city: "Thành phố Hà Nội",
      province: "Thành phố Hà Nội",
      country_code: "vn",
    })
  })
})

describe("placeCodOrder", () => {
  const input = { cartId: "cart_1", form, provinceName: "Thành phố Hà Nội", wardName: "Phường Ba Đình", shippingOptionId: "so_1" }

  it("runs the steps in order and returns the order", async () => {
    const placed = await placeCodOrder({ ...input, form: { ...form, note: "Giao buổi sáng" } })

    const calls = [
      sdk.cart.update,
      sdk.cart.addShippingMethod,
      sdk.payment.initiatePaymentSession,
      sdk.cart.complete,
    ].map((f) => f.mock.invocationCallOrder[0])
    expect([...calls].sort((a, b) => a - b)).toEqual(calls)

    const update = sdk.cart.update.mock.calls[0]
    expect(update[1].email).toBe("a@example.com")
    expect(update[1].metadata).toEqual({ note: "Giao buổi sáng" })
    expect(sdk.cart.addShippingMethod).toHaveBeenCalledWith("cart_1", { option_id: "so_1" })
    expect(sdk.payment.initiatePaymentSession).toHaveBeenCalledWith({ id: "cart_1" }, { provider_id: COD_PROVIDER_ID })
    expect(placed).toMatchObject({ id: "order_1", displayId: 7, total: 423000, shippingTotal: 25000 })
  })

  it("does not send an empty note", async () => {
    await placeCodOrder(input)
    expect(sdk.cart.update.mock.calls[0][1]).not.toHaveProperty("metadata")
  })

  it("stops before completing when a step fails", async () => {
    sdk.cart.addShippingMethod.mockRejectedValue(new Error("no shipping"))
    await expect(placeCodOrder(input)).rejects.toThrow("no shipping")
    expect(sdk.cart.complete).not.toHaveBeenCalled()
  })

  it("surfaces Medusa's reason when the cart does not become an order", async () => {
    sdk.cart.complete.mockResolvedValue({ type: "cart", error: { message: "Hết hàng" } })
    await expect(placeCodOrder(input)).rejects.toThrow("Hết hàng")
  })
})

describe("summarizeOrder", () => {
  it("falls back to the form's ward and province when the order has no address", () => {
    const s = summarizeOrder({ ...order, shipping_address: null }, "Phường X", "Tỉnh Y")
    expect(s.address).toBeNull()
    const t = summarizeOrder({ ...order, shipping_address: { first_name: "A", address_1: "1 Phố" } }, "Phường X", "Tỉnh Y")
    expect(t.address).toMatchObject({ ward: "Phường X", province: "Tỉnh Y" })
  })
})

describe("remembered order", () => {
  it("is only recalled for the same order id", () => {
    rememberOrder(summarizeOrder(order, "", ""))
    expect(recallOrder("order_1")?.total).toBe(423000)
    expect(recallOrder("order_2")).toBeNull()
  })
})
