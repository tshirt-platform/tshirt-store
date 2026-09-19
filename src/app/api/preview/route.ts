import { z } from "zod"
import { env } from "@/lib/env"

export const runtime = "nodejs"

const MAX_ARTWORK_BYTES = 40 * 1024 * 1024
const RENDER_TIMEOUT_MS = 30_000

const fieldsSchema = z.object({
  templateId: z.string().regex(/^[a-f0-9]{12}$/),
  garmentHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  side: z.enum(["front", "back"]),
})

// The render service is internal; browsers reach it only through here
export async function POST(req: Request): Promise<Response> {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 })
  }

  const fields = fieldsSchema.safeParse({
    templateId: form.get("templateId"),
    garmentHex: form.get("garmentHex"),
    side: form.get("side"),
  })
  const artwork = form.get("artwork")
  if (!fields.success || !(artwork instanceof Blob)) {
    return Response.json({ error: "Invalid preview request" }, { status: 400 })
  }
  if (artwork.size === 0 || artwork.size > MAX_ARTWORK_BYTES) {
    return Response.json({ error: "Artwork has an unsupported size" }, { status: 413 })
  }

  const upstream = new FormData()
  upstream.set("artwork", artwork, "artwork.png")
  upstream.set("template_id", fields.data.templateId)
  upstream.set("garment_hex", fields.data.garmentHex)

  try {
    const res = await fetch(`${env.RENDER_SERVICE_URL}/render`, {
      method: "POST",
      body: upstream,
      headers: env.RENDER_API_KEY ? { "X-Api-Key": env.RENDER_API_KEY } : undefined,
      signal: AbortSignal.timeout(RENDER_TIMEOUT_MS),
    })
    if (!res.ok) {
      // 404/409/422 mean this template cannot render; anything else is an outage
      const status = [404, 409, 422].includes(res.status) ? res.status : 502
      return Response.json({ error: "Preview unavailable" }, { status })
    }
    return new Response(await res.arrayBuffer(), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" },
    })
  } catch {
    return Response.json({ error: "Preview service unreachable" }, { status: 502 })
  }
}
