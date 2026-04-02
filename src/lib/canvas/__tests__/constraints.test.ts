import {
  PRINT_AREA,
  PRINT_AREAS,
  CANVAS_SIZE,
  isWithinPrintArea,
  validateAllObjects,
  calculateDpi,
  getPrintArea,
} from "../constraints"

// Mock fabric objects with getBoundingRect
function mockObj(left: number, top: number, width: number, height: number) {
  return {
    getBoundingRect: () => ({ left, top, width, height }),
    excludeFromExport: false,
  } as unknown as fabric.FabricObject
}

function mockOverlay(left: number, top: number, width: number, height: number) {
  return {
    getBoundingRect: () => ({ left, top, width, height }),
    excludeFromExport: true,
  } as unknown as fabric.FabricObject & { excludeFromExport: boolean }
}

describe("CANVAS_SIZE", () => {
  it("is 800x800", () => {
    expect(CANVAS_SIZE.width).toBe(800)
    expect(CANVAS_SIZE.height).toBe(800)
  })
})

describe("PRINT_AREA", () => {
  it("defaults to front side dimensions", () => {
    expect(PRINT_AREA).toEqual(PRINT_AREAS.front)
  })

  it("has front and back areas defined", () => {
    expect(PRINT_AREAS.front).toBeDefined()
    expect(PRINT_AREAS.back).toBeDefined()
  })
})

describe("getPrintArea", () => {
  it("returns front area by default", () => {
    expect(getPrintArea()).toEqual(PRINT_AREAS.front)
  })

  it("returns correct area per side", () => {
    expect(getPrintArea("front")).toEqual(PRINT_AREAS.front)
    expect(getPrintArea("back")).toEqual(PRINT_AREAS.back)
  })
})

describe("isWithinPrintArea", () => {
  const area = PRINT_AREAS.front

  it("returns true for object fully inside", () => {
    const obj = mockObj(area.x + 10, area.y + 10, 100, 100)
    expect(isWithinPrintArea(obj)).toBe(true)
  })

  it("returns false for object fully outside", () => {
    const obj = mockObj(10, 10, 50, 50)
    expect(isWithinPrintArea(obj)).toBe(false)
  })

  it("returns false for object partially outside (right edge)", () => {
    const obj = mockObj(area.x + area.width - 50, area.y + 10, 200, 100)
    expect(isWithinPrintArea(obj)).toBe(false)
  })

  it("returns true for object exactly at print area bounds", () => {
    const obj = mockObj(area.x, area.y, area.width, area.height)
    expect(isWithinPrintArea(obj)).toBe(true)
  })

  it("uses back area when side is back", () => {
    const backArea = PRINT_AREAS.back
    const obj = mockObj(backArea.x + 10, backArea.y + 10, 100, 100)
    expect(isWithinPrintArea(obj, "back")).toBe(true)
  })
})

describe("validateAllObjects", () => {
  const area = PRINT_AREAS.front

  it("returns valid when all objects inside", () => {
    const canvas = {
      getObjects: () => [
        mockObj(area.x + 10, area.y + 10, 100, 100),
        mockObj(area.x + 20, area.y + 20, 50, 50),
      ],
    } as unknown as fabric.Canvas

    const result = validateAllObjects(canvas)
    expect(result.valid).toBe(true)
    expect(result.outOfBounds).toHaveLength(0)
  })

  it("returns invalid with out-of-bounds list", () => {
    const inside = mockObj(area.x + 10, area.y + 10, 100, 100)
    const outside = mockObj(10, 10, 50, 50)
    const canvas = {
      getObjects: () => [inside, outside],
    } as unknown as fabric.Canvas

    const result = validateAllObjects(canvas)
    expect(result.valid).toBe(false)
    expect(result.outOfBounds).toHaveLength(1)
  })

  it("excludes overlay objects from validation", () => {
    const inside = mockObj(area.x + 10, area.y + 10, 100, 100)
    const overlay = mockOverlay(0, 0, 800, 800)
    const canvas = {
      getObjects: () => [inside, overlay],
    } as unknown as fabric.Canvas

    const result = validateAllObjects(canvas)
    expect(result.valid).toBe(true)
    expect(result.outOfBounds).toHaveLength(0)
  })
})

describe("calculateDpi", () => {
  it("calculates DPI for image filling print area width", () => {
    // Image 3000px wide displayed at full print area width (352px front)
    // Physical width = (352/352) * 12 = 12 inches
    // DPI = 3000 / 12 = 250
    const dpi = calculateDpi(3000, PRINT_AREAS.front.width, "front")
    expect(dpi).toBe(250)
  })

  it("calculates higher DPI for smaller display size", () => {
    // Image 3000px wide displayed at half print area width
    // Physical width = (176/352) * 12 = 6 inches
    // DPI = 3000 / 6 = 500
    const dpi = calculateDpi(3000, PRINT_AREAS.front.width / 2, "front")
    expect(dpi).toBe(500)
  })

  it("returns 0 for zero display width", () => {
    expect(calculateDpi(3000, 0, "front")).toBe(0)
  })
})
