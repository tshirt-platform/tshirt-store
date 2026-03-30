import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { medusa } from "@/lib/medusa"
import { ImageGallery } from "@/components/product/ImageGallery"
import { VariantSelector } from "@/components/product/VariantSelector"

type ProductImage = { url: string }
type OptionValue = { value: string }
type ProductOption = { id: string; title: string; values: OptionValue[] }
type VariantOption = { option_id: string; value: string }
type Variant = {
  id: string
  options?: VariantOption[] | null
  calculated_price?: { calculated_amount: number } | null
}

type Product = {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  images?: ProductImage[] | null
  options?: ProductOption[] | null
  variants?: Variant[] | null
}

async function getRegionId(): Promise<string> {
  const { regions } = await medusa.store.region.list({ limit: 1 })
  const region = (regions as Array<{ id: string }>)[0]
  return region.id
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const regionId = await getRegionId()
    const { product } = await medusa.store.product.retrieve(id, {
      region_id: regionId,
      fields: "+variants.calculated_price,+variants.options,+options.values",
    })
    return product as Product
  } catch {
    return null
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await props.params
  const product = await getProduct(id)
  if (!product) return { title: "Sản phẩm không tìm thấy" }
  return {
    title: product.title,
    description: product.description ?? undefined,
  }
}

export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const images = [
    ...(product.thumbnail ? [{ url: product.thumbnail, alt: product.title }] : []),
    ...(product.images?.map((img) => ({ url: img.url, alt: product.title })) ?? []),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left: images */}
        <ImageGallery images={images} />

        {/* Right: product info */}
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          {product.description && (
            <p className="text-muted-foreground mt-3">{product.description}</p>
          )}

          <div className="mt-8">
            <VariantSelector
              productId={product.id}
              options={product.options ?? []}
              variants={product.variants ?? []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
