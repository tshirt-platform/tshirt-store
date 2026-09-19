import { useDesignStore } from "../design.store"
import { resolveGarment } from "@/lib/print/garment"

// Reset store between tests
beforeEach(() => {
  useDesignStore.setState({
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
  })
})

describe("design.store", () => {
  it("has correct initial state", () => {
    const state = useDesignStore.getState()
    expect(state.canvas).toBeNull()
    expect(state.side).toBe("front")
    expect(state.activeTool).toBe("select")
    expect(state.history).toHaveLength(0)
    expect(state.historyIndex).toBe(-1)
  })

  it("setActiveTool updates tool", () => {
    useDesignStore.getState().setActiveTool("text")
    expect(useDesignStore.getState().activeTool).toBe("text")
  })

  it("setProductId updates productId", () => {
    useDesignStore.getState().setProductId("prod_01")
    expect(useDesignStore.getState().productId).toBe("prod_01")
  })

  it("setVariantId updates variantId", () => {
    useDesignStore.getState().setVariantId("variant_01")
    expect(useDesignStore.getState().variantId).toBe("variant_01")
  })

  it("setPngUrl and setJsonUrl update URLs", () => {
    useDesignStore.getState().setPngUrl("https://example.com/png")
    useDesignStore.getState().setJsonUrl("https://example.com/json")
    expect(useDesignStore.getState().pngUrl).toBe("https://example.com/png")
    expect(useDesignStore.getState().jsonUrl).toBe("https://example.com/json")
  })

  it("setSide without canvas does nothing", () => {
    useDesignStore.getState().setSide("back")
    // No canvas, so side should remain "front"
    expect(useDesignStore.getState().side).toBe("front")
  })

  it("saveSnapshot without canvas does nothing", () => {
    useDesignStore.getState().saveSnapshot()
    expect(useDesignStore.getState().history).toHaveLength(0)
  })

  it("undo without canvas does nothing", () => {
    useDesignStore.getState().undo()
    expect(useDesignStore.getState().historyIndex).toBe(-1)
  })

  it("redo without canvas does nothing", () => {
    useDesignStore.getState().redo()
    expect(useDesignStore.getState().historyIndex).toBe(-1)
  })

  it("setGarment derives the front layout and resets the design", () => {
    useDesignStore.setState({ side: "back", frontJson: "{}", history: ["x"], historyIndex: 0 })
    const garment = resolveGarment({
      productId: "prod_9",
      search: { variantId: "variant_3", color: "Đen" },
    })
    useDesignStore.getState().setGarment(garment)

    const state = useDesignStore.getState()
    expect(state.productId).toBe("prod_9")
    expect(state.variantId).toBe("variant_3")
    expect(state.side).toBe("front")
    expect(state.layout?.area.side).toBe("front")
    expect(state.layout?.area.topOffsetMm).toBe(130)
    expect(state.history).toHaveLength(0)
    expect(state.frontJson).toBeNull()
  })

  it("setSide needs a garment as well as a canvas", () => {
    useDesignStore.getState().setGarment(resolveGarment({ productId: "p" }))
    useDesignStore.getState().setSide("back")
    expect(useDesignStore.getState().side).toBe("front")
  })

  it("setColor swaps the garment colour without a canvas", () => {
    useDesignStore.getState().setGarment(resolveGarment({ productId: "p" }))
    const navy = useDesignStore.getState().garment!.config.colors.find((c) => c.name === "Navy")!
    useDesignStore.getState().setColor(navy)
    expect(useDesignStore.getState().garment?.color.hex).toBe("#1F2A44")
  })

  it("setColor is a no-op before a garment is set", () => {
    useDesignStore.getState().setColor({ name: "X", hex: "#000000", is_dark: true, needs_underbase: true })
    expect(useDesignStore.getState().garment).toBeNull()
  })

  it("loadSides needs a canvas and a garment, and leaves state alone without them", async () => {
    useDesignStore.getState().setGarment(resolveGarment({ productId: "p" }))
    await useDesignStore.getState().loadSides({ front: "{}" })
    expect(useDesignStore.getState().frontJson).toBeNull()
  })
})
