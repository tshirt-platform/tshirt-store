import type { Canvas, FabricObject } from "fabric"

export const PRINT_AREA = {
  x: 100,
  y: 80,
  width: 400,
  height: 440,
} as const

export function isWithinPrintArea(obj: FabricObject): boolean {
  const bounds = obj.getBoundingRect()
  return (
    bounds.left >= PRINT_AREA.x &&
    bounds.top >= PRINT_AREA.y &&
    bounds.left + bounds.width <= PRINT_AREA.x + PRINT_AREA.width &&
    bounds.top + bounds.height <= PRINT_AREA.y + PRINT_AREA.height
  )
}

export function validateAllObjects(canvas: Canvas): {
  valid: boolean
  outOfBounds: FabricObject[]
} {
  const objects = canvas
    .getObjects()
    .filter((obj) => !(obj as FabricObject & { excludeFromExport?: boolean }).excludeFromExport)
  const outOfBounds = objects.filter((obj) => !isWithinPrintArea(obj))
  return { valid: outOfBounds.length === 0, outOfBounds }
}

export async function drawPrintAreaOverlay(canvas: Canvas) {
  const fabric = await import("fabric")

  const lineProps = {
    stroke: "#00aaff",
    strokeWidth: 1,
    strokeDashArray: [6, 4] as number[],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    objectCaching: false,
  }

  const { x, y, width, height } = PRINT_AREA
  const lines = [
    new fabric.Line([x, y, x + width, y], lineProps),                   // top
    new fabric.Line([x + width, y, x + width, y + height], lineProps),   // right
    new fabric.Line([x, y + height, x + width, y + height], lineProps),  // bottom
    new fabric.Line([x, y, x, y + height], lineProps),                   // left
  ]

  lines.forEach((line) => {
    canvas.add(line)
    canvas.sendObjectToBack(line)
  })
}
