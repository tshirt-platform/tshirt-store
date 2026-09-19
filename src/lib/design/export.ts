import type { Canvas } from "fabric"
import { DESIGN_EXPORT } from "@tshirt-platform/shared"
import { isUserObject } from "@/lib/canvas/constraints"
import { serializeCanvas } from "@/lib/canvas/scene"
import { exportRegion, type EditorLayout } from "@/lib/print/editor-layout"
import { setPngDpi } from "./png-dpi"

function toBlob(el: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    el.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      "image/png"
    )
  })
}

/**
 * The print file: user content only, transparent, at 300 DPI pixel size, with the
 * resolution written into the PNG. The garment drawing and print frame are left out.
 */
export async function exportArtworkPng(
  canvas: Canvas,
  layout: EditorLayout,
  multiplier: number = layout.multiplier
): Promise<Blob> {
  const savedViewport = canvas.viewportTransform
  const savedBackground = canvas.backgroundImage

  // toCanvasElement multiplies the live zoom in, so measure from a neutral viewport
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0]
  canvas.backgroundImage = undefined
  try {
    const el = canvas.toCanvasElement(multiplier, {
      ...exportRegion(layout),
      filter: isUserObject,
    })
    const blob = await toBlob(el)
    // Only the print file carries the 300 DPI tag; a smaller export is for the screen
    if (multiplier !== layout.multiplier) return blob
    const png = new Uint8Array(await blob.arrayBuffer())
    return new Blob([setPngDpi(png, DESIGN_EXPORT.DPI)], { type: "image/png" })
  } finally {
    canvas.backgroundImage = savedBackground
    canvas.viewportTransform = savedViewport
    canvas.requestRenderAll()
  }
}

/** Editable state, so the design can be reopened later */
export function exportDesignJson(canvas: Canvas): Blob {
  return new Blob([serializeCanvas(canvas)], { type: "application/json" })
}

export function hasUserContent(canvas: Canvas): boolean {
  return canvas.getObjects().some(isUserObject)
}
