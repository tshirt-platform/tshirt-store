import type { Canvas, FabricObject } from "fabric"
import type { DesignSide } from "@tshirt/shared"

export const CANVAS_SIZE = { width: 800, height: 800 } as const

// Print area coordinates per side (matching t-shirt body proportions)
export const PRINT_AREAS: Record<
  DesignSide,
  { x: number; y: number; width: number; height: number }
> = {
  front: { x: 224, y: 153, width: 352, height: 438 },
  back: { x: 210, y: 140, width: 380, height: 480 },
} as const

// Default (front) for backward compat
export const PRINT_AREA = PRINT_AREAS.front

// Physical print width in inches (standard t-shirt front)
export const PRINT_PHYSICAL_WIDTH_INCHES = 12
export const TARGET_DPI = 300

// Max canvas scale that maintains target DPI for a given image
export function scaleForDpi(
  imgWidth: number,
  imgHeight: number,
  side: DesignSide = "front",
  dpi: number = TARGET_DPI
): number {
  const area = PRINT_AREAS[side]
  // Max display scale so DPI >= target
  const scaleDpi = area.width / (dpi * PRINT_PHYSICAL_WIDTH_INCHES)
  // Fit within print area
  const scaleFit = Math.min(area.width / imgWidth, area.height / imgHeight, 1)
  return Math.min(scaleDpi, scaleFit)
}

export function getPrintArea(side: DesignSide = "front") {
  return PRINT_AREAS[side]
}

export function isWithinPrintArea(
  obj: FabricObject,
  side: DesignSide = "front"
): boolean {
  const area = PRINT_AREAS[side]
  const bounds = obj.getBoundingRect()
  return (
    bounds.left >= area.x &&
    bounds.top >= area.y &&
    bounds.left + bounds.width <= area.x + area.width &&
    bounds.top + bounds.height <= area.y + area.height
  )
}

export function validateAllObjects(
  canvas: Canvas,
  side: DesignSide = "front"
): {
  valid: boolean
  outOfBounds: FabricObject[]
} {
  const objects = canvas
    .getObjects()
    .filter(
      (obj) =>
        !(obj as FabricObject & { excludeFromExport?: boolean })
          .excludeFromExport
    )
  const outOfBounds = objects.filter((obj) => !isWithinPrintArea(obj, side))
  return { valid: outOfBounds.length === 0, outOfBounds }
}

// Helper: check if an object is a print overlay line
function isOverlayLine(
  obj: FabricObject
): obj is FabricObject & { _isPrintOverlay: true } {
  return (obj as FabricObject & { _isPrintOverlay?: boolean })
    ._isPrintOverlay === true
}

// Remove all overlay lines from canvas
export function removePrintAreaOverlay(canvas: Canvas) {
  const overlays = canvas.getObjects().filter(isOverlayLine)
  overlays.forEach((obj) => canvas.remove(obj))
}

// Draw dashed rectangle overlay marking the print area
export async function drawPrintAreaOverlay(
  canvas: Canvas,
  side: DesignSide = "front"
) {
  const fabric = await import("fabric")
  const area = PRINT_AREAS[side]

  // Remove existing overlay lines before drawing new ones
  removePrintAreaOverlay(canvas)

  const lineProps = {
    stroke: "#00aaff",
    strokeWidth: 1,
    strokeDashArray: [6, 4] as number[],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    objectCaching: false,
  }

  const { x, y, width, height } = area
  const lines = [
    new fabric.Line([x, y, x + width, y], lineProps),
    new fabric.Line([x + width, y, x + width, y + height], lineProps),
    new fabric.Line([x, y + height, x + width, y + height], lineProps),
    new fabric.Line([x, y, x, y + height], lineProps),
  ]

  lines.forEach((line) => {
    ;(line as FabricObject & { _isPrintOverlay?: boolean })._isPrintOverlay =
      true
    canvas.add(line)
    canvas.sendObjectToBack(line)
  })
}

// Apply print area clip path to a user object so parts outside are visually clipped
export async function applyPrintClip(
  obj: FabricObject,
  side: DesignSide = "front"
) {
  const fabric = await import("fabric")
  const area = PRINT_AREAS[side]

  obj.clipPath = new fabric.Rect({
    left: area.x,
    top: area.y,
    width: area.width,
    height: area.height,
    originX: "left",
    originY: "top",
    absolutePositioned: true,
  })
}

// Apply clip path to all user objects on the canvas
export async function applyPrintClipAll(
  canvas: Canvas,
  side: DesignSide = "front"
) {
  const fabric = await import("fabric")
  const area = PRINT_AREAS[side]

  const clip = new fabric.Rect({
    left: area.x,
    top: area.y,
    width: area.width,
    height: area.height,
    originX: "left",
    originY: "top",
    absolutePositioned: true,
  })

  canvas.getObjects().forEach((obj) => {
    if (
      !isOverlayLine(obj) &&
      !(obj as FabricObject & { excludeFromExport?: boolean }).excludeFromExport
    ) {
      obj.clipPath = clip
    }
  })
  canvas.renderAll()
}

// Calculate effective DPI of an image at its current display size
export function calculateDpi(
  originalWidth: number,
  displayWidth: number,
  side: DesignSide = "front"
): number {
  const area = PRINT_AREAS[side]
  const physicalWidth =
    (displayWidth / area.width) * PRINT_PHYSICAL_WIDTH_INCHES
  if (physicalWidth <= 0) return 0
  return Math.round(originalWidth / physicalWidth)
}
