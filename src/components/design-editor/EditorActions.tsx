"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSaveDraft } from "@/hooks/useDesignDraft"
import type { PreviewPhase } from "@/hooks/usePreviewScreen"
import SaveDesign from "./SaveDesign"

interface Props {
  phase: PreviewPhase
  onContinue: () => void
  onBack: () => void
}

/** The two ways out of editing (save it, or go on to the preview) and the way out of the preview */
export default function EditorActions({ phase, onContinue, onBack }: Props) {
  const { saving, save } = useSaveDraft()

  if (phase !== "closed") {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack} className="h-8 px-4 text-xs">
          Chỉnh sửa tiếp
        </Button>
        {phase === "ready" && <SaveDesign />}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={save} disabled={saving} className="h-8 px-4 text-xs">
        {saving ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
        Lưu thiết kế
      </Button>
      <Button size="sm" onClick={onContinue} className="h-8 px-4 text-xs">
        Tiếp tục
      </Button>
    </div>
  )
}
