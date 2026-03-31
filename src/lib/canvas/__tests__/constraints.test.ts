import { PRINT_AREA, isWithinPrintArea, validateAllObjects } from "../constraints"

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

describe("PRINT_AREA", () => {
  it("has expected dimensions", () => {
    expect(PRINT_AREA.x).toBe(100)
    expect(PRINT_AREA.y).toBe(80)
    expect(PRINT_AREA.width).toBe(400)
    expect(PRINT_AREA.height).toBe(440)
  })
})

describe("isWithinPrintArea", () => {
  it("returns true for object fully inside", () => {
    const obj = mockObj(150, 150, 100, 100)
    expect(isWithinPrintArea(obj)).toBe(true)
  })

  it("returns false for object fully outside", () => {
    const obj = mockObj(10, 10, 50, 50)
    expect(isWithinPrintArea(obj)).toBe(false)
  })

  it("returns false for object partially outside (right edge)", () => {
    const obj = mockObj(400, 150, 200, 100)
    expect(isWithinPrintArea(obj)).toBe(false)
  })

  it("returns false for object partially outside (bottom edge)", () => {
    const obj = mockObj(150, 400, 100, 200)
    expect(isWithinPrintArea(obj)).toBe(false)
  })

  it("returns true for object exactly at print area bounds", () => {
    const obj = mockObj(PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.width, PRINT_AREA.height)
    expect(isWithinPrintArea(obj)).toBe(true)
  })
})

describe("validateAllObjects", () => {
  it("returns valid when all objects inside", () => {
    const canvas = {
      getObjects: () => [
        mockObj(150, 150, 100, 100),
        mockObj(200, 200, 50, 50),
      ],
    } as unknown as fabric.Canvas

    const result = validateAllObjects(canvas)
    expect(result.valid).toBe(true)
    expect(result.outOfBounds).toHaveLength(0)
  })

  it("returns invalid with out-of-bounds list", () => {
    const inside = mockObj(150, 150, 100, 100)
    const outside = mockObj(10, 10, 50, 50)
    const canvas = {
      getObjects: () => [inside, outside],
    } as unknown as fabric.Canvas

    const result = validateAllObjects(canvas)
    expect(result.valid).toBe(false)
    expect(result.outOfBounds).toHaveLength(1)
  })

  it("excludes overlay objects from validation", () => {
    const inside = mockObj(150, 150, 100, 100)
    const overlay = mockOverlay(0, 0, 600, 600)
    const canvas = {
      getObjects: () => [inside, overlay],
    } as unknown as fabric.Canvas

    const result = validateAllObjects(canvas)
    expect(result.valid).toBe(true)
    expect(result.outOfBounds).toHaveLength(0)
  })
})
