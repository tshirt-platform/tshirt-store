"use client"

import dynamic from "next/dynamic"
import type { GarmentContext } from "@/lib/print/garment"

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
  garment: GarmentContext
}

export function DesignEditorLoader({ garment }: DesignEditorLoaderProps) {
  return <DesignEditorRoot garment={garment} />
}
