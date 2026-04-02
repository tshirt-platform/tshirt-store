"use client"

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

interface DesignEditorLoaderProps {
  productId: string
}

export function DesignEditorLoader({ productId }: DesignEditorLoaderProps) {
  return <DesignEditorRoot productId={productId} />
}
