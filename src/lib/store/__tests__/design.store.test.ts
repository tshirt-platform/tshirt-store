import { useDesignStore } from "../design.store"

// Reset store between tests
beforeEach(() => {
  useDesignStore.setState({
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
})
