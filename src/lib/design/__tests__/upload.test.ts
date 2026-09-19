import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_MEDUSA_URL: "http://api.test", NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_test" },
}))

import { fetchDesignScene, uploadDesignFile } from "../upload"

const fetchMock = vi.fn()
const ID = "3f2b8c1e-9a44-4d6e-8f0a-1b2c3d4e5f60"

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})

const reply = (status: number, body: unknown) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status })

describe("uploadDesignFile", () => {
  it("PUTs the bytes to the backend with the publishable key and the kind's content type", async () => {
    fetchMock.mockResolvedValue(reply(201, { url: "https://files.test/designs/x/front.png" }))
    const blob = new Blob(["png"])

    const url = await uploadDesignFile(blob, { designId: ID, side: "front", kind: "png" })

    expect(url).toBe("https://files.test/designs/x/front.png")
    const [target, init] = fetchMock.mock.calls[0]
    expect(target).toBe(`http://api.test/store/designs/${ID}/front/png`)
    expect(init.method).toBe("PUT")
    expect(init.headers).toMatchObject({ "x-publishable-api-key": "pk_test", "Content-Type": "image/png" })
    expect(init.body).toBe(blob)
  })

  it("carries the backend's reason into the error", async () => {
    fetchMock.mockResolvedValue(reply(413, { message: "File too large" }))
    await expect(uploadDesignFile(new Blob(["x"]), { designId: ID, side: "back", kind: "jpg" })).rejects.toThrow(
      "File too large"
    )
  })

  it("still explains a failure that has no JSON body", async () => {
    fetchMock.mockResolvedValue(reply(502, "<html>bad gateway</html>"))
    await expect(uploadDesignFile(new Blob(["x"]), { designId: ID, side: "back", kind: "json" })).rejects.toThrow(
      "(502)"
    )
  })

  it("does not accept a success reply without a URL", async () => {
    fetchMock.mockResolvedValue(reply(201, {}))
    await expect(uploadDesignFile(new Blob(["x"]), { designId: ID, side: "front", kind: "png" })).rejects.toThrow(
      /đường dẫn/
    )
  })
})

describe("fetchDesignScene", () => {
  it("reads one of our scenes through the backend, whatever host the bucket has", async () => {
    fetchMock.mockResolvedValue(reply(200, '{"objects":[]}'))

    const text = await fetchDesignScene(`https://pub-abc.r2.dev/designs/${ID}/back.json`)

    expect(text).toBe('{"objects":[]}')
    expect(fetchMock.mock.calls[0][0]).toBe(`http://api.test/store/designs/${ID}/back/json`)
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ "x-publishable-api-key": "pk_test" })
  })

  it("fetches an unrecognised URL as it is", async () => {
    fetchMock.mockResolvedValue(reply(200, "{}"))
    await fetchDesignScene("https://elsewhere.test/scene.json")
    expect(fetchMock.mock.calls[0][0]).toBe("https://elsewhere.test/scene.json")
  })

  it("fails loudly when the scene is gone", async () => {
    fetchMock.mockResolvedValue(reply(404, { message: "Not found" }))
    await expect(fetchDesignScene(`http://x/designs/${ID}/front.json`)).rejects.toThrow("404")
  })
})
