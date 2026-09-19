import {
  DEFAULT_GARMENT_COLORS,
  DEFAULT_PRINT_CONFIG_META,
  derivePrintArea,
  findGarmentColor,
  parsePrintConfig,
  toGarmentMeasurements,
  type DesignSide,
  type GarmentColor,
  type PrintConfigMeta,
  type ShirtType,
} from "@tshirt-platform/shared"
import { buildEditorLayout, type EditorLayout } from "./editor-layout"
import { getLineArt } from "./lineart"

export interface GarmentContext {
  productId: string
  productTitle: string | null
  shirtType: ShirtType
  config: PrintConfigMeta
  /** True when the product carries no usable print_config and defaults were used */
  usesDefaultConfig: boolean
  /** Why the product's own config was rejected, if it was present but unusable */
  configError: string | null
  color: GarmentColor
  size: string | null
  variantId: string | null
  quantity: number
  /** Cart line whose saved design is being edited, when the editor was opened from the cart */
  editLineItemId: string | null
}

export interface GarmentInput {
  productId: string
  title?: string | null
  handle?: string | null
  metadata?: Record<string, unknown> | null
  search?: {
    color?: string | string[]
    size?: string | string[]
    variantId?: string | string[]
    qty?: string | string[]
    edit?: string | string[]
    lineItemId?: string | string[]
  }
}

function first(v: string | string[] | undefined): string | null {
  const s = Array.isArray(v) ? v[0] : v
  return s ? s : null
}

export function inferShirtType(handle: string | null | undefined): ShirtType {
  const h = (handle ?? "").toLowerCase()
  if (h.includes("hoodie")) return "hoodie"
  if (h.includes("polo")) return "polo"
  return "tshirt"
}

function parseQuantity(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : NaN
  return Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : 1
}

export function layoutForGarment(garment: GarmentContext, side: DesignSide): EditorLayout {
  const area = derivePrintArea(toGarmentMeasurements(garment.config), side)
  return buildEditorLayout(area, getLineArt(garment.shirtType, side))
}

function checkPrintFits(config: PrintConfigMeta): string | null {
  try {
    const m = toGarmentMeasurements(config)
    derivePrintArea(m, "front")
    derivePrintArea(m, "back")
    return null
  } catch (e) {
    return e instanceof Error ? e.message : "Invalid print configuration"
  }
}

export function resolveGarment(input: GarmentInput): GarmentContext {
  const raw = input.metadata?.print_config
  const candidate = parsePrintConfig(raw)
  let configError: string | null = null
  if (raw !== undefined && candidate === null) {
    configError = "print_config is malformed"
  } else if (candidate) {
    configError = checkPrintFits(candidate)
  }
  const parsed = configError === null ? candidate : null
  const config = parsed ?? DEFAULT_PRINT_CONFIG_META
  const shirtType = parsed?.shirt_type ?? inferShirtType(input.handle)

  const colorName = first(input.search?.color)
  const color =
    findGarmentColor(colorName, config.colors) ??
    findGarmentColor("Trắng", config.colors) ??
    config.colors[0] ??
    DEFAULT_GARMENT_COLORS[0]

  return {
    productId: input.productId,
    productTitle: input.title ?? null,
    shirtType,
    config,
    usesDefaultConfig: parsed === null,
    configError,
    color,
    size: first(input.search?.size),
    variantId: first(input.search?.variantId),
    quantity: parseQuantity(first(input.search?.qty)),
    editLineItemId: first(input.search?.edit) === "true" ? first(input.search?.lineItemId) : null,
  }
}
