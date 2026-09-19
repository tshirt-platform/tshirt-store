import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const ID = "3f2b8c1e-9a44-4d6e-8f0a-1b2c3d4e5f60"
const KEY = `designs/${ID}/front.png`

const env = {
  S3_BUCKET_NAME: undefined as string | undefined,
  S3_DESIGNS_PREFIX: "designs/",
  NEXT_PUBLIC_STORE_URL: "http://localhost:3000",
}

vi.mock("@/lib/env", () => ({ env }))
vi.mock("@/lib/s3", () => ({
  getDesignKey: (id: string, side: string, ext: string) => `designs/${id}/${side}.${ext}`,
  generatePresignedUrl: vi.fn().mockResolvedValue({
    presignedUrl: "https://s3.example.com/put?sig=1",
    fileUrl: "https://cdn.example.com/x.png",
  }),
}))

let tmp: string

beforeEach(async () => {
  vi.resetModules()
  env.S3_BUCKET_NAME = undefined
  tmp = await mkdtemp(path.join(os.tmpdir(), "tshirt-uploads-"))
  vi.spyOn(process, "cwd").mockReturnValue(tmp)
})

afterEach(async () => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  await rm(tmp, { recursive: true, force: true })
})

function post(body: unknown) {
  return new Request("http://localhost/api/upload-design", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

describe("POST /api/upload-design", () => {
  it("returns a presigned URL when S3 is configured", async () => {
    env.S3_BUCKET_NAME = "bucket"
    const { POST } = await import("@/app/api/upload-design/route")
    const res = await POST(post({ designId: ID, side: "front", kind: "png" }))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      mode: "s3",
      uploadUrl: "https://s3.example.com/put?sig=1",
      contentType: "image/png",
    })
  })

  it("falls back to local storage in development", async () => {
    const { POST } = await import("@/app/api/upload-design/route")
    const body = await (await POST(post({ designId: ID, side: "back", kind: "json" }))).json()
    expect(body.mode).toBe("local")
    expect(body.uploadUrl).toContain(encodeURIComponent(`designs/${ID}/back.json`))
    expect(body.fileUrl).toBe(`http://localhost:3000/api/files/designs/${ID}/back.json`)
  })

  it("refuses to use local storage in production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    const { POST } = await import("@/app/api/upload-design/route")
    const res = await POST(post({ designId: ID, side: "front", kind: "png" }))
    expect(res.status).toBe(500)
  })

  it("rejects malformed input", async () => {
    const { POST } = await import("@/app/api/upload-design/route")
    expect((await POST(post("not json"))).status).toBe(400)
    expect((await POST(post({ designId: "../../x", side: "front", kind: "png" }))).status).toBe(400)
    expect((await POST(post({ designId: ID, side: "front", kind: "exe" }))).status).toBe(400)
  })
})

describe("local upload round trip", () => {
  const put = (key: string, body: BodyInit) =>
    new Request(`http://localhost/api/upload-design/local?key=${encodeURIComponent(key)}`, {
      method: "PUT",
      body,
    })

  it("stores a file and serves it back byte for byte", async () => {
    const { PUT } = await import("@/app/api/upload-design/local/route")
    const { GET } = await import("@/app/api/files/[...key]/route")
    const bytes = new Uint8Array([137, 80, 78, 71, 1, 2, 3, 250])

    expect((await PUT(put(KEY, bytes))).status).toBe(200)

    const res = await GET(new Request("http://localhost/x"), {
      params: Promise.resolve({ key: KEY.split("/") }),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toBe("image/png")
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes)
  })

  it("rejects traversal keys on write and read", async () => {
    const { PUT } = await import("@/app/api/upload-design/local/route")
    const { GET } = await import("@/app/api/files/[...key]/route")

    expect((await PUT(put(`designs/${ID}/../../../evil.png`, new Uint8Array([1])))).status).toBe(400)
    const res = await GET(new Request("http://localhost/x"), {
      params: Promise.resolve({ key: ["designs", "..", "..", "etc", "passwd"] }),
    })
    expect(res.status).toBe(404)
  })

  it("rejects an empty upload", async () => {
    const { PUT } = await import("@/app/api/upload-design/local/route")
    expect((await PUT(put(KEY, new Uint8Array([])))).status).toBe(400)
  })

  it("returns 404 for files that were never uploaded", async () => {
    const { GET } = await import("@/app/api/files/[...key]/route")
    const res = await GET(new Request("http://localhost/x"), {
      params: Promise.resolve({ key: KEY.split("/") }),
    })
    expect(res.status).toBe(404)
  })

  it("is disabled when S3 is configured or in production", async () => {
    const { PUT } = await import("@/app/api/upload-design/local/route")
    env.S3_BUCKET_NAME = "bucket"
    expect((await PUT(put(KEY, new Uint8Array([1])))).status).toBe(404)

    env.S3_BUCKET_NAME = undefined
    vi.stubEnv("NODE_ENV", "production")
    expect((await PUT(put(KEY, new Uint8Array([1])))).status).toBe(404)
  })
})
