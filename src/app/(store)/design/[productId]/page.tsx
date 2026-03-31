import type { Metadata } from "next"
import dynamic from "next/dynamic"

const DesignEditorRoot = dynamic(
  () => import("@/components/design-editor/DesignEditorRoot"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-sm text-studio-charcoal/50">
          Đang tải studio sáng tạo...
        </p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: "Studio sáng tạo — TShirt Studio",
}

export default async function DesignPage(props: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await props.params

  return <DesignEditorRoot productId={productId} />
}
