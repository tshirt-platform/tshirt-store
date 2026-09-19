import type { DesignSide } from "@tshirt-platform/shared"

export interface PreviewRequest {
  artwork: Blob
  side: DesignSide
  garmentHex: string
  /** Render-service template for this side; without one the caller uses the flat fallback */
  templateId: string
  signal?: AbortSignal
}

/** Server-rendered preview on a garment photo, or null when the renderer cannot serve it */
export async function requestPreview(req: PreviewRequest): Promise<Blob | null> {
  const form = new FormData()
  form.set("artwork", req.artwork, "artwork.png")
  form.set("templateId", req.templateId)
  form.set("garmentHex", req.garmentHex)
  form.set("side", req.side)

  try {
    const res = await fetch("/api/preview", { method: "POST", body: form, signal: req.signal })
    return res.ok ? await res.blob() : null
  } catch {
    // aborted or unreachable: the caller falls back to another preview
    return null
  }
}
