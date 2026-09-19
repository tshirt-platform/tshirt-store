import type { MetadataRoute } from "next"
import { medusa } from "@/lib/medusa"
import { absoluteUrl } from "@/lib/seo"

// Products come from the backend, so the file is rebuilt at most hourly
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.9 },
  ]

  try {
    const { products } = (await medusa.store.product.list({ limit: 200, fields: "id,updated_at" })) as {
      products: { id: string; updated_at?: string | null }[]
    }
    return [
      ...pages,
      ...products.map((p) => ({
        url: absoluteUrl(`/products/${p.id}`),
        lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ]
  } catch {
    // With the backend down the static pages are still worth listing
    return pages
  }
}
