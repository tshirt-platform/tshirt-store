import { beforeEach, describe, expect, it, vi } from "vitest"
import type { GarmentColor } from "@tshirt-platform/shared"
import type { EditorLayout } from "@/lib/print/editor-layout"

const requestPreview = vi.fn()
const renderFlatPreview = vi.fn()

vi.mock("../preview", () => ({ requestPreview: (...a: unknown[]) => requestPreview(...a) }))
vi.mock("../flat-preview", () => ({ renderFlatPreview: (...a: unknown[]) => renderFlatPreview(...a) }))

import { buildPreviewImages } from "../live-preview"

const color = { name: "Trắng", hex: "#F4F4F0", is_dark: false, needs_underbase: false } as GarmentColor
const layout = {} as EditorLayout
const artwork = new Blob(["art"])
const blob = (name: string) => new Blob([name])

const build = (templateIds: string[], signal?: AbortSignal) =>
  buildPreviewImages({ artwork, side: "front", color, layout, templateIds, signal })

beforeEach(() => {
  requestPreview.mockReset()
  renderFlatPreview.mockReset()
  renderFlatPreview.mockResolvedValue(blob("flat"))
})

describe("buildPreviewImages", () => {
  it("returns one image per photo, in the product's order", async () => {
    requestPreview.mockImplementation(async ({ templateId }: { templateId: string }) => blob(templateId))
    const images = await build(["b", "a", "c"])
    expect(images.map((i) => i.key)).toEqual(["b", "a", "c"])
    expect(images.every((i) => i.source === "photo")).toBe(true)
    expect(renderFlatPreview).not.toHaveBeenCalled()
  })

  it("sends the garment colour and side with each request", async () => {
    requestPreview.mockResolvedValue(blob("x"))
    await build(["a"])
    expect(requestPreview).toHaveBeenCalledWith(
      expect.objectContaining({ templateId: "a", garmentHex: "#F4F4F0", side: "front", artwork })
    )
  })

  it("skips a photo the renderer cannot serve and keeps the rest", async () => {
    requestPreview.mockImplementation(async ({ templateId }: { templateId: string }) =>
      templateId === "bad" ? null : blob(templateId)
    )
    expect((await build(["a", "bad", "c"])).map((i) => i.key)).toEqual(["a", "c"])
  })

  it("falls back to the flat drawing when no photo renders", async () => {
    requestPreview.mockResolvedValue(null)
    const images = await build(["a", "b"])
    expect(images).toHaveLength(1)
    expect(images[0]).toMatchObject({ key: "flat", source: "flat" })
  })

  it("uses the flat drawing for a side with no photos", async () => {
    const images = await build([])
    expect(requestPreview).not.toHaveBeenCalled()
    expect(images[0].source).toBe("flat")
  })

  it("does not draw the fallback for a render that was cancelled", async () => {
    const controller = new AbortController()
    requestPreview.mockImplementation(async () => {
      controller.abort()
      return null
    })
    expect(await build(["a"], controller.signal)).toEqual([])
    expect(renderFlatPreview).not.toHaveBeenCalled()
  })
})
