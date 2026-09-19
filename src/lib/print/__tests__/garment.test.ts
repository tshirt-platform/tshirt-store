import { describe, expect, it } from "vitest"
import { inferShirtType, layoutForGarment, resolveGarment } from "../garment"

const metadata = {
  print_config: {
    shirt_type: "polo",
    size_chart: [{ size: "S", shoulder: 42, chest: 96, length: 68 }],
    neck_drop_front_cm: 7,
    neck_drop_back_cm: 2,
    colors: [
      { name: "Đen", hex: "#101010", is_dark: true, needs_underbase: true },
      { name: "Trắng", hex: "#FFFFFF", is_dark: false, needs_underbase: false },
    ],
  },
}

describe("inferShirtType", () => {
  it("reads the product handle", () => {
    expect(inferShirtType("hoodie")).toBe("hoodie")
    expect(inferShirtType("polo-classic")).toBe("polo")
    expect(inferShirtType("tshirt-basic")).toBe("tshirt")
    expect(inferShirtType(null)).toBe("tshirt")
  })
})

describe("resolveGarment", () => {
  it("uses the product's own print config and the colour from the URL", () => {
    const g = resolveGarment({
      productId: "prod_1",
      handle: "tshirt-basic",
      metadata,
      search: { color: "Đen", size: "L", variantId: "variant_9", qty: "3" },
    })
    expect(g.usesDefaultConfig).toBe(false)
    expect(g.shirtType).toBe("polo")
    expect(g.color.hex).toBe("#101010")
    expect(g.size).toBe("L")
    expect(g.variantId).toBe("variant_9")
    expect(g.quantity).toBe(3)
  })

  it("falls back to the default config and white when data is missing", () => {
    const g = resolveGarment({ productId: "prod_01" })
    expect(g.usesDefaultConfig).toBe(true)
    expect(g.color.name).toBe("Trắng")
    expect(g.size).toBeNull()
    expect(g.variantId).toBeNull()
    expect(g.quantity).toBe(1)
  })

  it("falls back and reports why when the stored config is malformed", () => {
    const g = resolveGarment({
      productId: "p",
      metadata: { print_config: { size_chart: [] } },
    })
    expect(g.usesDefaultConfig).toBe(true)
    expect(g.configError).toContain("malformed")
  })

  it("falls back when the print would not fit on the garment", () => {
    const g = resolveGarment({
      productId: "p",
      metadata: {
        print_config: {
          ...metadata.print_config,
          size_chart: [{ size: "S", shoulder: 42, chest: 96, length: 40 }],
        },
      },
    })
    expect(g.usesDefaultConfig).toBe(true)
    expect(g.configError).toContain("does not fit")
  })

  it("reports no error when there is simply no config", () => {
    expect(resolveGarment({ productId: "p" }).configError).toBeNull()
  })

  it("ignores an unknown colour and clamps the quantity", () => {
    const g = resolveGarment({
      productId: "p",
      metadata,
      search: { color: "Tím", qty: "9999" },
    })
    expect(g.color.name).toBe("Trắng")
    expect(g.quantity).toBe(100)
    expect(resolveGarment({ productId: "p", search: { qty: "abc" } }).quantity).toBe(1)
  })

  it("accepts array-valued query params", () => {
    const g = resolveGarment({ productId: "p", search: { color: ["Navy", "Đỏ"] } })
    expect(g.color.name).toBe("Navy")
  })

  it("infers the shirt type from the handle when the config has none", () => {
    const g = resolveGarment({ productId: "p", handle: "hoodie" })
    expect(g.shirtType).toBe("hoodie")
  })
})

describe("layoutForGarment", () => {
  it("builds a layout for each side from the garment's own measurements", () => {
    const g = resolveGarment({ productId: "p" })
    const front = layoutForGarment(g, "front")
    const back = layoutForGarment(g, "back")
    expect(front.area.topOffsetMm).toBe(130)
    expect(back.area.topOffsetMm).toBe(75)
    expect(front.art.src).toContain("front")
    expect(back.art.src).toContain("back")
    expect(front.width).toBe(back.width)
    expect(front.height).toBeCloseTo(back.height, 6)
  })
})
