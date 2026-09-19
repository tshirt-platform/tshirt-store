import type { Canvas, FabricObject } from "fabric"
import {
  DEFAULT_PRINT_CONFIG_META,
  derivePrintArea,
  toGarmentMeasurements,
} from "@tshirt-platform/shared"
import { describe, expect, it } from "vitest"
import { buildEditorLayout } from "@/lib/print/editor-layout"
import { getLineArt } from "@/lib/print/lineart"
import {
  dpiLevel,
  isPrintOverlay,
  isUserObject,
  isWithinPrintArea,
  validateAllObjects,
} from "../constraints"

const layout = buildEditorLayout(
  derivePrintArea(toGarmentMeasurements(DEFAULT_PRINT_CONFIG_META), "front"),
  getLineArt("tshirt", "front")
)

function mockObj(left: number, top: number, width: number, height: number) {
  return {
    getBoundingRect: () => ({ left, top, width, height }),
    excludeFromExport: false,
  } as unknown as FabricObject
}

function mockOverlay() {
  return {
    getBoundingRect: () => ({ left: 0, top: 0, width: layout.width, height: layout.height }),
    excludeFromExport: true,
    _isPrintOverlay: true,
  } as unknown as FabricObject
}

function canvasOf(...objects: FabricObject[]) {
  return { getObjects: () => objects } as unknown as Canvas
}

describe("isWithinPrintArea", () => {
  it("accepts an object fully inside", () => {
    expect(isWithinPrintArea(mockObj(10, 10, 100, 100), layout)).toBe(true)
  })

  it("accepts an object exactly on the bounds", () => {
    expect(isWithinPrintArea(mockObj(0, 0, layout.width, layout.height), layout)).toBe(true)
  })

  it("rejects an object crossing the right edge", () => {
    expect(isWithinPrintArea(mockObj(layout.width - 50, 10, 200, 100), layout)).toBe(false)
  })

  it("rejects an object crossing the top or left edge", () => {
    expect(isWithinPrintArea(mockObj(-1, 10, 50, 50), layout)).toBe(false)
    expect(isWithinPrintArea(mockObj(10, -1, 50, 50), layout)).toBe(false)
  })

  it("rejects an object crossing the bottom edge", () => {
    expect(isWithinPrintArea(mockObj(10, layout.height - 10, 50, 50), layout)).toBe(false)
  })
})

describe("object classification", () => {
  it("separates user content from the print frame", () => {
    expect(isUserObject(mockObj(0, 0, 1, 1))).toBe(true)
    expect(isUserObject(mockOverlay())).toBe(false)
    expect(isPrintOverlay(mockOverlay())).toBe(true)
    expect(isPrintOverlay(mockObj(0, 0, 1, 1))).toBe(false)
  })
})

describe("validateAllObjects", () => {
  it("is valid when every user object is inside", () => {
    const result = validateAllObjects(canvasOf(mockObj(10, 10, 100, 100), mockObj(20, 20, 50, 50)), layout)
    expect(result.valid).toBe(true)
    expect(result.outOfBounds).toHaveLength(0)
  })

  it("lists the objects that stick out", () => {
    const outside = mockObj(-30, 10, 50, 50)
    const result = validateAllObjects(canvasOf(mockObj(10, 10, 100, 100), outside), layout)
    expect(result.valid).toBe(false)
    expect(result.outOfBounds).toEqual([outside])
  })

  it("ignores the print frame itself", () => {
    const result = validateAllObjects(canvasOf(mockObj(10, 10, 100, 100), mockOverlay()), layout)
    expect(result.valid).toBe(true)
  })
})

describe("dpiLevel", () => {
  it("bands print resolution", () => {
    expect(dpiLevel(300)).toBe("excellent")
    expect(dpiLevel(450)).toBe("excellent")
    expect(dpiLevel(299)).toBe("good")
    expect(dpiLevel(150)).toBe("good")
    expect(dpiLevel(149)).toBe("low")
    expect(dpiLevel(0)).toBe("low")
  })
})
