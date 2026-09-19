import type { Canvas } from "fabric"
import type { GarmentColor } from "@tshirt-platform/shared"
import { applyPrintClipAll, drawPrintAreaOverlay } from "@/lib/canvas/constraints"
import { viewBounds, type EditorLayout } from "@/lib/print/editor-layout"
import { tintLineArt } from "@/lib/print/tint"

const FIT_MARGIN = 0.98

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = src
  await img.decode()
  return img
}

/** Line-art recoloured to the garment fabric, at its natural resolution */
export async function tintedArt(src: string, color: GarmentColor): Promise<HTMLCanvasElement> {
  const img = await loadImage(src)
  const el = document.createElement("canvas")
  el.width = img.naturalWidth
  el.height = img.naturalHeight
  const ctx = el.getContext("2d")
  if (!ctx) throw new Error("2D canvas is not available")
  ctx.drawImage(img, 0, 0)
  const pixels = ctx.getImageData(0, 0, el.width, el.height)
  tintLineArt(pixels, color.hex, color.is_dark)
  ctx.putImageData(pixels, 0, 0)
  return el
}

/** Zoom and pan so the whole garment drawing is visible and centred */
export function fitViewport(canvas: Canvas, layout: EditorLayout): void {
  const bounds = viewBounds(layout)
  const zoom =
    Math.min(canvas.getWidth() / bounds.width, canvas.getHeight() / bounds.height) *
    FIT_MARGIN
  const tx = (canvas.getWidth() - bounds.width * zoom) / 2 - bounds.left * zoom
  const ty = (canvas.getHeight() - bounds.height * zoom) / 2 - bounds.top * zoom
  canvas.setViewportTransform([zoom, 0, 0, zoom, tx, ty])
}

export async function loadMockup(
  canvas: Canvas,
  layout: EditorLayout,
  color: GarmentColor
): Promise<void> {
  const fabric = await import("fabric")
  const el = await tintedArt(layout.art.src, color)
  canvas.backgroundImage = new fabric.FabricImage(el, {
    left: layout.art.left,
    top: layout.art.top,
    originX: "left",
    originY: "top",
    scaleX: layout.art.scale,
    scaleY: layout.art.scale,
    selectable: false,
    evented: false,
  })
}

/** Everything that is not user content: garment drawing, print frame, clipping, viewport */
export async function applyScene(
  canvas: Canvas,
  layout: EditorLayout,
  color: GarmentColor
): Promise<void> {
  await loadMockup(canvas, layout, color)
  await drawPrintAreaOverlay(canvas, layout)
  await applyPrintClipAll(canvas, layout)
  fitViewport(canvas, layout)
  canvas.requestRenderAll()
}

/** Snapshot of user content only; the garment drawing is rebuilt from the layout */
export function serializeCanvas(canvas: Canvas): string {
  const json = canvas.toJSON() as Record<string, unknown>
  delete json.backgroundImage
  return JSON.stringify(json)
}

export async function restoreCanvas(
  canvas: Canvas,
  json: string,
  layout: EditorLayout,
  color: GarmentColor
): Promise<void> {
  await canvas.loadFromJSON(json)
  await applyScene(canvas, layout, color)
}
