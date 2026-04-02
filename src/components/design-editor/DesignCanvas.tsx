"use client"

import { useEffect, useRef, useCallback } from "react"
import type { Canvas, FabricObject } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import {
  CANVAS_SIZE,
  drawPrintAreaOverlay,
  applyPrintClip,
} from "@/lib/canvas/constraints"
import { loadMockup } from "@/lib/canvas/mockup"

export default function DesignCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const setCanvas = useDesignStore((s) => s.setCanvas)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const activeTool = useDesignStore((s) => s.activeTool)

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]
    if (!file) return
    window.dispatchEvent(
      new CustomEvent("design-editor:drop-file", { detail: file })
    )
  }, [])

  useEffect(() => {
    let fabricCanvas: Canvas | null = null

    async function init() {
      const fabric = await import("fabric")
      if (!canvasRef.current || initializedRef.current) return
      initializedRef.current = true

      fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: CANVAS_SIZE.width,
        height: CANVAS_SIZE.height,
        backgroundColor: "transparent",
        selection: true,
        preserveObjectStacking: true,
      })

      // Load t-shirt mockup as background (always starts on "front")
      await loadMockup(fabricCanvas, "front")
      await drawPrintAreaOverlay(fabricCanvas, "front")

      setCanvas(fabricCanvas)
      saveSnapshot()

      // Auto-apply clipPath to new user objects
      fabricCanvas.on("object:added", (e: { target: FabricObject }) => {
        const obj = e.target
        const isOverlay = (obj as FabricObject & { _isPrintOverlay?: boolean })
          ._isPrintOverlay
        const isExcluded = (
          obj as FabricObject & { excludeFromExport?: boolean }
        ).excludeFromExport
        if (!isOverlay && !isExcluded && !obj.clipPath) {
          const side = useDesignStore.getState().side
          applyPrintClip(obj, side)
        }
      })

      // Save snapshot after modifications
      fabricCanvas.on("object:modified", () => {
        saveSnapshot()
      })
    }

    init()

    // Drag & drop
    const container = containerRef.current
    const preventDefault = (e: DragEvent) => e.preventDefault()
    container?.addEventListener("dragover", preventDefault)
    container?.addEventListener("drop", handleDrop)

    return () => {
      container?.removeEventListener("dragover", preventDefault)
      container?.removeEventListener("drop", handleDrop)
      fabricCanvas?.dispose()
      initializedRef.current = false
      setCanvas(null)
    }
  }, [setCanvas, saveSnapshot, handleDrop])

  return (
    <div
      ref={containerRef}
      className="flex flex-1 items-center justify-center"
      data-tool={activeTool}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
