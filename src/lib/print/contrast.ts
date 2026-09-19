import { hexToRgb } from "./tint"

/** WCAG's floor for large text; below it a print reads as a smudge on the fabric */
export const MIN_TEXT_CONTRAST = 3

function channel(v: number): number {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** 1 (identical) to 21 (black on white) */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = luminance(hexA)
  const b = luminance(hexB)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

/** Accepts #rgb and #rrggbb; returns null for gradients, rgb() and other fills */
export function normalizeHex(fill: unknown): string | null {
  if (typeof fill !== "string") return null
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(fill.trim())
  if (!m) return null
  const h = m[1]
  return h.length === 3
    ? `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
    : `#${h}`
}

export function isLowContrast(fill: unknown, garmentHex: string): boolean {
  const hex = normalizeHex(fill)
  return hex !== null && contrastRatio(hex, garmentHex) < MIN_TEXT_CONTRAST
}
