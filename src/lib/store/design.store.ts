import { create } from "zustand"
import type { ActiveTool, DesignSide } from "@tshirt/shared"
import type { Canvas } from "fabric"

const MAX_HISTORY = 30

interface DesignStoreState {
  // Canvas reference (set after fabric init)
  canvas: Canvas | null
  // Product context
  productId: string | null
  variantId: string | null
  // Editor state
  side: DesignSide
  activeTool: ActiveTool
  // History (JSON snapshots)
  history: string[]
  historyIndex: number
  // Per-side canvas JSON
  frontJson: string | null
  backJson: string | null
  // Export URLs
  pngUrl: string | null
  jsonUrl: string | null
  // Actions
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

    // Save current side JSON
    const currentJson = JSON.stringify(canvas.toJSON())
    const update =
      side === "front"
        ? { frontJson: currentJson }
        : { backJson: currentJson }

    // Load target side JSON
    const targetJson =
      newSide === "front" ? get().frontJson : get().backJson

    if (targetJson) {
      canvas.loadFromJSON(JSON.parse(targetJson)).then(() => {
        canvas.renderAll()
      })
    } else {
      canvas.clear()
      canvas.backgroundColor = "#ffffff"
      canvas.renderAll()
    }

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
