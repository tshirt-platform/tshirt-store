import type { Canvas, FabricImage } from "fabric"
import {
  DESIGN_EXPORT,
  toGarmentSnapshot,
  toPlacement,
  type CartLineItemMetadata,
  type DesignAsset,
  type DesignSide,
} from "@tshirt-platform/shared"
import { validateAllObjects, isUserObject, dpiLevel } from "@/lib/canvas/constraints"
import { restoreCanvas } from "@/lib/canvas/scene"
import { effectiveDpi, type EditorLayout } from "@/lib/print/editor-layout"
import type { GarmentContext } from "@/lib/print/garment"
import { layoutForGarment } from "@/lib/print/garment"
import { exportArtworkPng } from "./export"

export interface SideExport {
  side: DesignSide
  layout: EditorLayout
  json: string
  png: Blob
  /** Objects that stick out of the print area and will be cut off */
  outOfBounds: number
  /** Raster images that will print below 150 DPI */
  lowDpiImages: number
}

function countLowDpiImages(canvas: Canvas, layout: EditorLayout): number {
  return canvas
    .getObjects()
    .filter(isUserObject)
    .filter((o): o is FabricImage => o.type === "image")
    .filter((img) => dpiLevel(effectiveDpi(img.scaleX ?? 1, layout, DESIGN_EXPORT.DPI)) === "low").length
}

/** True when a serialized canvas holds at least one user object */
export function sideHasContent(json: string | null): boolean {
  if (!json) return false
  try {
    const parsed = JSON.parse(json) as { objects?: unknown[] }
    return Array.isArray(parsed.objects) && parsed.objects.length > 0
  } catch {
    return false
  }
}

/**
 * Exports every side that has content. Only one side lives on the canvas at a time,
 * so each stored side is loaded, exported, and the canvas is put back afterwards.
 */
export async function exportSides(
  canvas: Canvas,
  garment: GarmentContext,
  stored: Record<DesignSide, string | null>,
  current: { side: DesignSide; json: string },
  multiplier?: number
): Promise<SideExport[]> {
  const results: SideExport[] = []
  const currentLayout = layoutForGarment(garment, current.side)

  try {
    for (const side of ["front", "back"] as const) {
      const json = side === current.side ? current.json : stored[side]
      if (!json || !sideHasContent(json)) continue

      const layout = layoutForGarment(garment, side)
      await restoreCanvas(canvas, json, layout, garment.color)
      results.push({
        side,
        layout,
        json,
        png: await exportArtworkPng(canvas, layout, multiplier),
        outOfBounds: validateAllObjects(canvas, layout).outOfBounds.length,
        lowDpiImages: countLowDpiImages(canvas, layout),
      })
    }
  } finally {
    await restoreCanvas(canvas, current.json, currentLayout, garment.color)
  }
  return results
}

export interface UploadedSide {
  side: DesignSide
  pngUrl: string
  jsonUrl: string
  previewUrl: string
}

export function buildCartMetadata(
  garment: GarmentContext,
  uploaded: UploadedSide[]
): CartLineItemMetadata {
  if (uploaded.length === 0) throw new Error("A design needs at least one printed side")
  if (!garment.size) throw new Error("A size is required")

  const designs: DesignAsset[] = uploaded.map((u) => ({
    side: u.side,
    png_url: u.pngUrl,
    json_url: u.jsonUrl,
    preview_url: u.previewUrl,
    placement: toPlacement(layoutForGarment(garment, u.side).area),
  }))

  return {
    designs,
    garment: toGarmentSnapshot(garment.size, garment.color),
    design_png_url: designs[0].png_url,
    design_json_url: designs[0].json_url,
    design_side: designs[0].side,
  }
}
