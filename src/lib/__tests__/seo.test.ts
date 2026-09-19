import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/env", () => ({ env: { NEXT_PUBLIC_STORE_URL: "https://shop.example" } }))

import { absoluteUrl, productJsonLd, serializeJsonLd } from "../seo"

const base = { id: "prod_1", title: "T-shirt Premium", description: "Áo thun cotton" }
const variant = (n: number) => ({ calculated_price: { calculated_amount: n } })

describe("absoluteUrl", () => {
  it("builds addresses from the store URL", () => {
    expect(absoluteUrl("/products/prod_1")).toBe("https://shop.example/products/prod_1")
  })
})

describe("productJsonLd", () => {
  it("describes a product with one price as an Offer", () => {
    const ld = productJsonLd({ ...base, thumbnail: "https://i/1.jpg", variants: [variant(249000), variant(249000)] })
    expect(ld).toMatchObject({
      "@type": "Product",
      name: "T-shirt Premium",
      image: ["https://i/1.jpg"],
      url: "https://shop.example/products/prod_1",
      offers: { "@type": "Offer", price: 249000, priceCurrency: "VND" },
    })
  })

  it("uses a price range when variants differ", () => {
    const ld = productJsonLd({ ...base, variants: [variant(249000), variant(299000)] })
    expect(ld.offers).toMatchObject({ "@type": "AggregateOffer", lowPrice: 249000, highPrice: 299000, offerCount: 2 })
  })

  it("leaves out what it does not know instead of inventing it", () => {
    const ld = productJsonLd({ id: "prod_2", title: "Bare", variants: [{ calculated_price: null }] })
    expect(ld).not.toHaveProperty("offers")
    expect(ld).not.toHaveProperty("image")
    expect(ld).not.toHaveProperty("description")
  })

  it("lists each image once", () => {
    const ld = productJsonLd({ ...base, thumbnail: "https://i/1.jpg", images: [{ url: "https://i/1.jpg" }, { url: "https://i/2.jpg" }] })
    expect(ld.image).toEqual(["https://i/1.jpg", "https://i/2.jpg"])
  })
})

describe("serializeJsonLd", () => {
  it("cannot be closed early by a title", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" })
    expect(out).not.toContain("</script>")
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>")
  })
})
