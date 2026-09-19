import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const env = { RENDER_SERVICE_URL: "http://render.internal:8001", RENDER_API_KEY: undefined as string | undefined }
vi.mock("@/lib/env", () => ({ env }))

const fetchMock = vi.fn()

beforeEach(() => {
  vi.resetModules()
  env.RENDER_API_KEY = undefined
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => vi.unstubAllGlobals())

function request(over: Record<string, string | Blob | null> = {}) {
  const form = new FormData()
  const fields: Record<string, string | Blob | null> = {
    artwork: new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }),
    templateId: "abc123def456",
    garmentHex: "#1A1A1A",
    side: "front",
    ...over,
  }
  for (const [k, v] of Object.entries(fields)) if (v !== null) form.set(k, v)
  return new Request("http://localhost/api/preview", { method: "POST", body: form })
}

async function post(over?: Record<string, string | Blob | null>) {
  const { POST } = await import("@/app/api/preview/route")
  return POST(request(over))
}

describe("POST /api/preview", () => {
  it("forwards the artwork to the render service and returns its JPEG", async () => {
    fetchMock.mockResolvedValue(new Response(new Uint8Array([255, 216, 255]), { status: 200 }))
    const res = await post()

    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toBe("image/jpeg")
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([255, 216, 255]))

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("http://render.internal:8001/render")
    const sent = init.body as FormData
    expect(sent.get("template_id")).toBe("abc123def456")
    expect(sent.get("garment_hex")).toBe("#1A1A1A")
    expect(sent.get("artwork")).toBeInstanceOf(Blob)
  })

  it("sends the API key when one is configured", async () => {
    env.RENDER_API_KEY = "secret"
    fetchMock.mockResolvedValue(new Response(new Uint8Array([1]), { status: 200 }))
    await post()
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ "X-Api-Key": "secret" })
  })

  it.each([
    [404, 404],
    [409, 409],
    [422, 422],
    [500, 502],
    [401, 502],
  ])("maps a renderer %i to %i", async (upstream, expected) => {
    fetchMock.mockResolvedValue(new Response("x", { status: upstream }))
    expect((await post()).status).toBe(expected)
  })

  it("reports an unreachable renderer as 502", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"))
    expect((await post()).status).toBe(502)
  })

  it.each([
    [{ templateId: "../../etc" }],
    [{ templateId: "" }],
    [{ garmentHex: "red" }],
    [{ side: "left" }],
    [{ artwork: null }],
    [{ artwork: "not a file" }],
  ])("rejects bad input %j without calling the renderer", async (over) => {
    expect((await post(over)).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects an empty artwork", async () => {
    expect((await post({ artwork: new Blob([]) })).status).toBe(413)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects a body that is not form data", async () => {
    const { POST } = await import("@/app/api/preview/route")
    const res = await POST(new Request("http://localhost/api/preview", { method: "POST", body: "nope" }))
    expect(res.status).toBe(400)
  })
})
