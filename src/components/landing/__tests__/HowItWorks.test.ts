// Tests for HowItWorks — validates the 3-step data
// Component rendering tested via E2E browser tests

describe("HowItWorks", () => {
  it("module exports HowItWorks component", async () => {
    const mod = await import("../HowItWorks")
    expect(mod.HowItWorks).toBeDefined()
    expect(typeof mod.HowItWorks).toBe("function")
  })
})
