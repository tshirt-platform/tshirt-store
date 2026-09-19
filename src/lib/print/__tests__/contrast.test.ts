import { describe, expect, it } from "vitest"
import { contrastRatio, isLowContrast, normalizeHex } from "../contrast"

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for identical colours", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5)
    expect(contrastRatio("#1A1A1A", "#1A1A1A")).toBe(1)
  })

  it("does not depend on argument order", () => {
    expect(contrastRatio("#C8102E", "#F4F4F0")).toBeCloseTo(
      contrastRatio("#F4F4F0", "#C8102E"),
      10
    )
  })
})

describe("normalizeHex", () => {
  it("expands short hex and rejects non-hex fills", () => {
    expect(normalizeHex("#abc")).toBe("#aabbcc")
    expect(normalizeHex(" #1A1A1A ")).toBe("#1A1A1A")
    expect(normalizeHex("rgb(0,0,0)")).toBeNull()
    expect(normalizeHex(undefined)).toBeNull()
    expect(normalizeHex({})).toBeNull()
  })
})

describe("isLowContrast", () => {
  it("flags the default dark text on the dark fabrics", () => {
    for (const garment of ["#1A1A1A", "#1F2A44", "#4A4A4A"]) {
      expect(isLowContrast("#1a1a1a", garment)).toBe(true)
    }
  })

  it("passes dark text on light fabrics and light text on dark ones", () => {
    expect(isLowContrast("#1a1a1a", "#F4F4F0")).toBe(false)
    expect(isLowContrast("#ffffff", "#1A1A1A")).toBe(false)
  })

  it("flags white text on a white shirt", () => {
    expect(isLowContrast("#ffffff", "#F4F4F0")).toBe(true)
  })

  it("never flags fills it cannot read", () => {
    expect(isLowContrast("rgba(0,0,0,0.5)", "#1A1A1A")).toBe(false)
  })
})
