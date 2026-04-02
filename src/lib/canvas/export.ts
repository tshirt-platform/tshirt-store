import { DESIGN_EXPORT } from "@tshirt/shared"
import type { Canvas, FabricObject } from "fabric"

/**
 * Export canvas content as high-resolution PNG blob (3000x3000 @ 300 DPI).
 * Excludes mockup background and overlay objects.
 */
export function exportToPng(canvas: Canvas): Blob {
  const multiplier = DESIGN_EXPORT.WIDTH / canvas.getWidth()

  const dataUrl = canvas.toDataURL({
    format: "png",
    quality: 1,
    multiplier,
    filter: (obj: FabricObject) =>
      !(obj as FabricObject & { excludeFromExport?: boolean })
        .excludeFromExport,
  })

  return dataUrlToBlob(dataUrl)
}

/** Export canvas state as JSON string (for re-editing later). */
export function exportToJson(canvas: Canvas): string {
  const json = canvas.toJSON([
    "excludeFromExport",
    "name",
    "layerName",
    "_isPrintOverlay",
  ]) as Record<string, unknown>
  // Strip background image (mockup) so it's not saved
  delete json.backgroundImage
  return JSON.stringify(json)
}

/** Restore canvas from previously exported JSON. */
export async function loadFromJson(
  canvas: Canvas,
  json: string
): Promise<void> {
  await canvas.loadFromJSON(JSON.parse(json))
  canvas.renderAll()
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",")
  const mime = header.split(":")[1].split(";")[0]
  const bytes = atob(base64)
  const buffer = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    buffer[i] = bytes.charCodeAt(i)
  }
  return new Blob([buffer], { type: mime })
}
