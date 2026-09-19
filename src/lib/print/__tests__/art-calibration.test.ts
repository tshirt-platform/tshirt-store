import path from "node:path"
import sharp from "sharp"
import { describe, expect, it } from "vitest"
import { detectArtCalibration, type RgbaImage } from "../art-calibration"

const ART_DIR = path.resolve(__dirname, "../../../../public/images/design-editor")

async function load(file: string): Promise<RgbaImage> {
  const { data, info } = await sharp(path.join(ART_DIR, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

function blank(width: number, height: number): RgbaImage {
  return { data: new Uint8Array(width * height * 4), width, height }
}

function paint(img: RgbaImage, x: number, y: number, rgba: number[]): void {
  const data = img.data as Uint8Array
  const i = (y * img.width + x) * 4
  data.set(rgba, i)
}

/** Boxy torso: opaque body with a black stroke down each side */
function syntheticShirt(k = 1): RgbaImage {
  const img = blank(400 * k, 500 * k)
  for (let y = 20 * k; y < 480 * k; y++) {
    for (let x = 100 * k; x <= 300 * k; x++) {
      const stroke = x < 103 * k || x > 297 * k
      paint(img, x, y, stroke ? [0, 0, 0, 255] : [255, 255, 255, 255])
    }
  }
  return img
}

describe("detectArtCalibration", () => {
  it("measures the real front line-art", async () => {
    const cal = detectArtCalibration(await load("front-unline.png"))
    expect(cal.bodyWidthPx).toBeGreaterThanOrEqual(500)
    expect(cal.bodyWidthPx).toBeLessThanOrEqual(510)
    expect(cal.centerX).toBeGreaterThanOrEqual(449)
    expect(cal.centerX).toBeLessThanOrEqual(453)
    expect(cal.hpsY).toBeLessThan(20)
  })

  it("measures the real back line-art", async () => {
    const cal = detectArtCalibration(await load("back-unline.png"))
    expect(cal.bodyWidthPx).toBeGreaterThanOrEqual(453)
    expect(cal.bodyWidthPx).toBeLessThanOrEqual(463)
    expect(cal.centerX).toBeGreaterThanOrEqual(406)
    expect(cal.centerX).toBeLessThanOrEqual(410)
    expect(cal.hpsY).toBeLessThan(20)
  })

  it("reads a synthetic torso exactly", () => {
    expect(detectArtCalibration(syntheticShirt())).toEqual({
      bodyWidthPx: 198,
      centerX: 200,
      hpsY: 20,
    })
  })

  it("scales with the image resolution", () => {
    const base = detectArtCalibration(syntheticShirt(1))
    const double = detectArtCalibration(syntheticShirt(2))
    expect(double.bodyWidthPx).toBeCloseTo(base.bodyWidthPx * 2, -1)
    expect(double.centerX).toBeCloseTo(base.centerX * 2, -1)
    expect(double.hpsY).toBe(base.hpsY * 2)
  })

  it("throws on an empty image", () => {
    expect(() => detectArtCalibration(blank(50, 50))).toThrow("no opaque")
  })

  it("throws when no side seams exist", () => {
    const img = blank(400, 500)
    for (let y = 20; y < 480; y++) {
      for (let x = 100; x <= 300; x++) paint(img, x, y, [255, 255, 255, 255])
    }
    expect(() => detectArtCalibration(img)).toThrow("side seams")
  })
})
