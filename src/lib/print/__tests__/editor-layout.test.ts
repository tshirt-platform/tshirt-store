import {
  DEFAULT_PRINT_CONFIG_META,
  derivePrintArea,
  toArtRect,
  toGarmentMeasurements,
} from "@tshirt-platform/shared"
import { describe, expect, it } from "vitest"
import {
  buildEditorLayout,
  EDITOR_PRINT_WIDTH,
  effectiveDpi,
  exportRegion,
  initialImageScale,
  viewBounds,
} from "../editor-layout"
import { getLineArt } from "../lineart"

const measurements = toGarmentMeasurements(DEFAULT_PRINT_CONFIG_META)

function layoutFor(side: "front" | "back") {
  return buildEditorLayout(
    derivePrintArea(measurements, side),
    getLineArt("tshirt", side)
  )
}

describe("buildEditorLayout", () => {
  it("makes the print area 800 units wide with the mm aspect ratio", () => {
    const layout = layoutFor("front")
    expect(layout.width).toBe(EDITOR_PRINT_WIDTH)
    expect(layout.height / layout.width).toBeCloseTo(336 / 264, 3)
  })

  it("maps scene units to 300 DPI pixels", () => {
    const layout = layoutFor("front")
    expect(layout.multiplier).toBeCloseTo(3118 / 800, 6)
    expect(layout.width * layout.multiplier).toBeCloseTo(3118, 6)
  })

  it("puts the print area where toArtRect puts it on the drawing", () => {
    for (const side of ["front", "back"] as const) {
      const area = derivePrintArea(measurements, side)
      const art = getLineArt("tshirt", side)
      const layout = buildEditorLayout(area, art)
      const rect = toArtRect(area, art.calibration)

      // scene origin (print top-left) expressed in art pixels
      const originX = -layout.art.left / layout.art.scale
      const originY = -layout.art.top / layout.art.scale
      expect(originX).toBeCloseTo(rect.x, 0)
      expect(originY).toBeCloseTo(rect.y, 0)
      expect(layout.width / layout.art.scale).toBeCloseTo(rect.width, 0)
      expect(layout.height / layout.art.scale).toBeCloseTo(rect.height, 0)
    }
  })

  it("keeps the print area centred on the garment", () => {
    const layout = layoutFor("front")
    const art = getLineArt("tshirt", "front")
    const printCentreInArt =
      (-layout.art.left + layout.width / 2) / layout.art.scale
    expect(printCentreInArt).toBeCloseTo(art.calibration.centerX, 6)
  })

  it("keeps the print area inside the drawing", () => {
    for (const side of ["front", "back"] as const) {
      const layout = layoutFor(side)
      const v = viewBounds(layout)
      expect(0).toBeGreaterThan(v.left)
      expect(0).toBeGreaterThan(v.top)
      expect(layout.width).toBeLessThan(v.left + v.width)
      expect(layout.height).toBeLessThan(v.top + v.height)
    }
  })

  it("sizes the drawing so the body is the real flat width", () => {
    const layout = layoutFor("front")
    const art = getLineArt("tshirt", "front")
    const unitsPerMm = EDITOR_PRINT_WIDTH / layout.area.widthMm
    const bodyUnits = art.calibration.bodyWidthPx * layout.art.scale
    expect(bodyUnits / unitsPerMm).toBeCloseTo(layout.area.flatWidthMm, 6)
  })
})

describe("effectiveDpi", () => {
  it("is 300 when an image maps 1:1 to master pixels", () => {
    const layout = layoutFor("front")
    expect(effectiveDpi(1 / layout.multiplier, layout, 300)).toBeCloseTo(300, 6)
  })

  it("halves when the image is stretched to twice the size", () => {
    const layout = layoutFor("front")
    expect(effectiveDpi(2 / layout.multiplier, layout, 300)).toBeCloseTo(150, 6)
  })

  it("returns 0 for a degenerate scale", () => {
    expect(effectiveDpi(0, layoutFor("front"), 300)).toBe(0)
  })

  it("reports what a 3000px photo gives when it fills the print width", () => {
    const layout = layoutFor("front")
    const scale = layout.width / 3000
    // 3000px across 264mm ~ 289 DPI
    expect(effectiveDpi(scale, layout, 300)).toBeCloseTo(3000 / (264 / 25.4), 0)
  })
})

describe("initialImageScale", () => {
  const layout = layoutFor("front")

  it("fills 70% of the print width for a wide image", () => {
    const scale = initialImageScale(1000, 500, layout)
    expect(1000 * scale).toBeCloseTo(layout.width * 0.7, 6)
  })

  it("is capped at 90% of the print height for a tall image", () => {
    const scale = initialImageScale(200, 4000, layout)
    expect(4000 * scale).toBeCloseTo(layout.height * 0.9, 6)
    expect(200 * scale).toBeLessThan(layout.width * 0.7)
  })

  it("does not depend on the source resolution, so photos are not shrunk to a speck", () => {
    const small = 500 * initialImageScale(500, 500, layout)
    const big = 4000 * initialImageScale(4000, 4000, layout)
    expect(small).toBeCloseTo(big, 6)
  })

  it("survives a zero-sized image", () => {
    expect(initialImageScale(0, 0, layout)).toBe(1)
  })
})

describe("exportRegion", () => {
  it("renders to exactly the artwork pixel size after canvas truncation", () => {
    for (const side of ["front", "back"] as const) {
      const layout = layoutFor(side)
      const r = exportRegion(layout)
      expect(Math.trunc(r.width * layout.multiplier)).toBe(layout.area.widthPx)
      expect(Math.trunc(r.height * layout.multiplier)).toBe(layout.area.heightPx)
    }
  })

  it("holds for awkward print sizes too", () => {
    for (const widthMm of [200, 233.3, 264, 279.4]) {
      const base = layoutFor("front")
      const layout = {
        ...base,
        area: {
          ...base.area,
          widthMm,
          heightMm: widthMm * 1.2727,
          widthPx: Math.round((widthMm / 25.4) * 300),
          heightPx: Math.round(((widthMm * 1.2727) / 25.4) * 300),
        },
      }
      layout.multiplier = layout.area.widthPx / layout.width
      const r = exportRegion(layout)
      expect(Math.trunc(r.width * layout.multiplier)).toBe(layout.area.widthPx)
      expect(Math.trunc(r.height * layout.multiplier)).toBe(layout.area.heightPx)
    }
  })
})
