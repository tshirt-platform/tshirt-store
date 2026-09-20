"use client"

import { useEffect } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import { useDesignShortcuts } from "@/hooks/useDesignShortcuts"
import { useLoadSavedDesign } from "@/hooks/useLoadSavedDesign"
import { useRestoreDraft } from "@/hooks/useDesignDraft"
import { usePreviewScreen } from "@/hooks/usePreviewScreen"
import { cn } from "@/lib/utils"
import type { GarmentContext } from "@/lib/print/garment"
import { EditorErrorBoundary } from "./EditorErrorBoundary"
import DesignCanvas from "./DesignCanvas"
import ToolBar from "./ToolBar"
import TextEditor from "./TextEditor"
import TextContextPanel from "./TextContextPanel"
import ImageUploader from "./ImageUploader"
import LayerPanel from "./LayerPanel"
import EditorActions from "./EditorActions"
import PreviewScreen from "./PreviewScreen"
import SideToggle from "./SideToggle"
import ColorPicker from "./ColorPicker"
import ContrastWarning from "./ContrastWarning"

import DpiIndicator from "./DpiIndicator"

interface DesignEditorRootProps {
  garment: GarmentContext
}

export default function DesignEditorRoot({ garment }: DesignEditorRootProps) {
  const setGarment = useDesignStore((s) => s.setGarment)
  const ready = useDesignStore((s) => s.garment?.productId === garment.productId)
  useDesignShortcuts()
  useLoadSavedDesign()
  useRestoreDraft()
  const preview = usePreviewScreen()
  const previewing = preview.phase !== "closed"

  useEffect(() => {
    setGarment(garment)
  }, [garment, setGarment])

  return (
    <EditorErrorBoundary>
      <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
        {/* Toolbar */}
        {!previewing && <ToolBar />}

        {/* Canvas area */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Top bar: side toggle + colour + DPI indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 bg-white px-4 py-2">
            <div className="flex flex-wrap items-center gap-3">
              {previewing ? (
                <span className="text-sm font-medium">Xem trước thiết kế</span>
              ) : (
                <>
                  <SideToggle />
                  {!garment.editLineItemId && <ColorPicker />}
                  <DpiIndicator />
                </>
              )}
            </div>
            <EditorActions phase={preview.phase} onContinue={preview.open} onBack={preview.close} />
          </div>

          {garment.configError && (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
              Cấu hình in của sản phẩm không hợp lệ ({garment.configError}) —
              đang dùng số đo mặc định.
            </div>
          )}

          {!previewing && <ContrastWarning />}

          {previewing && (
            <PreviewScreen
              phase={preview.phase}
              views={preview.views}
              error={preview.error}
              onRetry={preview.open}
              onBack={preview.close}
            />
          )}

          {/* Canvas + floating panels; kept mounted while previewing so the design is not lost */}
          <div className={cn("relative flex-1 overflow-hidden bg-[#F5F5F0]", previewing && "hidden")}>
            <TextContextPanel />
            {ready && <DesignCanvas />}
          </div>
        </div>

        {/* Right panel: layers */}
        {!previewing && (
          <div className="hidden w-64 border-l border-black/5 bg-white md:block">
            <LayerPanel />
          </div>
        )}

        {/* Invisible components */}
        <TextEditor />
        <ImageUploader />
      </div>
    </EditorErrorBoundary>
  )
}
