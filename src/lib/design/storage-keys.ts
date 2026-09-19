import { z } from "zod"

export const DESIGN_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/

export const uploadRequestSchema = z.object({
  designId: z.string().regex(DESIGN_ID_PATTERN),
  side: z.enum(["front", "back"]),
  kind: z.enum(["png", "json", "jpg"]),
})

export type UploadRequest = z.infer<typeof uploadRequestSchema>

export const CONTENT_TYPES = {
  png: "image/png",
  json: "application/json",
  jpg: "image/jpeg",
} as const

// {prefix}/{designId}/{side}.{ext}: a single-segment prefix, no dots or slashes elsewhere
const KEY_PATTERN = /^[A-Za-z0-9_-]+\/[A-Za-z0-9-]{8,64}\/(front|back)\.(png|json|jpg)$/

export function isValidStorageKey(key: string): boolean {
  return KEY_PATTERN.test(key)
}

export function contentTypeForKey(key: string): string {
  const ext = key.slice(key.lastIndexOf(".") + 1) as keyof typeof CONTENT_TYPES
  return CONTENT_TYPES[ext] ?? "application/octet-stream"
}
