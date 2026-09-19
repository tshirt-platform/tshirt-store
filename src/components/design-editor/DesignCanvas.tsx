"use client"

import { useEffect, useRef, useCallback } from "react"
import type { Canvas, FabricObject } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import { applyPrintClip, isUserObject } from "@/lib/canvas/constraints"
import { applyScene, fitViewport } from "@/lib/canvas/scene"

const MIN_SIZE = 240

function measure(el: HTMLElement) {
  return {
    width: Math.max(MIN_SIZE, Math.floor(el.clientWidth)),
    height: Math.max(MIN_SIZE, Math.floor(el.clientHeight)),
  }
}

export default function DesignCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
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
    let observer: ResizeObserver | null = null
    // StrictMode mounts, unmounts and mounts again; each run owns its own flag
    let cancelled = false

    async function init() {
      const fabric = await import("fabric")
      const { layout, garment } = useDesignStore.getState()
      const container = containerRef.current
      if (cancelled || !canvasRef.current || !container || !layout || !garment) return

      const canvas = new fabric.Canvas(canvasRef.current, {
        ...measure(container),
        backgroundColor: "transparent",
        selection: true,
        preserveObjectStacking: true,
      })
      fabricCanvas = canvas

      await applyScene(canvas, layout, garment.color)
      if (cancelled) return

      setCanvas(canvas)
      saveSnapshot()

      // Auto-clip user objects to the print area
      canvas.on("object:added", (e: { target: FabricObject }) => {
        const current = useDesignStore.getState().layout
        if (current && isUserObject(e.target) && !e.target.clipPath) {
          void applyPrintClip(e.target, current)
        }
      })

      canvas.on("object:modified", () => {
        saveSnapshot()
      })

      observer = new ResizeObserver(() => {
        const current = useDesignStore.getState().layout
        if (!current) return
        canvas.setDimensions(measure(container))
        fitViewport(canvas, current)
        canvas.requestRenderAll()
      })
      observer.observe(container)
    }

    init().catch((err: unknown) => {
      // Building the scene on a canvas disposed mid-flight is expected in StrictMode
      if (!cancelled) throw err
    })

    const container = containerRef.current
    const preventDefault = (e: DragEvent) => e.preventDefault()
    container?.addEventListener("dragover", preventDefault)
    container?.addEventListener("drop", handleDrop)

    return () => {
      cancelled = true
      observer?.disconnect()
      container?.removeEventListener("dragover", preventDefault)
      container?.removeEventListener("drop", handleDrop)
      void fabricCanvas?.dispose()
      setCanvas(null)
    }
  }, [setCanvas, saveSnapshot, handleDrop])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center"
      data-tool={activeTool}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
