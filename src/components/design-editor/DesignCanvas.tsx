"use client"

import { useEffect, useRef, useCallback } from "react"
import type { Canvas } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import { drawPrintAreaOverlay } from "@/lib/canvas/constraints"
import { loadMockup } from "@/lib/canvas/mockup"

export default function DesignCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const setCanvas = useDesignStore((s) => s.setCanvas)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const activeTool = useDesignStore((s) => s.activeTool)

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer?.files[0]
      if (!file) return
      // Dispatch custom event for ImageUploader to handle
      window.dispatchEvent(
        new CustomEvent("design-editor:drop-file", { detail: file })
      )
    },
    []
  )

  useEffect(() => {
    let fabricCanvas: Canvas | null = null

    async function init() {
      const fabric = await import("fabric")
      if (!canvasRef.current) return

      fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 600,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
      })

      // Load mockup and print area overlay
      await loadMockup(fabricCanvas)
      await drawPrintAreaOverlay(fabricCanvas)

      // Save initial snapshot
      setCanvas(fabricCanvas)
      saveSnapshot()

      // Track modifications for undo history
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
      setCanvas(null)
    }
  }, [setCanvas, saveSnapshot, handleDrop])

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center bg-gray-100"
      data-tool={activeTool}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
