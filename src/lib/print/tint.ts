const LIGHT_STROKE: [number, number, number] = [212, 212, 212]
const DARK_STROKE: [number, number, number] = [26, 26, 26]

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m) throw new RangeError(`Invalid hex colour: ${hex}`)
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Recolours black-line, white-body art in place. White maps to the fabric colour
 * and black to the stroke colour; anti-aliased edges blend between the two, and
 * dark fabrics get light strokes so the outline stays visible.
 */
export function tintLineArt(
  img: { data: Uint8ClampedArray | Uint8Array; width: number; height: number },
  garmentHex: string,
  garmentIsDark: boolean
): void {
  const garment = hexToRgb(garmentHex)
  const stroke = garmentIsDark ? LIGHT_STROKE : DARK_STROKE
  const { data } = img

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    const t = (data[i] + data[i + 1] + data[i + 2]) / (3 * 255)
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.round(stroke[c] + (garment[c] - stroke[c]) * t)
    }
  }
}
