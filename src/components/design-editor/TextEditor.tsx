"use client"

import { useEffect, useCallback } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import { PRINT_AREA } from "@/lib/canvas/constraints"

const DEFAULT_FONT = "Inter"
const DEFAULT_SIZE = 32
const DEFAULT_COLOR = "#1a1a1a"

export default function TextEditor() {
  const canvas = useDesignStore((s) => s.canvas)
  const activeTool = useDesignStore((s) => s.activeTool)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const setActiveTool = useDesignStore((s) => s.setActiveTool)

  const handleCanvasClick = useCallback(
    async (opt: fabric.TPointerEventInfo) => {
      if (activeTool !== "text" || !canvas) return

      const fabric = await import("fabric")
      const pointer = canvas.getViewportPoint(opt.e)

      const text = new fabric.IText("Nhập văn bản", {
        left: pointer.x,
        top: pointer.y,
        fontFamily: DEFAULT_FONT,
        fontSize: DEFAULT_SIZE,
        fill: DEFAULT_COLOR,
        originX: "center",
        originY: "center",
      })

      // Clamp inside print area
      const clampedLeft = Math.max(
        PRINT_AREA.x + 20,
        Math.min(pointer.x, PRINT_AREA.x + PRINT_AREA.width - 20)
      )
      const clampedTop = Math.max(
        PRINT_AREA.y + 20,
        Math.min(pointer.y, PRINT_AREA.y + PRINT_AREA.height - 20)
      )
      text.set({ left: clampedLeft, top: clampedTop })

      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()
      saveSnapshot()
      setActiveTool("select")
    },
    [canvas, activeTool, saveSnapshot, setActiveTool]
  )

  useEffect(() => {
    if (!canvas) return
    canvas.on("mouse:down", handleCanvasClick)
    return () => {
      canvas.off("mouse:down", handleCanvasClick)
    }
  }, [canvas, handleCanvasClick])

  return null
}
