import type { Metadata } from "next"
import { DesignEditorLoader } from "./DesignEditorLoader"

export const metadata: Metadata = {
  title: "Studio sáng tạo — TShirt Studio",
}

export default async function DesignPage(props: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await props.params

  return <DesignEditorLoader productId={productId} />
}
