"use client"

import { useEffect, useState, useCallback } from "react"
import type { FabricImage, FabricObject } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import { calculateDpi } from "@/lib/canvas/constraints"
import { cn } from "@/lib/utils"

interface DpiInfo {
  dpi: number
  originalWidth: number
  originalHeight: number
}

function getDpiLevel(dpi: number): {
  label: string
  color: string
} {
  if (dpi >= 300) return { label: "Excellent", color: "text-green-600 bg-green-50 border-green-200" }
  if (dpi >= 150) return { label: "Good", color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
  return { label: "Low", color: "text-red-600 bg-red-50 border-red-200" }
}

function isImage(obj: FabricObject): obj is FabricImage {
  return obj.type === "image"
}

export default function DpiIndicator() {
  const canvas = useDesignStore((s) => s.canvas)
  const side = useDesignStore((s) => s.side)
  const [dpiInfo, setDpiInfo] = useState<DpiInfo | null>(null)

  const updateDpi = useCallback(() => {
    if (!canvas) {
      setDpiInfo(null)
      return
    }

    const active = canvas.getActiveObject()
    if (!active || !isImage(active)) {
      setDpiInfo(null)
      return
    }

    const originalWidth = active.width ?? 0
    const originalHeight = active.height ?? 0
    const displayWidth = active.getScaledWidth()
    const dpi = calculateDpi(originalWidth, displayWidth, side)

    setDpiInfo({ dpi, originalWidth, originalHeight })
  }, [canvas, side])

  useEffect(() => {
    if (!canvas) return

    canvas.on("selection:created", updateDpi)
    canvas.on("selection:updated", updateDpi)
    canvas.on("selection:cleared", updateDpi)
    canvas.on("object:modified", updateDpi)
    canvas.on("object:scaling", updateDpi)

    return () => {
      canvas.off("selection:created", updateDpi)
      canvas.off("selection:updated", updateDpi)
      canvas.off("selection:cleared", updateDpi)
      canvas.off("object:modified", updateDpi)
      canvas.off("object:scaling", updateDpi)
    }
  }, [canvas, updateDpi])

  if (!dpiInfo) return null

  const { label, color } = getDpiLevel(dpiInfo.dpi)

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs",
        color
      )}
    >
      <span className="font-semibold">{dpiInfo.dpi} DPI</span>
      <span className="opacity-70">
        {dpiInfo.originalWidth}x{dpiInfo.originalHeight}px
      </span>
      <span className="font-medium">{label}</span>
    </div>
  )
}
