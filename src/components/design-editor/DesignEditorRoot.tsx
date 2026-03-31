"use client"

import { useEffect } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import { EditorErrorBoundary } from "./EditorErrorBoundary"
import DesignCanvas from "./DesignCanvas"
import ToolBar from "./ToolBar"

interface DesignEditorRootProps {
  productId: string
}

export default function DesignEditorRoot({ productId }: DesignEditorRootProps) {
  const setProductId = useDesignStore((s) => s.setProductId)

  useEffect(() => {
    setProductId(productId)
  }, [productId, setProductId])

  return (
    <EditorErrorBoundary>
      <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
        {/* Toolbar — top on mobile, left on desktop */}
        <ToolBar />

        {/* Canvas area */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-4">
          <DesignCanvas />
        </div>

        {/* Right panel placeholder — LayerPanel will go here */}
        <div className="hidden w-64 border-l border-black/5 bg-white md:block">
          <div className="p-4 text-xs text-studio-charcoal/40">
            Layer Panel
          </div>
        </div>
      </div>
    </EditorErrorBoundary>
  )
}
