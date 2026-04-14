import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock fs/promises before importing route
vi.mock("fs/promises", () => ({
  writeFile: vi.fn(() => Promise.resolve()),
  mkdir: vi.fn(() => Promise.resolve()),
}))

// Mock crypto
vi.mock("crypto", () => ({
  randomUUID: () => "test-uuid-1234",
}))

// We test the route handler directly
import { POST } from "../route"

function createFormData(
  file: File | null,
  side: string
): FormData {
  const fd = new FormData()
  if (file) fd.append("file", file)
  fd.append("side", side)
  return fd
}

function createRequest(formData: FormData): Request {
  return new Request("http://localhost:3000/api/upload-design", {
    method: "POST",
    body: formData,
  })
}

describe("POST /api/upload-design", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("valid PNG upload returns fileUrl", async () => {
    const file = new File(["test-data"], "front.png", { type: "image/png" })
    const formData = createFormData(file, "front")
    const req = createRequest(formData)

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.fileUrl).toBe("/uploads/designs/test-uuid-1234/front.png")
    expect(body.id).toBe("test-uuid-1234")
  })

  it("valid JSON upload returns fileUrl", async () => {
    const file = new File(['{"objects":[]}'], "front.json", {
      type: "application/json",
    })
    const formData = createFormData(file, "front")
    const req = createRequest(formData)

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.fileUrl).toBe("/uploads/designs/test-uuid-1234/front.json")
  })

  it("missing file returns 400", async () => {
    const formData = new FormData()
    formData.append("side", "front")
    const req = createRequest(formData)

    const res = await POST(req as never)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body.error).toBe("Missing file")
  })

  it("invalid contentType returns 400", async () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" })
    const formData = createFormData(file, "front")
    const req = createRequest(formData)

    const res = await POST(req as never)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body.error).toContain("Invalid content type")
  })

  it("invalid side returns 400", async () => {
    const file = new File(["data"], "test.png", { type: "image/png" })
    const formData = createFormData(file, "invalid")
    const req = createRequest(formData)

    const res = await POST(req as never)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body.error).toContain("Invalid side")
  })
})
