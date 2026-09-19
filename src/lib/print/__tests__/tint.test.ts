import { describe, expect, it } from "vitest"
import { hexToRgb, tintLineArt } from "../tint"

function px(rgba: number[]) {
  return { data: new Uint8ClampedArray(rgba), width: rgba.length / 4, height: 1 }
}

describe("hexToRgb", () => {
  it("parses with and without the hash", () => {
    expect(hexToRgb("#1F2A44")).toEqual([31, 42, 68])
    expect(hexToRgb("C8102E")).toEqual([200, 16, 46])
  })

  it("rejects malformed colours", () => {
    expect(() => hexToRgb("#fff")).toThrow(RangeError)
    expect(() => hexToRgb("nope")).toThrow(RangeError)
  })
})

describe("tintLineArt", () => {
  it("turns the white body into the fabric colour", () => {
    const img = px([255, 255, 255, 255])
    tintLineArt(img, "#C8102E", true)
    expect(Array.from(img.data)).toEqual([200, 16, 46, 255])
  })

  it("keeps strokes dark on light fabric", () => {
    const img = px([0, 0, 0, 255])
    tintLineArt(img, "#F4F4F0", false)
    expect(Array.from(img.data)).toEqual([26, 26, 26, 255])
  })

  it("lightens strokes on dark fabric so the outline stays visible", () => {
    const img = px([0, 0, 0, 255])
    tintLineArt(img, "#1A1A1A", true)
    expect(Array.from(img.data)).toEqual([212, 212, 212, 255])
  })

  it("blends anti-aliased edge pixels between stroke and fabric", () => {
    const img = px([128, 128, 128, 255])
    tintLineArt(img, "#000000", false)
    const [r] = Array.from(img.data)
    expect(r).toBeGreaterThan(10)
    expect(r).toBeLessThan(26)
  })

  it("leaves transparent pixels and alpha untouched", () => {
    const img = px([255, 255, 255, 0, 255, 255, 255, 90])
    tintLineArt(img, "#C8102E", true)
    expect(Array.from(img.data)).toEqual([255, 255, 255, 0, 200, 16, 46, 90])
  })
})
