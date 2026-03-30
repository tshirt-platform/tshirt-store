import { describe, it, expect, vi, beforeEach } from "vitest"

// We test createEnv behavior directly since env.ts runs at import time
describe("env", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("throws on missing required NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", async () => {
    vi.stubEnv("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", "")
    vi.stubEnv("NEXT_PUBLIC_MEDUSA_URL", "http://localhost:9000")
    vi.stubEnv("NEXT_PUBLIC_STORE_URL", "http://localhost:3000")

    await expect(async () => {
      await import("../env")
    }).rejects.toThrow()
  })

  it("returns typed env when all required vars present", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
      "pk_test_123"
    )
    vi.stubEnv("NEXT_PUBLIC_MEDUSA_URL", "http://localhost:9000")
    vi.stubEnv("NEXT_PUBLIC_STORE_URL", "http://localhost:3000")

    const { env } = await import("../env")

    expect(env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY).toBe("pk_test_123")
    expect(env.NEXT_PUBLIC_MEDUSA_URL).toBe("http://localhost:9000")
    expect(env.NEXT_PUBLIC_STORE_URL).toBe("http://localhost:3000")
  })
})
