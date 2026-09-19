import { env } from "@/lib/env"

export const SITE_NAME = "TShirt Studio"

export function absoluteUrl(path: string): string {
  return new URL(path, env.NEXT_PUBLIC_STORE_URL).toString()
}

interface ProductForSchema {
  id: string
  title: string
  description?: string | null
  thumbnail?: string | null
  images?: { url: string }[] | null
  variants?: { calculated_price?: { calculated_amount: number } | null }[] | null
}

/** schema.org Product for search results: one price, or a range when the variants differ */
export function productJsonLd(product: ProductForSchema, currency = "VND") {
  const prices = (product.variants ?? [])
    .map((v) => v.calculated_price?.calculated_amount)
    .filter((n): n is number => typeof n === "number")
  const images = [product.thumbnail, ...(product.images ?? []).map((i) => i.url)].filter((u): u is string => !!u)
  const url = absoluteUrl(`/products/${product.id}`)

  const low = prices.length ? Math.min(...prices) : null
  const high = prices.length ? Math.max(...prices) : null

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.description ? { description: product.description } : {}),
    ...(images.length ? { image: [...new Set(images)] } : {}),
    url,
    ...(low === null
      ? {}
      : {
          offers:
            low === high
              ? { "@type": "Offer", url, price: low, priceCurrency: currency, availability: "https://schema.org/InStock" }
              : {
                  "@type": "AggregateOffer",
                  url,
                  lowPrice: low,
                  highPrice: high,
                  priceCurrency: currency,
                  offerCount: prices.length,
                  availability: "https://schema.org/InStock",
                },
        }),
  }
}

/** JSON for a <script type="application/ld+json">: "<" is escaped so a product title cannot close the tag */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
