"use client"

import Image from "next/image"
import type { FabricObject } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import { TEMPLATES } from "@/lib/canvas/templates"
import { getPrintArea, applyPrintClip } from "@/lib/canvas/constraints"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TemplateGallery({
  open,
  onOpenChange,
}: TemplateGalleryProps) {
  const canvas = useDesignStore((s) => s.canvas)
  const side = useDesignStore((s) => s.side)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)

  async function loadTemplate(src: string) {
    if (!canvas) return

    const hasObjects = canvas
      .getObjects()
      .some(
        (o) =>
          !(o as FabricObject & { excludeFromExport?: boolean })
            .excludeFromExport &&
          !(o as FabricObject & { _isMockup?: boolean })._isMockup &&
          !(o as FabricObject & { _isPrintOverlay?: boolean })._isPrintOverlay
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
        !(o as FabricObject & { excludeFromExport?: boolean })
          .excludeFromExport &&
        !(o as FabricObject & { _isMockup?: boolean })._isMockup &&
        !(o as FabricObject & { _isPrintOverlay?: boolean })._isPrintOverlay
    )
    toRemove.forEach((o) => canvas.remove(o))

    // Load template image
    const fabric = await import("fabric")
    const img = await fabric.FabricImage.fromURL(src)
    const printArea = getPrintArea(side)

    const imgW = img.width ?? 1
    const imgH = img.height ?? 1
    const scale = Math.min(
      printArea.width / imgW,
      printArea.height / imgH,
      1
    )
    const scaledW = imgW * scale
    const scaledH = imgH * scale

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: printArea.x + (printArea.width - scaledW) / 2,
      top: printArea.y + (printArea.height - scaledH) / 2,
      originX: "left",
      originY: "top",
    })

    await applyPrintClip(img, side)
    canvas.add(img)
    canvas.setActiveObject(img)
    canvas.renderAll()
    saveSnapshot()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0">
        <SheetTitle className="border-b border-black/5 px-4 py-3 text-sm font-semibold">
          Mẫu thiết kế
        </SheetTitle>

        <div className="grid grid-cols-2 gap-3 p-4">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => loadTemplate(tpl.src)}
              className="group overflow-hidden rounded-lg border border-black/10 transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={tpl.src}
                  alt={tpl.name}
                  fill
                  className="object-contain p-2 transition-transform group-hover:scale-105"
                  sizes="140px"
                />
              </div>
              <div className="border-t border-black/5 px-2 py-1.5 text-xs text-studio-charcoal/60">
                {tpl.name}
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
