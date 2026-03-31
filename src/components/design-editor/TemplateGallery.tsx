"use client"

import { useState } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "@/lib/canvas/templates"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TemplateGallery() {
  const canvas = useDesignStore((s) => s.canvas)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] =
    useState<TemplateCategory>("sport")

  const filtered = TEMPLATES.filter((t) => t.category === activeCategory)

  async function loadTemplate(fabricJson: string) {
    if (!canvas) return

    const hasObjects = canvas
      .getObjects()
      .some(
        (o) =>
          !(o as fabric.FabricObject & { excludeFromExport?: boolean }).excludeFromExport &&
          !(o as fabric.FabricObject & { _isMockup?: boolean })._isMockup
      )

    if (hasObjects) {
      const ok = window.confirm(
        "Canvas đang có nội dung. Bạn có muốn thay thế bằng mẫu mới?"
      )
      if (!ok) return
    }

    // Remove user objects, keep mockup + overlay
    const toRemove = canvas.getObjects().filter(
      (o) =>
        !(o as fabric.FabricObject & { excludeFromExport?: boolean }).excludeFromExport &&
        !(o as fabric.FabricObject & { _isMockup?: boolean })._isMockup
    )
    toRemove.forEach((o) => canvas.remove(o))

    // Load template objects
    const data = JSON.parse(fabricJson)
    if (data.objects) {
      const fabric = await import("fabric")
      for (const objData of data.objects) {
        const enlivened = await fabric.util.enlivenObjects([objData])
        enlivened.forEach((obj) => canvas.add(obj as fabric.FabricObject))
      }
    }

    canvas.renderAll()
    saveSnapshot()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Mẫu thiết kế" className="size-10 rounded-lg">
          <LayoutGrid className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <SheetTitle className="border-b border-black/5 px-4 py-3 text-sm font-semibold">
          Bộ sưu tập mẫu
        </SheetTitle>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-black/5 px-4 py-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "h-7 shrink-0 rounded-md px-3 text-xs",
                activeCategory === cat.value &&
                  "bg-studio-charcoal text-white hover:bg-studio-charcoal/90 hover:text-white"
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-2 p-4">
          {filtered.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => loadTemplate(tpl.fabricJson)}
              className={cn(
                "group flex flex-col overflow-hidden rounded-lg border border-black/5 transition-shadow hover:shadow-md"
              )}
            >
              <div
                className={cn(
                  "flex h-24 items-center justify-center text-xs font-medium",
                  tpl.color
                )}
              >
                {tpl.name}
              </div>
              <div className="p-2 text-left text-xs text-studio-charcoal/60">
                {tpl.name}
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
