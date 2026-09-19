import { describe, expect, it } from "vitest"
import {
  cartSubtotal,
  clampQuantity,
  editDesignHref,
  itemCount,
  lineSubtotal,
  previewOf,
  readDesign,
  type CartLine,
} from "../line-item"

const design = (side: "front" | "back", preview = true) => ({
  side,
  png_url: `https://cdn/${side}.png`,
  json_url: `https://cdn/${side}.json`,
  ...(preview ? { preview_url: `https://cdn/${side}.jpg` } : {}),
  placement: {
    side,
    print_size_mm: { width: 264, height: 336 },
    artwork_px: { width: 3118, height: 3969 },
    dpi: 300,
    reference: "HPS" as const,
    top_offset_mm: 130,
    horizontal_offset_mm: 0,
  },
})

const garment = { size: "L", color_name: "Đen", color_hex: "#1A1A1A", needs_underbase: true, supplier_color_code: null }

const line = (over: Partial<CartLine> = {}): CartLine => ({
  id: "cali_1",
  title: "T-shirt Basic",
  product_id: "prod_1",
  variant_id: "variant_1",
  quantity: 2,
  unit_price: 199000,
  metadata: { designs: [design("front"), design("back")], garment },
  ...over,
})

describe("readDesign", () => {
  it("returns the saved sides and garment", () => {
    const d = readDesign(line())
    expect(d?.designs.map((x) => x.side)).toEqual(["front", "back"])
    expect(d?.garment?.color_name).toBe("Đen")
  })

  it("ignores broken entries and returns null when none are usable", () => {
    expect(readDesign(line({ metadata: { designs: [{ side: "left" }, "x", null] } }))).toBeNull()
    expect(readDesign(line({ metadata: null }))).toBeNull()
    expect(readDesign(line({ metadata: { note: "gift" } }))).toBeNull()
  })

  it("keeps the good entries next to bad ones", () => {
    const d = readDesign(line({ metadata: { designs: [design("front"), { side: "back" }] } }))
    expect(d?.designs).toHaveLength(1)
    expect(d?.garment).toBeNull()
  })
})

describe("totals", () => {
  it("multiplies price by quantity and sums the cart", () => {
    const lines = [line(), line({ id: "b", quantity: 1, unit_price: 299000 })]
    expect(lineSubtotal(lines[0])).toBe(398000)
    expect(cartSubtotal(lines)).toBe(697000)
    expect(itemCount(lines)).toBe(3)
  })

  it("is zero for an empty cart", () => {
    expect(cartSubtotal([])).toBe(0)
    expect(itemCount([])).toBe(0)
  })
})

describe("clampQuantity", () => {
  it("keeps a whole number between 1 and 100", () => {
    expect(clampQuantity(3.9)).toBe(3)
    expect(clampQuantity(0)).toBe(1)
    expect(clampQuantity(-4)).toBe(1)
    expect(clampQuantity(500)).toBe(100)
    expect(clampQuantity(NaN)).toBe(1)
  })
})

describe("previewOf", () => {
  it("prefers the preview and falls back to the print file", () => {
    expect(previewOf(design("front") as never)).toBe("https://cdn/front.jpg")
    expect(previewOf(design("front", false) as never)).toBe("https://cdn/front.png")
  })
})

describe("editDesignHref", () => {
  it("links to the editor with the line item, variant, colour and size", () => {
    const href = editDesignHref(line())!
    const url = new URL(href, "http://x")
    expect(url.pathname).toBe("/design/prod_1")
    expect(url.searchParams.get("edit")).toBe("true")
    expect(url.searchParams.get("lineItemId")).toBe("cali_1")
    expect(url.searchParams.get("variantId")).toBe("variant_1")
    expect(url.searchParams.get("color")).toBe("Đen")
    expect(url.searchParams.get("size")).toBe("L")
    expect(url.searchParams.get("qty")).toBe("2")
  })

  it("has no link when the product is unknown", () => {
    expect(editDesignHref(line({ product_id: null }))).toBeNull()
  })
})
