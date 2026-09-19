import type { DesignSide } from "@tshirt-platform/shared"
import { env } from "@/lib/env"

export type DesignFileKind = "png" | "json" | "jpg"

const CONTENT_TYPES: Record<DesignFileKind, string> = {
  png: "image/png",
  json: "application/json",
  jpg: "image/jpeg",
}

export function newDesignId(): string {
  return crypto.randomUUID()
}

const headers = () => ({ "x-publishable-api-key": env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY })

const designFileUrl = (designId: string, side: DesignSide, kind: DesignFileKind) =>
  `${env.NEXT_PUBLIC_MEDUSA_URL}/store/designs/${encodeURIComponent(designId)}/${side}/${kind}`

/**
 * Sends one design file to the backend, which validates it and puts it in the bucket.
 * The storefront never holds storage credentials. Returns the URL the file is served from.
 */
export async function uploadDesignFile(
  blob: Blob,
  request: { designId: string; side: DesignSide; kind: DesignFileKind }
): Promise<string> {
  const res = await fetch(designFileUrl(request.designId, request.side, request.kind), {
    method: "PUT",
    headers: { ...headers(), "Content-Type": CONTENT_TYPES[request.kind] },
    body: blob,
  })
  if (!res.ok) {
    const reason = await res.json().then((b: { message?: string }) => b.message).catch(() => undefined)
    throw new Error(reason ? `Không lưu được thiết kế: ${reason}` : `Không lưu được thiết kế (${res.status})`)
  }
  const { url } = (await res.json()) as { url?: string }
  if (!url) throw new Error("Không lưu được thiết kế: máy chủ không trả về đường dẫn")
  return url
}

const SCENE_URL = /\/designs\/([A-Za-z0-9-]{8,64})\/(front|back)\.json$/

/**
 * Loads a saved editor scene through the backend, so the bucket needs no CORS rules.
 * A scene URL that is not one of ours is fetched as it is.
 */
export async function fetchDesignScene(jsonUrl: string): Promise<string> {
  const match = SCENE_URL.exec(new URL(jsonUrl, "http://placeholder.invalid").pathname)
  const res = match
    ? await fetch(designFileUrl(match[1], match[2] as DesignSide, "json"), { headers: headers() })
    : await fetch(jsonUrl)
  if (!res.ok) throw new Error(`Không tải được thiết kế (${res.status})`)
  return res.text()
}
