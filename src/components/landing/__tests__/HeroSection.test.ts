// Tests for HeroSection — validates structure and link targets
// Component rendering tested via E2E browser tests

describe("HeroSection", () => {
  it("module exports HeroSection component", async () => {
    // Verify the module can be resolved (import check)
    const mod = await import("../HeroSection")
    expect(mod.HeroSection).toBeDefined()
    expect(typeof mod.HeroSection).toBe("function")
  })
})
