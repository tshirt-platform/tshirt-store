"use client"

import { useState } from "react"
import {
  MousePointer2,
  Type,
  ImagePlus,
  LayoutGrid,
  Undo2,
  Redo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDesignStore } from "@/lib/store/design.store"
import { cn } from "@/lib/utils"
import type { ActiveTool } from "@tshirt/shared"
import TemplateGallery from "./TemplateGallery"

const TOOLS: { tool: ActiveTool; icon: typeof MousePointer2; label: string }[] = [
  { tool: "select", icon: MousePointer2, label: "Chọn" },
  { tool: "text", icon: Type, label: "Văn bản" },
  { tool: "image", icon: ImagePlus, label: "Hình ảnh" },
]

export default function ToolBar() {
  const activeTool = useDesignStore((s) => s.activeTool)
  const setActiveTool = useDesignStore((s) => s.setActiveTool)
  const undo = useDesignStore((s) => s.undo)
  const redo = useDesignStore((s) => s.redo)
  const historyIndex = useDesignStore((s) => s.historyIndex)
  const historyLength = useDesignStore((s) => s.history.length)
  const [templateOpen, setTemplateOpen] = useState(false)

  return (
    <div className="flex flex-row gap-1 border-b border-black/5 bg-white p-2 md:flex-col md:border-r md:border-b-0">
      {TOOLS.map(({ tool, icon: Icon, label }) => (
        <Button
          key={tool}
          variant="ghost"
          size="icon"
          title={label}
          onClick={() => setActiveTool(tool)}
          className={cn(
            "size-10 rounded-lg",
            activeTool === tool &&
              "bg-studio-charcoal text-white hover:bg-studio-charcoal/90 hover:text-white"
          )}
        >
          <Icon className="size-5" />
        </Button>
      ))}

      {/* Template gallery button */}
      <Button
        variant="ghost"
        size="icon"
        title="Mẫu thiết kế"
        onClick={() => setTemplateOpen(true)}
        className={cn(
          "size-10 rounded-lg",
          templateOpen &&
            "bg-studio-charcoal text-white hover:bg-studio-charcoal/90 hover:text-white"
        )}
      >
        <LayoutGrid className="size-5" />
      </Button>
      <TemplateGallery open={templateOpen} onOpenChange={setTemplateOpen} />

      <div className="mx-1 hidden h-px bg-black/10 md:block md:h-auto md:w-px" />

      <Button
        variant="ghost"
        size="icon"
        title="Undo (Ctrl+Z)"
        onClick={undo}
        disabled={historyIndex <= 0}
        className="size-10 rounded-lg"
      >
        <Undo2 className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Redo (Ctrl+Shift+Z)"
        onClick={redo}
        disabled={historyIndex >= historyLength - 1}
        className="size-10 rounded-lg"
      >
        <Redo2 className="size-5" />
      </Button>
    </div>
  )
}
