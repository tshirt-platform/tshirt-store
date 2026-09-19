import type { DesignSide } from "@tshirt-platform/shared"
import type { UploadRequest } from "./storage-keys"

interface UploadTicket {
  mode: "s3" | "local"
  uploadUrl: string
  fileUrl: string
  contentType: string
}

export function newDesignId(): string {
  return crypto.randomUUID()
}

/** Uploads one design file and returns the URL it can be fetched from */
export async function uploadDesignFile(
  blob: Blob,
  request: { designId: string; side: DesignSide; kind: UploadRequest["kind"] }
): Promise<string> {
  const res = await fetch("/api/upload-design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  if (!res.ok) throw new Error(`Could not start upload (${res.status})`)
  const ticket = (await res.json()) as UploadTicket

  const put = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": ticket.contentType },
    body: blob,
  })
  if (!put.ok) throw new Error(`Upload failed (${put.status})`)
  return ticket.fileUrl
}
