import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_MEDUSA_URL: "http://api.test", NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_test" },
}))

const store = new Map<string, string>()
vi.stubGlobal("window", {
  sessionStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  },
})

import { lookupOrder, orderLabel, recallLookup, rememberLookup } from "../api"

const fetchMock = vi.fn()
beforeEach(() => {
  store.clear()
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status })

describe("lookupOrder", () => {
  it("posts the trimmed number and email with the publishable key", async () => {
    fetchMock.mockResolvedValue(reply(200, { order: { id: "order_1", display_id: 2 } }))
    const order = await lookupOrder({ order: " #2 ", email: " a@b.co " })

    expect(order.id).toBe("order_1")
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("http://api.test/store/order-lookup")
    expect(init.headers["x-publishable-api-key"]).toBe("pk_test")
    expect(JSON.parse(init.body)).toEqual({ order: "#2", email: "a@b.co" })
  })

  it("shows the server's message, and a fallback when there is none", async () => {
    fetchMock.mockResolvedValueOnce(reply(404, { message: "Không tìm thấy đơn hàng" }))
    await expect(lookupOrder({ order: "#9", email: "a@b.co" })).rejects.toThrow("Không tìm thấy đơn hàng")

    fetchMock.mockResolvedValueOnce(new Response("<html>", { status: 502 }))
    await expect(lookupOrder({ order: "#9", email: "a@b.co" })).rejects.toThrow("(502)")
  })
})

describe("remembered lookup", () => {
  it("returns the email only for the order it opened", () => {
    rememberLookup("order_1", "a@b.co")
    expect(recallLookup("order_1")).toBe("a@b.co")
    expect(recallLookup("order_2")).toBeNull()
  })
})

describe("orderLabel", () => {
  it("prefers the short number", () => {
    expect(orderLabel({ id: "order_1", display_id: 12 })).toBe("#12")
    expect(orderLabel({ id: "order_1", display_id: 0 })).toBe("order_1")
  })
})
