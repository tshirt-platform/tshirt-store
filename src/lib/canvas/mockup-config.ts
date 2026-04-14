/** Configuration for each mockup template's layers and print area. */

export interface MockupConfig {
  id: string
  label: string
  /** Base photo (full mockup without design). Null if mask-based. */
  base: string | null
  /** Grayscale displacement map for fabric wrinkles. */
  displacement: string
  /** Shadow/highlight overlay (multiply blend). */
  shadow: string
  /** Shirt silhouette mask — design is clipped to this shape. Only for mask-based mockups. */
  mask: string | null
  /** Elements drawn on top of everything (hanger, collar, etc). */
  overlay: string | null
  /** Print area rectangle relative to the final canvas size. */
  printArea: { x: number; y: number; width: number; height: number }
  /** Output canvas size. */
  canvasSize: { width: number; height: number }
  /** Displacement strength (pixel offset range). */
  displacementStrength: number
}

export const MOCKUP_CONFIGS: MockupConfig[] = [
  {
    id: "hanger-front",
    label: "Treo móc (trước)",
    base: null,
    displacement: "/images/mockup/mockup-2/displacement.png",
    shadow: "/images/mockup/mockup-2/shadow.png",
    mask: "/images/mockup/mockup-2/mask.png",
    overlay: "/images/mockup/mockup-2/overlay.png",
    printArea: { x: 340, y: 280, width: 630, height: 780 },
    canvasSize: { width: 1312, height: 1600 },
    displacementStrength: 15,
  },
  {
    id: "runner-back",
    label: "Người chạy (sau)",
    base: "/images/mockup/mockup-1/base.png",
    displacement: "/images/mockup/mockup-1/displacement.png",
    shadow: "/images/mockup/mockup-1/shadow.png",
    mask: null,
    overlay: null,
    printArea: { x: 100, y: 60, width: 300, height: 360 },
    canvasSize: { width: 478, height: 512 },
    displacementStrength: 12,
  },
]
