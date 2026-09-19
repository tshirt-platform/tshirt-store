import type { DesignSide, GarmentColor } from "@tshirt-platform/shared"
import type { EditorLayout } from "@/lib/print/editor-layout"
import { renderFlatPreview } from "./flat-preview"
import { requestPreview } from "./preview"

/** Editor units to pixels for the on-screen preview; the print file uses layout.multiplier */
export const PREVIEW_MULTIPLIER = 1.1

export interface PreviewImage {
  /** Render-service template id, or "flat" for the drawing fallback */
  key: string
  blob: Blob
  source: "photo" | "flat"
}

/** A garment with nothing on it yet is still worth showing, in the colour picked */
export function emptyArtwork(): Promise<Blob> {
  const el = document.createElement("canvas")
  el.width = el.height = 2
  return new Promise((resolve, reject) => {
    el.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))), "image/png")
  })
}

/**
 * The design on each garment photo of a side, in the order the product lists them. A photo the
 * renderer cannot serve is skipped; when none can, the flat drawing stands in.
 */
export async function buildPreviewImages(opts: {
  artwork: Blob
  side: DesignSide
  color: GarmentColor
  layout: EditorLayout
  templateIds: string[]
  signal?: AbortSignal
}): Promise<PreviewImage[]> {
  const { artwork, side, color, layout, templateIds, signal } = opts

  const photos = await Promise.all(
    templateIds.map(async (templateId) => ({
      key: templateId,
      blob: await requestPreview({ artwork, side, garmentHex: color.hex, templateId, signal }),
    }))
  )
  const rendered = photos.flatMap((p) => (p.blob ? [{ key: p.key, blob: p.blob, source: "photo" as const }] : []))
  if (rendered.length > 0 || signal?.aborted) return rendered

  return [{ key: "flat", blob: await renderFlatPreview(layout, color, artwork), source: "flat" }]
}
