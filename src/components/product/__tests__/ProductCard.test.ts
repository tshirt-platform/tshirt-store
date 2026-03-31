describe("ProductCard", () => {
  it("exports ProductCard component", async () => {
    const mod = await import("../ProductCard")
    expect(mod.ProductCard).toBeDefined()
    expect(typeof mod.ProductCard).toBe("function")
  })
})
