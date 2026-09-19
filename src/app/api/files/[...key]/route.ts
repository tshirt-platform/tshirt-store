import { readFile } from "node:fs/promises"
import { env } from "@/lib/env"
import { localStorageEnabled, resolveLocalPath } from "@/lib/design/local-storage"
import { contentTypeForKey } from "@/lib/design/storage-keys"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key: string[] }> }
): Promise<Response> {
  if (env.S3_BUCKET_NAME || !localStorageEnabled()) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const key = (await ctx.params).key.join("/")
  const file = resolveLocalPath(key)
  if (!file) return Response.json({ error: "Not found" }, { status: 404 })

  try {
    const bytes = await readFile(file)
    return new Response(bytes, {
      headers: {
        "Content-Type": contentTypeForKey(key),
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
}
