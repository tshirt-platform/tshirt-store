describe("ProductFilter", () => {
  it("exports ProductFilter component", async () => {
    const mod = await import("../ProductFilter")
    expect(mod.ProductFilter).toBeDefined()
    expect(typeof mod.ProductFilter).toBe("function")
  })
})
