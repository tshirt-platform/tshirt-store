import path from "node:path"
import sharp from "sharp"
import { describe, expect, it } from "vitest"
import { detectArtCalibration } from "../art-calibration"
import { ALL_LINE_ART, getLineArt } from "../lineart"

const PUBLIC_DIR = path.resolve(__dirname, "../../../../public")

describe("line-art registry", () => {
  for (const art of ALL_LINE_ART) {
    it(`${art.src} matches its file and detected calibration`, async () => {
      const { data, info } = await sharp(path.join(PUBLIC_DIR, art.src))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })

      expect(info.width).toBe(art.width)
      expect(info.height).toBe(art.height)
      expect(
        detectArtCalibration({ data, width: info.width, height: info.height })
      ).toEqual(art.calibration)
    })
  }

  it("falls back to the t-shirt drawing for garments without art", () => {
    expect(getLineArt("polo", "front")).toBe(getLineArt("tshirt", "front"))
    expect(getLineArt("hoodie", "back")).toBe(getLineArt("tshirt", "back"))
  })
})
