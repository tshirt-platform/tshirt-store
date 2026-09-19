import type { DesignSide, PrintArea } from "@tshirt-platform/shared"
import type { LineArt } from "./lineart"

/**
 * Scene units across the print area. Fabric works in this space so font sizes,
 * nudge steps and sliders stay human-scale; export multiplies up to 300 DPI.
 */
export const EDITOR_PRINT_WIDTH = 800

export interface EditorLayout {
  side: DesignSide
  area: PrintArea
  /** Print area size in scene units; its top-left corner is the scene origin */
  width: number
  height: number
  /** Scene unit -> master pixel (300 DPI artwork) */
  multiplier: number
  /** Line-art placement in scene units */
  art: {
    src: string
    left: number
    top: number
    scale: number
    width: number
    height: number
  }
}

export function buildEditorLayout(area: PrintArea, lineArt: LineArt): EditorLayout {
  const unitsPerMm = EDITOR_PRINT_WIDTH / area.widthMm
  const mmPerArtPx = area.flatWidthMm / lineArt.calibration.bodyWidthPx
  const scale = mmPerArtPx * unitsPerMm

  const printLeftInArt =
    lineArt.calibration.centerX - area.widthMm / mmPerArtPx / 2
  const printTopInArt =
    lineArt.calibration.hpsY + area.topOffsetMm / mmPerArtPx

  return {
    side: area.side,
    area,
    width: EDITOR_PRINT_WIDTH,
    height: area.heightMm * unitsPerMm,
    multiplier: area.widthPx / EDITOR_PRINT_WIDTH,
    art: {
      src: lineArt.src,
      left: -printLeftInArt * scale,
      top: -printTopInArt * scale,
      scale,
      width: lineArt.width * scale,
      height: lineArt.height * scale,
    },
  }
}

/** Effective print resolution of an image drawn at `scaleX` in scene units */
export function effectiveDpi(scaleX: number, layout: EditorLayout, dpi: number): number {
  const pxPerImagePx = scaleX * layout.multiplier
  return pxPerImagePx > 0 ? dpi / pxPerImagePx : 0
}

/** Visible scene rectangle: the whole garment drawing */
export function viewBounds(layout: EditorLayout) {
  return {
    left: layout.art.left,
    top: layout.art.top,
    width: layout.art.width,
    height: layout.art.height,
  }
}

const IMAGE_FILL_WIDTH = 0.7
const IMAGE_FILL_HEIGHT = 0.9

/** Scale for a freshly added image: 70% of the print width, never taller than 90% of its height */
export function initialImageScale(
  imgWidth: number,
  imgHeight: number,
  layout: EditorLayout
): number {
  if (imgWidth <= 0 || imgHeight <= 0) return 1
  return Math.min(
    (layout.width * IMAGE_FILL_WIDTH) / imgWidth,
    (layout.height * IMAGE_FILL_HEIGHT) / imgHeight
  )
}

/**
 * Scene rectangle to render for export. Sizes carry a hair of slack because the
 * browser truncates canvas dimensions, and 3118 / 800 * 800 can land on 3117.99.
 */
export function exportRegion(layout: EditorLayout) {
  return {
    left: 0,
    top: 0,
    width: (layout.area.widthPx + 0.01) / layout.multiplier,
    height: (layout.area.heightPx + 0.01) / layout.multiplier,
  }
}
