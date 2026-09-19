import type { GarmentColor } from "@tshirt-platform/shared"
import { tintedArt } from "@/lib/canvas/scene"
import type { EditorLayout } from "@/lib/print/editor-layout"

const BACKDROP = "#F5F5F0"
const OUTPUT_WIDTH = 900

/** Where the print area sits on the line-art image, in that image's own pixels */
export function printRectInArt(layout: EditorLayout) {
  const { art } = layout
  return {
    x: -art.left / art.scale,
    y: -art.top / art.scale,
    width: layout.width / art.scale,
    height: layout.height / art.scale,
  }
}

/** Fallback preview when a product has no garment photo: the design on the tinted drawing */
export async function renderFlatPreview(
  layout: EditorLayout,
  color: GarmentColor,
  artwork: Blob
): Promise<Blob> {
  const [garment, design] = await Promise.all([
    tintedArt(layout.art.src, color),
    createImageBitmap(artwork),
  ])
  const k = OUTPUT_WIDTH / garment.width
  const out = document.createElement("canvas")
  out.width = OUTPUT_WIDTH
  out.height = Math.round(garment.height * k)
  const ctx = out.getContext("2d")
  if (!ctx) throw new Error("2D canvas is not available")

  ctx.fillStyle = BACKDROP
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(garment, 0, 0, out.width, out.height)
  const r = printRectInArt(layout)
  ctx.drawImage(design, r.x * k, r.y * k, r.width * k, r.height * k)
  design.close()

  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Preview export failed"))),
      "image/jpeg",
      0.9
    )
  })
}
