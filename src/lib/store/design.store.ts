import { create } from "zustand"
import type { ActiveTool, DesignSide } from "@tshirt/shared"
import type { Canvas } from "fabric"
import { loadMockup } from "@/lib/canvas/mockup"
import {
  drawPrintAreaOverlay,
  removePrintAreaOverlay,
  applyPrintClipAll,
} from "@/lib/canvas/constraints"

const MAX_HISTORY = 30

interface DesignStoreState {
  canvas: Canvas | null
  productId: string | null
  variantId: string | null
  side: DesignSide
  activeTool: ActiveTool
  history: string[]
  historyIndex: number
  frontJson: string | null
  backJson: string | null
  pngUrl: string | null
  jsonUrl: string | null
  setCanvas: (canvas: Canvas | null) => void
  setProductId: (id: string) => void
  setVariantId: (id: string | null) => void
  setActiveTool: (tool: ActiveTool) => void
  setSide: (side: DesignSide) => void
  saveSnapshot: () => void
  undo: () => void
  redo: () => void
  setPngUrl: (url: string | null) => void
  setJsonUrl: (url: string | null) => void
}

export const useDesignStore = create<DesignStoreState>((set, get) => ({
  canvas: null,
  productId: null,
  variantId: null,
  side: "front",
  activeTool: "select",
  history: [],
  historyIndex: -1,
  frontJson: null,
  backJson: null,
  pngUrl: null,
  jsonUrl: null,

  setCanvas: (canvas) => set({ canvas }),
  setProductId: (id) => set({ productId: id }),
  setVariantId: (id) => set({ variantId: id }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  setSide: (newSide) => {
    const { canvas, side } = get()
    if (!canvas || newSide === side) return

    // Strip overlay before saving (so it's not duplicated on restore)
    removePrintAreaOverlay(canvas)

    // Save user objects only (no backgroundImage)
    const json = canvas.toJSON() as Record<string, unknown>
    delete json.backgroundImage
    const currentJson = JSON.stringify(json)

    const update =
      side === "front"
        ? { frontJson: currentJson }
        : { backJson: currentJson }

    // Load target side
    const targetJson =
      newSide === "front" ? get().frontJson : get().backJson

    // Clear canvas, reload mockup + overlay + user objects
    const objects = canvas.getObjects().slice()
    objects.forEach((obj) => canvas.remove(obj))

    loadMockup(canvas, newSide).then(async () => {
      if (targetJson) {
        const parsed = JSON.parse(targetJson)
        await canvas.loadFromJSON(parsed)
        await loadMockup(canvas, newSide)
      }
      await drawPrintAreaOverlay(canvas, newSide)
      // Re-apply clip paths for the new side's print area
      await applyPrintClipAll(canvas, newSide)
      canvas.renderAll()
    })

    set({ ...update, side: newSide, history: [], historyIndex: -1 })
  },

  saveSnapshot: () => {
    const { canvas, history, historyIndex } = get()
    if (!canvas) return

    const json = JSON.stringify(canvas.toJSON())
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(json)

    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift()
    }

    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const { canvas, history, historyIndex } = get()
    if (!canvas || historyIndex <= 0) return

    const newIndex = historyIndex - 1
    canvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
      canvas.renderAll()
    })
    set({ historyIndex: newIndex })
  },

  redo: () => {
    const { canvas, history, historyIndex } = get()
    if (!canvas || historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    canvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
      canvas.renderAll()
    })
    set({ historyIndex: newIndex })
  },

  setPngUrl: (url) => set({ pngUrl: url }),
  setJsonUrl: (url) => set({ jsonUrl: url }),
}))
