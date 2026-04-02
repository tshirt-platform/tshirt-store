"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import { getPrintArea, scaleForDpi } from "@/lib/canvas/constraints"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/svg+xml"]

export default function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const canvas = useDesignStore((s) => s.canvas)
  const activeTool = useDesignStore((s) => s.activeTool)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const setActiveTool = useDesignStore((s) => s.setActiveTool)

  const side = useDesignStore((s) => s.side)

  const addImage = useCallback(
    async (file: File) => {
      if (!canvas) return

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
      const printArea = getPrintArea(side)

      const imgW = img.width ?? 1
      const imgH = img.height ?? 1
      // Scale to best DPI (at least 300) while fitting print area
      const scale = scaleForDpi(imgW, imgH, side)
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

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      saveSnapshot()
      setActiveTool("select")
    },
    [canvas, saveSnapshot, setActiveTool, side]
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
