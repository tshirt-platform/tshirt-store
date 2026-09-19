import type { ArtCalibration, DesignSide, ShirtType } from "@tshirt-platform/shared"

export interface LineArt {
  src: string
  width: number
  height: number
  calibration: ArtCalibration
}

// Calibrations come from detectArtCalibration(); lineart.test.ts fails if they drift
const TSHIRT: Record<DesignSide, LineArt> = {
  front: {
    src: "/images/design-editor/front-unline.png",
    width: 902,
    height: 899,
    calibration: { bodyWidthPx: 507, centerX: 451, hpsY: 1 },
  },
  back: {
    src: "/images/design-editor/back-unline.png",
    width: 817,
    height: 814,
    calibration: { bodyWidthPx: 459, centerX: 408, hpsY: 1 },
  },
}

// Polo and hoodie have no artwork of their own yet and reuse the t-shirt drawing
const LINE_ART: Record<ShirtType, Record<DesignSide, LineArt>> = {
  tshirt: TSHIRT,
  polo: TSHIRT,
  hoodie: TSHIRT,
}

export function getLineArt(shirtType: ShirtType, side: DesignSide): LineArt {
  return LINE_ART[shirtType][side]
}

export const ALL_LINE_ART: LineArt[] = [TSHIRT.front, TSHIRT.back]
