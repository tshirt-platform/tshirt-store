import { SIZE_DATA } from "../SizeChart"

describe("SizeChart", () => {
  it("exports SizeChart component", async () => {
    const mod = await import("../SizeChart")
    expect(mod.SizeChart).toBeDefined()
    expect(typeof mod.SizeChart).toBe("function")
  })

  it("has correct size data", () => {
    expect(SIZE_DATA).toHaveLength(5)
    expect(SIZE_DATA.map((s) => s.size)).toEqual([
      "S", "M", "L", "XL", "XXL",
    ])
    expect(SIZE_DATA[0].shoulder).toBe(42)
    expect(SIZE_DATA[0].chest).toBe(96)
  })
})
