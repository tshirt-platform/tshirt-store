export const PRINT_AREA = {
  x: 100,
  y: 80,
  width: 400,
  height: 440,
} as const

export function isWithinPrintArea(obj: fabric.FabricObject): boolean {
  const bounds = obj.getBoundingRect()
  return (
    bounds.left >= PRINT_AREA.x &&
    bounds.top >= PRINT_AREA.y &&
    bounds.left + bounds.width <= PRINT_AREA.x + PRINT_AREA.width &&
    bounds.top + bounds.height <= PRINT_AREA.y + PRINT_AREA.height
  )
}

export function validateAllObjects(canvas: fabric.Canvas): {
  valid: boolean
  outOfBounds: fabric.FabricObject[]
} {
  const objects = canvas
    .getObjects()
    .filter((obj) => !(obj as fabric.FabricObject & { excludeFromExport?: boolean }).excludeFromExport)
  const outOfBounds = objects.filter((obj) => !isWithinPrintArea(obj))
  return { valid: outOfBounds.length === 0, outOfBounds }
}

export async function drawPrintAreaOverlay(canvas: fabric.Canvas) {
  const fabric = await import("fabric")

  const overlay = new fabric.Rect({
    left: PRINT_AREA.x,
    top: PRINT_AREA.y,
    width: PRINT_AREA.width,
    height: PRINT_AREA.height,
    fill: "transparent",
    stroke: "#00aaff",
    strokeWidth: 1.5,
    strokeDashArray: [6, 4],
    selectable: false,
    evented: false,
    excludeFromExport: true,
  })

  canvas.add(overlay)
  canvas.sendObjectToBack(overlay)
}
