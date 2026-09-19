import { toArtRect } from "@tshirt-platform/shared"
import { describe, expect, it } from "vitest"
import { layoutForGarment, resolveGarment } from "@/lib/print/garment"
import { getLineArt } from "@/lib/print/lineart"
import { printRectInArt } from "../flat-preview"
import { buildCartMetadata, sideHasContent } from "../save"

const uploaded = (side: "front" | "back") => ({
  side,
  pngUrl: `https://cdn/x/${side}.png`,
  jsonUrl: `https://cdn/x/${side}.json`,
  previewUrl: `https://cdn/x/${side}.jpg`,
})

describe("sideHasContent", () => {
  it("is true only when the canvas has objects", () => {
    expect(sideHasContent(JSON.stringify({ objects: [{ type: "i-text" }] }))).toBe(true)
    expect(sideHasContent(JSON.stringify({ objects: [] }))).toBe(false)
    expect(sideHasContent(JSON.stringify({ version: "7" }))).toBe(false)
  })

  it("survives missing and corrupt data", () => {
    expect(sideHasContent(null)).toBe(false)
    expect(sideHasContent("")).toBe(false)
    expect(sideHasContent("{not json")).toBe(false)
  })
})

describe("buildCartMetadata", () => {
  const garment = resolveGarment({ productId: "p", search: { color: "Đen", size: "L" } })

  it("records where and how large each side prints", () => {
    const meta = buildCartMetadata(garment, [uploaded("front"), uploaded("back")])
    expect(meta.designs).toHaveLength(2)
    expect(meta.designs[0].placement).toEqual({
      side: "front",
      print_size_mm: { width: 264, height: 336 },
      artwork_px: { width: 3118, height: 3969 },
      dpi: 300,
      reference: "HPS",
      top_offset_mm: 130,
      horizontal_offset_mm: 0,
    })
    expect(meta.designs[1].placement.top_offset_mm).toBe(75)
  })

  it("carries the garment the print shop must pick", () => {
    expect(buildCartMetadata(garment, [uploaded("front")]).garment).toEqual({
      size: "L",
      color_name: "Đen",
      color_hex: "#1A1A1A",
      needs_underbase: true,
      supplier_color_code: null,
    })
  })

  it("mirrors the first design into the legacy fields the backend still reads", () => {
    const meta = buildCartMetadata(garment, [uploaded("back"), uploaded("front")])
    expect(meta.design_side).toBe("back")
    expect(meta.design_png_url).toBe("https://cdn/x/back.png")
    expect(meta.design_json_url).toBe("https://cdn/x/back.json")
  })

  it("refuses an empty design or a missing size", () => {
    expect(() => buildCartMetadata(garment, [])).toThrow("at least one")
    const noSize = resolveGarment({ productId: "p" })
    expect(() => buildCartMetadata(noSize, [uploaded("front")])).toThrow("size")
  })
})

describe("printRectInArt", () => {
  it("agrees with the shared toArtRect on both sides", () => {
    const garment = resolveGarment({ productId: "p" })
    for (const side of ["front", "back"] as const) {
      const layout = layoutForGarment(garment, side)
      const expected = toArtRect(layout.area, getLineArt("tshirt", side).calibration)
      const got = printRectInArt(layout)
      expect(got.x).toBeCloseTo(expected.x, 0)
      expect(got.y).toBeCloseTo(expected.y, 0)
      expect(got.width).toBeCloseTo(expected.width, 0)
      expect(got.height).toBeCloseTo(expected.height, 0)
    }
  })
})
