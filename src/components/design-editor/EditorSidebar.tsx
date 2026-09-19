"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import LayerPanel from "./LayerPanel"
import PreviewPanel from "./PreviewPanel"

const TABS = [
  { id: "preview", label: "Xem trước" },
  { id: "layers", label: "Layer" },
] as const

type Tab = (typeof TABS)[number]["id"]

/** Right column of the editor: the live preview by default, the layer list one tab over */
export default function EditorSidebar({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>("preview")

  return (
    <div className={cn("flex min-h-0 flex-col bg-white", className)}>
      <div role="tablist" className="flex border-b border-black/5">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 px-3 py-2.5 text-xs font-medium transition-colors",
              tab === t.id
                ? "border-b-2 border-studio-charcoal text-studio-charcoal"
                : "text-studio-charcoal/50 hover:text-studio-charcoal"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="min-h-0 flex-1 overflow-hidden">
        {/* Both stay mounted so the preview keeps rendering while the layers are open */}
        <div className={cn("h-full", tab !== "preview" && "hidden")}>
          <PreviewPanel />
        </div>
        <div className={cn("h-full", tab !== "layers" && "hidden")}>
          <LayerPanel />
        </div>
      </div>
    </div>
  )
}
