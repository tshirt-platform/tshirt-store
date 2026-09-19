import { describe, expect, it } from "vitest"
import { friendlyError, isNetworkError } from "../errors"

describe("isNetworkError", () => {
  it.each(["Failed to fetch", "NetworkError when attempting to fetch resource.", "Load failed"])(
    "recognises the browser's %j",
    (message) => expect(isNetworkError(new TypeError(message))).toBe(true)
  )

  it("does not mistake other errors for it", () => {
    expect(isNetworkError(new Error("Failed to fetch"))).toBe(false)
    expect(isNetworkError(new TypeError("x is not a function"))).toBe(false)
    expect(isNetworkError("Failed to fetch")).toBe(false)
  })
})

describe("friendlyError", () => {
  it("replaces a network failure with something the customer can act on", () => {
    expect(friendlyError(new TypeError("Failed to fetch"), "fallback")).toMatch(/kết nối/)
  })

  it("passes through a real message and falls back otherwise", () => {
    expect(friendlyError(new Error("Hết hàng"), "fallback")).toBe("Hết hàng")
    expect(friendlyError(new Error(""), "fallback")).toBe("fallback")
    expect(friendlyError("boom", "fallback")).toBe("fallback")
    expect(friendlyError(undefined, "fallback")).toBe("fallback")
  })
})
