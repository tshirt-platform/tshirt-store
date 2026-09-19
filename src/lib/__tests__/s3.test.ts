import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock env before importing s3
const envMock = vi.hoisted(() => ({
  env: {
    AWS_REGION: "ap-southeast-1",
    AWS_ACCESS_KEY_ID: "test-key-id",
    AWS_SECRET_ACCESS_KEY: "test-secret",
    S3_BUCKET_NAME: "test-bucket",
    S3_DESIGNS_PREFIX: "designs/",
    NEXT_PUBLIC_S3_BUCKET_URL: "",
    S3_ENDPOINT: undefined as string | undefined,
  },
}))
vi.mock("@/lib/env", () => envMock)

// Mock AWS SDK
vi.mock("@aws-sdk/client-s3", () => {
  const MockS3Client = function (this: Record<string, unknown>, config: unknown) {
    ;(globalThis as Record<string, unknown>).__s3Config = config
    return this
  }
  return {
    S3Client: MockS3Client,
    PutObjectCommand: function (
      this: Record<string, unknown>,
      input: Record<string, unknown>
    ) {
      Object.assign(this, input)
    },
  }
})

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://s3.example.com/signed-url"),
}))

describe("s3", () => {
  beforeEach(() => {
    vi.resetModules()
    envMock.env.S3_ENDPOINT = undefined
    envMock.env.NEXT_PUBLIC_S3_BUCKET_URL = ""
  })

  describe("getDesignKey", () => {
    it("formats key correctly for front PNG", async () => {
      const { getDesignKey } = await import("../s3")
      expect(getDesignKey("order-123", "front", "png")).toBe(
        "designs/order-123/front.png"
      )
    })

    it("formats key correctly for back JSON", async () => {
      const { getDesignKey } = await import("../s3")
      expect(getDesignKey("order-456", "back", "json")).toBe(
        "designs/order-456/back.json"
      )
    })
  })

  describe("generatePresignedUrl", () => {
    it("returns presignedUrl and fileUrl", async () => {
      const { generatePresignedUrl } = await import("../s3")
      const result = await generatePresignedUrl(
        "designs/test/front.png",
        "image/png"
      )

      expect(result.presignedUrl).toBe("https://s3.example.com/signed-url")
      expect(result.fileUrl).toBe(
        "https://test-bucket.s3.ap-southeast-1.amazonaws.com/designs/test/front.png"
      )
    })
  })

  describe("S3-compatible storage (Cloudflare R2)", () => {
    it("points the client at the endpoint and skips default checksums", async () => {
      envMock.env.S3_ENDPOINT = "https://acct.r2.cloudflarestorage.com"
      envMock.env.NEXT_PUBLIC_S3_BUCKET_URL = "https://files.example.com"
      const { generatePresignedUrl } = await import("../s3")
      const result = await generatePresignedUrl("designs/t/front.png", "image/png")

      const config = (globalThis as Record<string, unknown>).__s3Config as Record<string, unknown>
      expect(config.endpoint).toBe("https://acct.r2.cloudflarestorage.com")
      expect(config.requestChecksumCalculation).toBe("WHEN_REQUIRED")
      expect(result.fileUrl).toBe("https://files.example.com/designs/t/front.png")
    })

    it("refuses to guess an AWS-style file URL for a custom endpoint", async () => {
      envMock.env.S3_ENDPOINT = "https://acct.r2.cloudflarestorage.com"
      const { generatePresignedUrl } = await import("../s3")
      await expect(generatePresignedUrl("designs/t/front.png", "image/png")).rejects.toThrow(
        /NEXT_PUBLIC_S3_BUCKET_URL/
      )
    })
  })
})
