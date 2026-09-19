import type { CartLineItemMetadata, DesignAsset } from "@tshirt-platform/shared"

/** The slice of a Medusa cart line item this store reads */
export interface CartLine {
  id: string
  title: string
  product_id?: string | null
  variant_id?: string | null
  quantity: number
  unit_price: number
  total?: number | null
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
}

export interface DesignLine {
  designs: DesignAsset[]
  garment: CartLineItemMetadata["garment"] | null
}

function isDesignAsset(v: unknown): v is DesignAsset {
  if (typeof v !== "object" || v === null) return false
  const d = v as Record<string, unknown>
  return (
    (d.side === "front" || d.side === "back") &&
    typeof d.png_url === "string" &&
    typeof d.json_url === "string"
  )
}

/** Reads the design a customer saved on a line item; null for items without one */
export function readDesign(line: CartLine): DesignLine | null {
  const meta = line.metadata
  if (!meta) return null

  if (Array.isArray(meta.designs)) {
    const designs = meta.designs.filter(isDesignAsset)
    if (designs.length > 0) {
      const garment =
        typeof meta.garment === "object" && meta.garment !== null
          ? (meta.garment as CartLineItemMetadata["garment"])
          : null
      return { designs, garment }
    }
  }
  return null
}

export function lineSubtotal(line: CartLine): number {
  return line.unit_price * line.quantity
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + lineSubtotal(l), 0)
}

export function itemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0)
}

const SIDE_LABEL = { front: "Mặt trước", back: "Mặt sau" } as const
export const sideLabel = (side: "front" | "back") => SIDE_LABEL[side]

/** Image to show for a design: the preview, falling back to the print file */
export function previewOf(design: DesignAsset): string {
  return design.preview_url ?? design.png_url
}

export const MAX_LINE_QUANTITY = 100

export function clampQuantity(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.floor(n)))
}

/** Where to send a customer to change a saved design */
export function editDesignHref(line: CartLine): string | null {
  if (!line.product_id) return null
  const params = new URLSearchParams({ edit: "true", lineItemId: line.id })
  if (line.variant_id) params.set("variantId", line.variant_id)
  const d = readDesign(line)
  if (d?.garment) {
    params.set("color", d.garment.color_name)
    params.set("size", d.garment.size)
  }
  params.set("qty", String(line.quantity))
  return `/design/${line.product_id}?${params.toString()}`
}
