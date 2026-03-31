"use client"

import { useEffect } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import { useDesignShortcuts } from "@/hooks/useDesignShortcuts"
import { EditorErrorBoundary } from "./EditorErrorBoundary"
import DesignCanvas from "./DesignCanvas"
import ToolBar from "./ToolBar"
import TextEditor from "./TextEditor"
import TextContextPanel from "./TextContextPanel"
import ImageUploader from "./ImageUploader"
import LayerPanel from "./LayerPanel"
import SideToggle from "./SideToggle"
import TemplateGallery from "./TemplateGallery"

interface DesignEditorRootProps {
  productId: string
}

export default function DesignEditorRoot({ productId }: DesignEditorRootProps) {
  const setProductId = useDesignStore((s) => s.setProductId)
  useDesignShortcuts()

  useEffect(() => {
    setProductId(productId)
  }, [productId, setProductId])

  return (
    <EditorErrorBoundary>
      <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
        {/* Toolbar */}
        <ToolBar />

        {/* Canvas area */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Top bar: side toggle */}
          <div className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-2">
            <SideToggle />
            <TemplateGallery />
          </div>

          {/* Canvas + floating panels */}
          <div className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-4">
            <TextContextPanel />
            <DesignCanvas />
          </div>
        </div>

        {/* Right panel — layers */}
        <div className="hidden w-64 border-l border-black/5 bg-white md:block">
          <LayerPanel />
        </div>

        {/* Invisible components */}
        <TextEditor />
        <ImageUploader />
      </div>
    </EditorErrorBoundary>
  )
}
