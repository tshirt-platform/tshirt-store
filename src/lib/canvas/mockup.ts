import type { DesignSide } from "@tshirt/shared"
import type { Canvas, FabricObject } from "fabric"

// Color placeholder mockups (will be replaced with real images later)
const MOCKUP_COLORS: Record<string, string> = {
  white: "#f5f5f5",
  black: "#1a1a1a",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
}

const DEFAULT_COLOR = "white"

export async function loadMockup(
  canvas: Canvas,
  color: string = DEFAULT_COLOR,
  _side: DesignSide = "front"
) {
  const fabric = await import("fabric")
  const fill = MOCKUP_COLORS[color] ?? MOCKUP_COLORS[DEFAULT_COLOR]

  // Placeholder: colored rectangle representing the T-shirt area
  const mockupRect = new fabric.Rect({
    left: 50,
    top: 30,
    width: 500,
    height: 540,
    rx: 16,
    ry: 16,
    fill,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  })

  // Remove previous mockup if exists
  const existing = canvas
    .getObjects()
    .find(
      (obj) =>
        (obj as FabricObject & { _isMockup?: boolean })._isMockup
    )
  if (existing) canvas.remove(existing)

  // Tag as mockup for later removal
  ;(mockupRect as FabricObject & { _isMockup?: boolean })._isMockup =
    true

  canvas.add(mockupRect)
  canvas.sendObjectToBack(mockupRect)
  canvas.renderAll()
}
