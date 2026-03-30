import { formatVND } from "../format"

describe("formatVND", () => {
  it("formats number as VND currency", () => {
    const result = formatVND(199000)
    expect(result).toContain("199.000")
    expect(result).toContain("₫")
  })

  it("handles zero", () => {
    const result = formatVND(0)
    expect(result).toContain("0")
  })
})
