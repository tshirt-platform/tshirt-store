import { Suspense } from "react"
import type { Metadata } from "next"
import { medusa } from "@/lib/medusa"
import { ProductCard } from "@/components/product/ProductCard"
import { ProductFilter } from "@/components/product/ProductFilter"

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Khám phá bộ sưu tập áo thun, polo, hoodie custom design.",
}

type ProductOption = {
  id: string
  title: string
  values: Array<{ value: string }>
}

type ProductVariant = {
  id: string
  calculated_price?: { calculated_amount: number } | null
}

type Product = {
  id: string
  title: string
  thumbnail: string | null
  tags?: Array<{ value: string }> | null
  options?: ProductOption[] | null
  variants?: ProductVariant[] | null
}

async function getRegionId(): Promise<string> {
  const { regions } = await medusa.store.region.list({ limit: 1 })
  const region = (regions as Array<{ id: string }>)[0]
  return region.id
}

async function getProducts(type?: string) {
  const regionId = await getRegionId()
  const query: Record<string, unknown> = {
    limit: 50,
    region_id: regionId,
    fields: "+variants.calculated_price,+options.values",
  }

  if (type) {
    query.tag = type
  }

  const { products } = await medusa.store.product.list(query)
  return products as Product[]
}

function extractColors(product: Product): string[] {
  const colorOption = product.options?.find(
    (o) => o.title.toLowerCase() === "color"
  )
  return colorOption?.values?.map((v) => v.value) ?? []
}

function getPrice(product: Product): number {
  const variant = product.variants?.[0]
  return variant?.calculated_price?.calculated_amount ?? 0
}

function getTag(product: Product): string | null {
  return product.tags?.[0]?.value ?? null
}

export default async function ProductsPage(props: {
  searchParams: Promise<{ type?: string }>
}) {
  const searchParams = await props.searchParams
  const products = await getProducts(searchParams.type)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Sản phẩm</h1>
      <p className="text-muted-foreground mt-2">
        Chọn sản phẩm và bắt đầu thiết kế
      </p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <ProductFilter />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            Không tìm thấy sản phẩm nào.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              thumbnail={product.thumbnail}
              price={getPrice(product)}
              colors={extractColors(product)}
              tag={getTag(product)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
