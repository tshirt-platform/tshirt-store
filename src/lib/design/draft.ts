import type { DesignSide } from "@tshirt-platform/shared"

export interface DesignDraft {
  designId: string
  sides: { side: DesignSide; jsonUrl: string }[]
  savedAt: number
}

const key = (productId: string) => `tshirt.design-draft.v1.${productId}`
const isSide = (v: unknown): v is DesignSide => v === "front" || v === "back"

function parse(raw: string | null): DesignDraft | null {
  if (!raw) return null
  try {
    const d = JSON.parse(raw) as Partial<DesignDraft>
    if (typeof d.designId !== "string" || typeof d.savedAt !== "number" || !Array.isArray(d.sides)) return null
    const sides = d.sides.filter(
      (s): s is DesignDraft["sides"][number] => !!s && isSide(s.side) && typeof s.jsonUrl === "string"
    )
    return sides.length > 0 ? { designId: d.designId, sides, savedAt: d.savedAt } : null
  } catch {
    return null
  }
}

/** The design a customer saved for a product on this device. Storage can be blocked: never throws. */
export function readDraft(productId: string): DesignDraft | null {
  try {
    return parse(window.localStorage.getItem(key(productId)))
  } catch {
    return null
  }
}

export function saveDraft(productId: string, draft: DesignDraft): boolean {
  try {
    window.localStorage.setItem(key(productId), JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function clearDraft(productId: string): void {
  try {
    window.localStorage.removeItem(key(productId))
  } catch {
    // nothing to clear when storage is unavailable
  }
}
