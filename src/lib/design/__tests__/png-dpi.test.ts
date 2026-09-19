import sharp from "sharp"
import { describe, expect, it } from "vitest"
import { setPngDpi } from "../png-dpi"

// Like a canvas export: plain PNG, no pHYs and no EXIF
async function png(width = 40, height = 30): Promise<Uint8Array> {
  const img = sharp({
    create: { width, height, channels: 4, background: { r: 200, g: 20, b: 40, alpha: 0.5 } },
  }).png()
  return new Uint8Array(await img.toBuffer())
}

describe("setPngDpi", () => {
  it("makes a canvas-style PNG report 300 DPI", async () => {
    const before = await sharp(await png()).metadata()
    expect(before.density).not.toBe(300)

    const after = await sharp(setPngDpi(await png(), 300)).metadata()
    expect(after.density).toBe(300)
  })

  it("leaves the pixels untouched", async () => {
    const src = await png(64, 48)
    const a = await sharp(src).ensureAlpha().raw().toBuffer()
    const b = await sharp(setPngDpi(src, 300)).ensureAlpha().raw().toBuffer()
    expect(Buffer.compare(a, b)).toBe(0)
    expect((await sharp(setPngDpi(src, 300)).metadata()).width).toBe(64)
  })

  it("replaces an existing resolution instead of adding a second chunk", async () => {
    const out = setPngDpi(setPngDpi(await png(), 72), 300)
    const text = Buffer.from(out).toString("latin1")
    expect(text.split("pHYs").length - 1).toBe(1)
    expect((await sharp(out).metadata()).density).toBe(300)
  })

  it("supports other resolutions", async () => {
    expect((await sharp(setPngDpi(await png(), 150)).metadata()).density).toBe(150)
  })

  it("rejects data that is not a PNG", () => {
    expect(() => setPngDpi(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), 300)).toThrow(
      "Not a PNG"
    )
  })

  it("stays a valid PNG that sharp can decode", async () => {
    await expect(sharp(setPngDpi(await png(), 300)).toBuffer()).resolves.toBeDefined()
  })
})
