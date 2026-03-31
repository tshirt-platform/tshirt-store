"use client"

import { useEffect } from "react"
import type { IText, FabricObject } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"

export function useDesignShortcuts() {
  const canvas = useDesignStore((s) => s.canvas)
  const undo = useDesignStore((s) => s.undo)
  const redo = useDesignStore((s) => s.redo)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)

  useEffect(() => {
    if (!canvas) return

    function handleKeyDown(e: KeyboardEvent) {
      if (!canvas) return
      const mod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement
      // Skip if typing in an input/textarea
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      // Undo: Ctrl+Z
      if (mod && !e.shiftKey && e.key === "z") {
        e.preventDefault()
        undo()
        return
      }

      // Redo: Ctrl+Shift+Z
      if (mod && e.shiftKey && e.key === "z") {
        e.preventDefault()
        redo()
        return
      }

      // Delete selected
      if (e.key === "Delete" || e.key === "Backspace") {
        const active = canvas.getActiveObject()
        if (active && !(active as IText).isEditing) {
          canvas.remove(active)
          canvas.renderAll()
          saveSnapshot()
        }
        return
      }

      // Select all: Ctrl+A
      if (mod && e.key === "a") {
        e.preventDefault()
        import("fabric").then((fabric) => {
          const objs = canvas.getObjects().filter(
            (o) => o.selectable !== false && o.evented !== false
          )
          if (objs.length > 0) {
            const sel = new fabric.ActiveSelection(objs, { canvas })
            canvas.setActiveObject(sel)
            canvas.renderAll()
          }
        })
        return
      }

      // Duplicate: Ctrl+D
      if (mod && e.key === "d") {
        e.preventDefault()
        const active = canvas.getActiveObject()
        if (active) {
          active.clone().then((cloned: FabricObject) => {
            cloned.set({ left: (cloned.left ?? 0) + 20, top: (cloned.top ?? 0) + 20 })
            canvas.add(cloned)
            canvas.setActiveObject(cloned)
            canvas.renderAll()
            saveSnapshot()
          })
        }
        return
      }

      // Escape: deselect
      if (e.key === "Escape") {
        canvas.discardActiveObject()
        canvas.renderAll()
        return
      }

      // Arrow nudge: 1px (Shift = 10px)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        const active = canvas.getActiveObject()
        if (!active) return
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        if (e.key === "ArrowUp") active.set({ top: (active.top ?? 0) - step })
        if (e.key === "ArrowDown") active.set({ top: (active.top ?? 0) + step })
        if (e.key === "ArrowLeft") active.set({ left: (active.left ?? 0) - step })
        if (e.key === "ArrowRight") active.set({ left: (active.left ?? 0) + step })
        canvas.renderAll()
        saveSnapshot()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canvas, undo, redo, saveSnapshot])
}
