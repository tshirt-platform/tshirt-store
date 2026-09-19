import type { ArtCalibration } from "@tshirt-platform/shared"

export interface RgbaImage {
  data: ArrayLike<number>
  width: number
  height: number
}

const OPAQUE_ALPHA = 40
const STROKE_ALPHA = 128
const STROKE_MAX_CHANNEL = 110
const STROKE_GAP_PX = 3
const MIN_RUN_ROWS = 8

function alphaAt(img: RgbaImage, x: number, y: number): number {
  return img.data[(y * img.width + x) * 4 + 3]
}

function isStroke(img: RgbaImage, x: number, y: number): boolean {
  const i = (y * img.width + x) * 4
  return (
    img.data[i + 3] > STROKE_ALPHA &&
    img.data[i] < STROKE_MAX_CHANNEL &&
    img.data[i + 1] < STROKE_MAX_CHANNEL &&
    img.data[i + 2] < STROKE_MAX_CHANNEL
  )
}

/** Centres of the dark vertical strokes crossing a row */
function strokeCentres(img: RgbaImage, y: number): number[] {
  const centres: number[] = []
  let start = -1
  let last = -1
  for (let x = 0; x < img.width; x++) {
    if (!isStroke(img, x, y)) continue
    if (start >= 0 && x - last > STROKE_GAP_PX) {
      centres.push((start + last) / 2)
      start = x
    } else if (start < 0) {
      start = x
    }
    last = x
  }
  if (start >= 0) centres.push((start + last) / 2)
  return centres
}

function apexRow(img: RgbaImage): { top: number; bottom: number } {
  let top = -1
  let bottom = -1
  for (let y = 0; y < img.height && top < 0; y++) {
    for (let x = 0; x < img.width; x++) {
      if (alphaAt(img, x, y) > OPAQUE_ALPHA) {
        top = y
        break
      }
    }
  }
  for (let y = img.height - 1; y >= 0 && bottom < 0; y--) {
    for (let x = 0; x < img.width; x++) {
      if (alphaAt(img, x, y) > OPAQUE_ALPHA) {
        bottom = y
        break
      }
    }
  }
  if (top < 0) throw new Error("Line-art has no opaque pixels")
  return { top, bottom }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

/**
 * Measures where a flat garment drawing sits inside its image.
 *
 * The apex (topmost opaque row) stands in for the high point of shoulder. The
 * chest is read just under the sleeves, where a row is crossed by exactly two
 * strokes: the left and right side seams.
 */
export function detectArtCalibration(img: RgbaImage): ArtCalibration {
  const { top, bottom } = apexRow(img)
  const height = bottom - top
  const from = Math.round(top + height * 0.3)
  const to = Math.round(bottom - height * 0.05)

  let run: Array<{ width: number; centre: number }> = []
  for (let y = from; y <= to; y++) {
    const centres = strokeCentres(img, y)
    const isSeamRow =
      centres.length === 2 && centres[1] - centres[0] > img.width * 0.2

    if (!isSeamRow) {
      run = []
      continue
    }
    run.push({
      width: centres[1] - centres[0],
      centre: (centres[0] + centres[1]) / 2,
    })
    if (run.length === MIN_RUN_ROWS) {
      return {
        bodyWidthPx: Math.round(median(run.map((r) => r.width))),
        centerX: Math.round(median(run.map((r) => r.centre))),
        hpsY: top,
      }
    }
  }
  throw new Error("Could not find the side seams of the garment")
}
