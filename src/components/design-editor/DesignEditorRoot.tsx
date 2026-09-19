"use client"

import { useEffect } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import { useDesignShortcuts } from "@/hooks/useDesignShortcuts"
import { useLoadSavedDesign } from "@/hooks/useLoadSavedDesign"
import type { GarmentContext } from "@/lib/print/garment"
import { EditorErrorBoundary } from "./EditorErrorBoundary"
import DesignCanvas from "./DesignCanvas"
import ToolBar from "./ToolBar"
import TextEditor from "./TextEditor"
import TextContextPanel from "./TextContextPanel"
import ImageUploader from "./ImageUploader"
import EditorSidebar from "./EditorSidebar"
import SideToggle from "./SideToggle"
import ColorPicker from "./ColorPicker"
import ContrastWarning from "./ContrastWarning"
import SaveDesign from "./SaveDesign"

import DpiIndicator from "./DpiIndicator"

interface DesignEditorRootProps {
  garment: GarmentContext
}

export default function DesignEditorRoot({ garment }: DesignEditorRootProps) {
  const setGarment = useDesignStore((s) => s.setGarment)
  const ready = useDesignStore((s) => s.garment?.productId === garment.productId)
  useDesignShortcuts()
  useLoadSavedDesign()

  useEffect(() => {
    setGarment(garment)
  }, [garment, setGarment])

  return (
    <EditorErrorBoundary>
      <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
        {/* Toolbar */}
        <ToolBar />

        {/* Canvas area */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Top bar: side toggle + colour + DPI indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 bg-white px-4 py-2">
            <div className="flex flex-wrap items-center gap-3">
              <SideToggle />
              {!garment.editLineItemId && <ColorPicker />}
              <DpiIndicator />
            </div>
            <SaveDesign />
          </div>

          {garment.configError && (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
              Cấu hình in của sản phẩm không hợp lệ ({garment.configError}) —
              đang dùng số đo mặc định.
            </div>
          )}

          <ContrastWarning />

          {/* Canvas + floating panels */}
          <div className="relative flex-1 overflow-hidden bg-[#F5F5F0]">
            <TextContextPanel />
            {ready && <DesignCanvas />}
          </div>
        </div>

        {/* Right panel: live preview and layers. Below the canvas on a phone */}
        <EditorSidebar className="h-[38vh] border-t border-black/5 md:h-auto md:w-80 md:border-l md:border-t-0" />

        {/* Invisible components */}
        <TextEditor />
        <ImageUploader />
      </div>
    </EditorErrorBoundary>
  )
}
