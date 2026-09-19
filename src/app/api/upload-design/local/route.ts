import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { env } from "@/lib/env"
import { localStorageEnabled, resolveLocalPath } from "@/lib/design/local-storage"

export const runtime = "nodejs"

const MAX_BYTES = 40 * 1024 * 1024

// Development stand-in for a presigned S3 PUT
export async function PUT(req: Request): Promise<Response> {
  if (env.S3_BUCKET_NAME || !localStorageEnabled()) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const key = new URL(req.url).searchParams.get("key") ?? ""
  const target = resolveLocalPath(key)
  if (!target) return Response.json({ error: "Invalid key" }, { status: 400 })

  const bytes = Buffer.from(await req.arrayBuffer())
  if (bytes.length === 0) return Response.json({ error: "Empty body" }, { status: 400 })
  if (bytes.length > MAX_BYTES) return Response.json({ error: "File too large" }, { status: 413 })

  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, bytes)
  return new Response(null, { status: 200 })
}
