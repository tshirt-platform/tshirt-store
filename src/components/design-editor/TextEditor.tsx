"use client"

import { useEffect, useCallback } from "react"
import type { TPointerEventInfo } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"

const DEFAULT_FONT = "Inter"
const DEFAULT_SIZE = 64
const DEFAULT_COLOR = "#1a1a1a"
const EDGE_MARGIN = 20

export default function TextEditor() {
  const canvas = useDesignStore((s) => s.canvas)
  const activeTool = useDesignStore((s) => s.activeTool)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const setActiveTool = useDesignStore((s) => s.setActiveTool)

  const layout = useDesignStore((s) => s.layout)

  const handleCanvasClick = useCallback(
    async (opt: TPointerEventInfo) => {
      if (activeTool !== "text" || !canvas || !layout) return

      const fabric = await import("fabric")
      const pointer = canvas.getScenePoint(opt.e)

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
        EDGE_MARGIN,
        Math.min(pointer.x, layout.width - EDGE_MARGIN)
      )
      const clampedTop = Math.max(
        EDGE_MARGIN,
        Math.min(pointer.y, layout.height - EDGE_MARGIN)
      )
      text.set({ left: clampedLeft, top: clampedTop })

      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()
      saveSnapshot()
      setActiveTool("select")
    },
    [canvas, activeTool, saveSnapshot, setActiveTool, layout]
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
