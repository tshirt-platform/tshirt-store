"use client"

import { useEffect, useCallback } from "react"
import type { TPointerEventInfo } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import { getPrintArea } from "@/lib/canvas/constraints"

const DEFAULT_FONT = "Inter"
const DEFAULT_SIZE = 32
const DEFAULT_COLOR = "#1a1a1a"

export default function TextEditor() {
  const canvas = useDesignStore((s) => s.canvas)
  const activeTool = useDesignStore((s) => s.activeTool)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const setActiveTool = useDesignStore((s) => s.setActiveTool)

  const side = useDesignStore((s) => s.side)

  const handleCanvasClick = useCallback(
    async (opt: TPointerEventInfo) => {
      if (activeTool !== "text" || !canvas) return

      const fabric = await import("fabric")
      const pointer = canvas.getViewportPoint(opt.e)
      const printArea = getPrintArea(side)

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
        printArea.x + 20,
        Math.min(pointer.x, printArea.x + printArea.width - 20)
      )
      const clampedTop = Math.max(
        printArea.y + 20,
        Math.min(pointer.y, printArea.y + printArea.height - 20)
      )
      text.set({ left: clampedLeft, top: clampedTop })

      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()
      saveSnapshot()
      setActiveTool("select")
    },
    [canvas, activeTool, saveSnapshot, setActiveTool, side]
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
