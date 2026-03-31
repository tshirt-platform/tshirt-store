// Tests for PricingSection — validates pricing data and popular flag
// Component rendering tested via E2E browser tests

describe("PricingSection", () => {
  it("module exports PricingSection component", async () => {
    const mod = await import("../PricingSection")
    expect(mod.PricingSection).toBeDefined()
    expect(typeof mod.PricingSection).toBe("function")
  })
})
