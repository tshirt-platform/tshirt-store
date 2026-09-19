"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import { dpiLevel } from "@/lib/canvas/constraints"
import { effectiveDpi, initialImageScale } from "@/lib/print/editor-layout"
import { DESIGN_EXPORT } from "@tshirt-platform/shared"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/svg+xml"]

export default function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const canvas = useDesignStore((s) => s.canvas)
  const activeTool = useDesignStore((s) => s.activeTool)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const setActiveTool = useDesignStore((s) => s.setActiveTool)

  const layout = useDesignStore((s) => s.layout)

  const addImage = useCallback(
    async (file: File) => {
      if (!canvas || !layout) return

      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Chỉ hỗ trợ file JPG, PNG, SVG")
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        alert("File phải nhỏ hơn 10MB")
        return
      }

      const fabric = await import("fabric")
      const url = URL.createObjectURL(file)
      const img = await fabric.FabricImage.fromURL(url)

      const imgW = img.width ?? 1
      const imgH = img.height ?? 1
      const scale = initialImageScale(imgW, imgH, layout)

      // Vectors have no resolution to warn about
      if (file.type !== "image/svg+xml") {
        const dpi = effectiveDpi(scale, layout, DESIGN_EXPORT.DPI)
        if (dpiLevel(dpi) === "low") {
          const ok = window.confirm(
            `Ảnh này chỉ đạt khoảng ${Math.round(dpi)} DPI khi in (khuyến nghị ≥ 300). ` +
              "In ra có thể bị mờ. Vẫn thêm vào thiết kế?"
          )
          if (!ok) {
            URL.revokeObjectURL(url)
            return
          }
        }
      }

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (layout.width - imgW * scale) / 2,
        top: (layout.height - imgH * scale) / 2,
        originX: "left",
        originY: "top",
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      saveSnapshot()
      setActiveTool("select")
    },
    [canvas, saveSnapshot, setActiveTool, layout]
  )

  // Open file dialog when image tool is activated
  useEffect(() => {
    if (activeTool === "image" && inputRef.current) {
      inputRef.current.click()
    }
  }, [activeTool])

  // Listen for drag & drop events from DesignCanvas
  useEffect(() => {
    const handler = (e: Event) => {
      const file = (e as CustomEvent<File>).detail
      if (file) addImage(file)
    }
    window.addEventListener("design-editor:drop-file", handler)
    return () => window.removeEventListener("design-editor:drop-file", handler)
  }, [addImage])

  return (
    <input
      ref={inputRef}
      type="file"
      accept=".jpg,.jpeg,.png,.svg"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) addImage(file)
        e.target.value = ""
      }}
    />
  )
}
