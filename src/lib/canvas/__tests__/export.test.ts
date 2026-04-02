import { describe, it, expect, vi } from "vitest"
import { exportToPng, exportToJson, loadFromJson } from "../export"

// Mock fabric Canvas
function createMockCanvas(objects: Record<string, unknown>[] = []) {
  return {
    getWidth: () => 800,
    toDataURL: vi.fn(() => "data:image/png;base64,aGVsbG8="),
    toObject: vi.fn(() => ({
      version: "7.2.0",
      objects,
      backgroundImage: { src: "mockup.png" },
    })),
    loadFromJSON: vi.fn(() => Promise.resolve()),
    renderAll: vi.fn(),
  }
}

describe("exportToPng", () => {
  it("returns a Blob with image/png type", () => {
    const canvas = createMockCanvas()
    const blob = exportToPng(canvas as never)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe("image/png")
  })

  it("uses correct multiplier (3000/800 = 3.75)", () => {
    const canvas = createMockCanvas()
    exportToPng(canvas as never)
    expect(canvas.toDataURL).toHaveBeenCalledWith(
      expect.objectContaining({ multiplier: 3.75 })
    )
  })
})

describe("exportToJson", () => {
  it("includes custom properties and strips backgroundImage", () => {
    const canvas = createMockCanvas([{ type: "textbox", text: "Hello" }])
    const result = exportToJson(canvas as never)
    const parsed = JSON.parse(result)

    expect(parsed.objects).toHaveLength(1)
    expect(parsed.backgroundImage).toBeUndefined()
    expect(canvas.toObject).toHaveBeenCalledWith(
      expect.arrayContaining(["excludeFromExport", "name", "layerName"])
    )
  })
})

describe("loadFromJson", () => {
  it("calls loadFromJSON and renderAll", async () => {
    const canvas = createMockCanvas()
    const json = JSON.stringify({ objects: [] })
    await loadFromJson(canvas as never, json)
    expect(canvas.loadFromJSON).toHaveBeenCalled()
    expect(canvas.renderAll).toHaveBeenCalled()
  })
})
