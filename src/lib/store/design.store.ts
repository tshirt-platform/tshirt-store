import { create } from "zustand"
import type { ActiveTool, CartLineItemMetadata, DesignSide, GarmentColor } from "@tshirt-platform/shared"
import type { Canvas } from "fabric"
import { removePrintAreaOverlay } from "@/lib/canvas/constraints"
import { applyScene, restoreCanvas, serializeCanvas } from "@/lib/canvas/scene"
import type { EditorLayout } from "@/lib/print/editor-layout"
import { layoutForGarment, type GarmentContext } from "@/lib/print/garment"

const MAX_HISTORY = 30

interface DesignStoreState {
  canvas: Canvas | null
  garment: GarmentContext | null
  layout: EditorLayout | null
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
  /** Set once the customer confirms a design; feeds the cart line item */
  savedDesign: CartLineItemMetadata | null
  setSavedDesign: (design: CartLineItemMetadata | null) => void
  setCanvas: (canvas: Canvas | null) => void
  setGarment: (garment: GarmentContext) => void
  setColor: (color: GarmentColor) => void
  setProductId: (id: string) => void
  setVariantId: (id: string | null) => void
  setActiveTool: (tool: ActiveTool) => void
  setSide: (side: DesignSide) => void
  /** Stores the current side's objects so both sides can be exported together */
  commitSide: () => void
  saveSnapshot: () => void
  undo: () => void
  redo: () => void
  setPngUrl: (url: string | null) => void
  setJsonUrl: (url: string | null) => void
}

export const useDesignStore = create<DesignStoreState>((set, get) => ({
  canvas: null,
  garment: null,
  layout: null,
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
  savedDesign: null,
  setSavedDesign: (design) => set({ savedDesign: design }),

  setCanvas: (canvas) => set({ canvas }),

  setGarment: (garment) =>
    set({
      garment,
      layout: layoutForGarment(garment, "front"),
      productId: garment.productId,
      variantId: garment.variantId,
      side: "front",
      history: [],
      historyIndex: -1,
      frontJson: null,
      backJson: null,
      savedDesign: null,
    }),

  setColor: (color) => {
    const { canvas, garment, layout } = get()
    if (!garment) return
    set({ garment: { ...garment, color } })
    if (canvas && layout) void applyScene(canvas, layout, color)
  },

  setProductId: (id) => set({ productId: id }),
  setVariantId: (id) => set({ variantId: id }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  commitSide: () => {
    const { canvas, side } = get()
    if (!canvas) return
    removePrintAreaOverlay(canvas)
    const json = serializeCanvas(canvas)
    set(side === "front" ? { frontJson: json } : { backJson: json })
  },

  setSide: (newSide) => {
    const { canvas, side, garment } = get()
    if (!canvas || !garment || newSide === side) return

    get().commitSide()
    const target = newSide === "front" ? get().frontJson : get().backJson
    const layout = layoutForGarment(garment, newSide)

    canvas.getObjects().slice().forEach((obj) => canvas.remove(obj))
    set({ side: newSide, layout, history: [], historyIndex: -1 })

    const ready = target
      ? restoreCanvas(canvas, target, layout, garment.color)
      : applyScene(canvas, layout, garment.color)
    void ready.then(() => get().saveSnapshot())
  },

  saveSnapshot: () => {
    const { canvas, history, historyIndex } = get()
    if (!canvas) return

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(serializeCanvas(canvas))
    if (newHistory.length > MAX_HISTORY) newHistory.shift()

    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const { canvas, history, historyIndex, layout, garment } = get()
    if (!canvas || !layout || !garment || historyIndex <= 0) return

    const newIndex = historyIndex - 1
    set({ historyIndex: newIndex })
    void restoreCanvas(canvas, history[newIndex], layout, garment.color)
  },

  redo: () => {
    const { canvas, history, historyIndex, layout, garment } = get()
    if (!canvas || !layout || !garment || historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    set({ historyIndex: newIndex })
    void restoreCanvas(canvas, history[newIndex], layout, garment.color)
  },

  setPngUrl: (url) => set({ pngUrl: url }),
  setJsonUrl: (url) => set({ jsonUrl: url }),
}))
