import type { Canvas, FabricObject } from "fabric"
import type { EditorLayout } from "@/lib/print/editor-layout"

type Flagged = FabricObject & {
  _isPrintOverlay?: boolean
  excludeFromExport?: boolean
}

export function isPrintOverlay(obj: object): boolean {
  return (obj as Flagged)._isPrintOverlay === true
}

/** User content: everything except the print-area overlay and other export-excluded helpers */
export function isUserObject(obj: object): boolean {
  return !isPrintOverlay(obj) && !(obj as Flagged).excludeFromExport
}

export function isWithinPrintArea(obj: FabricObject, layout: EditorLayout): boolean {
  const b = obj.getBoundingRect()
  return (
    b.left >= 0 &&
    b.top >= 0 &&
    b.left + b.width <= layout.width &&
    b.top + b.height <= layout.height
  )
}

export function validateAllObjects(
  canvas: Canvas,
  layout: EditorLayout
): { valid: boolean; outOfBounds: FabricObject[] } {
  const outOfBounds = canvas
    .getObjects()
    .filter(isUserObject)
    .filter((obj) => !isWithinPrintArea(obj, layout))
  return { valid: outOfBounds.length === 0, outOfBounds }
}

export function removePrintAreaOverlay(canvas: Canvas): void {
  canvas.getObjects().filter(isPrintOverlay).forEach((obj) => canvas.remove(obj))
}

export async function drawPrintAreaOverlay(
  canvas: Canvas,
  layout: EditorLayout
): Promise<void> {
  const fabric = await import("fabric")
  removePrintAreaOverlay(canvas)

  // Fabric 7 defaults to a centred origin, so the corner must be explicit
  const frame = new fabric.Rect({
    left: 0,
    top: 0,
    originX: "left",
    originY: "top",
    width: layout.width,
    height: layout.height,
    fill: "transparent",
    stroke: "#00aaff",
    strokeWidth: 2,
    strokeDashArray: [12, 8],
    strokeUniform: true,
    selectable: false,
    evented: false,
    excludeFromExport: true,
    objectCaching: false,
  })
  ;(frame as Flagged)._isPrintOverlay = true
  canvas.add(frame)
  canvas.sendObjectToBack(frame)
}

async function printClip(layout: EditorLayout) {
  const fabric = await import("fabric")
  return new fabric.Rect({
    left: 0,
    top: 0,
    width: layout.width,
    height: layout.height,
    originX: "left",
    originY: "top",
    absolutePositioned: true,
  })
}

/** Clip a user object to the print area so nothing outside it is drawn or exported */
export async function applyPrintClip(obj: FabricObject, layout: EditorLayout): Promise<void> {
  obj.clipPath = await printClip(layout)
}

export async function applyPrintClipAll(canvas: Canvas, layout: EditorLayout): Promise<void> {
  for (const obj of canvas.getObjects().filter(isUserObject)) {
    obj.clipPath = await printClip(layout)
  }
  canvas.renderAll()
}

export type DpiLevel = "excellent" | "good" | "low"

export function dpiLevel(dpi: number): DpiLevel {
  if (dpi >= 300) return "excellent"
  if (dpi >= 150) return "good"
  return "low"
}
