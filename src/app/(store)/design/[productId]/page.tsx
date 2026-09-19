import type { Metadata } from "next"
import { medusa } from "@/lib/medusa"
import { resolveGarment, type GarmentInput } from "@/lib/print/garment"
import { DesignEditorLoader } from "./DesignEditorLoader"

export const metadata: Metadata = {
  title: "Studio sáng tạo — TShirt Studio",
  // The editor is an app screen, not content
  robots: { index: false, follow: false },
}

type ProductInfo = {
  title: string
  handle: string | null
  metadata: Record<string, unknown> | null
}

// Unknown products (e.g. template links) still open the editor with default measurements
async function getProductInfo(id: string): Promise<ProductInfo | null> {
  try {
    const { product } = await medusa.store.product.retrieve(id, {
      fields: "id,title,handle,metadata",
    })
    return {
      title: product.title,
      handle: product.handle ?? null,
      metadata: (product.metadata as Record<string, unknown> | null) ?? null,
    }
  } catch {
    return null
  }
}

export default async function DesignPage(props: {
  params: Promise<{ productId: string }>
  searchParams: Promise<GarmentInput["search"]>
}) {
  const { productId } = await props.params
  const search = await props.searchParams
  const product = await getProductInfo(productId)

  const garment = resolveGarment({
    productId,
    title: product?.title,
    handle: product?.handle,
    metadata: product?.metadata,
    search,
  })

  return <DesignEditorLoader garment={garment} />
}
