import type { DesignSide } from "@tshirt/shared"

interface UploadResult {
  fileUrl: string
  id: string
}

const MAX_RETRIES = 3

/** Upload a design file (PNG or JSON) to the server. */
export async function uploadDesign(
  blob: Blob,
  contentType: string,
  side: DesignSide
): Promise<UploadResult> {
  const ext = contentType === "application/json" ? "json" : "png"
  const formData = new FormData()
  formData.append("file", blob, `${side}.${ext}`)
  formData.append("side", side)

  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch("/api/upload-design", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          (data as { error?: string }).error ?? `Upload failed (${res.status})`
        )
      }

      return (await res.json()) as UploadResult
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * attempt))
      }
    }
  }

  throw lastError ?? new Error("Upload failed after retries")
}
