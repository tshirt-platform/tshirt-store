import { env } from "@/lib/env"
import { generatePresignedUrl, getDesignKey } from "@/lib/s3"
import { localStorageEnabled } from "@/lib/design/local-storage"
import { CONTENT_TYPES, uploadRequestSchema } from "@/lib/design/storage-keys"

export const runtime = "nodejs"

export async function POST(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = uploadRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Invalid upload request" }, { status: 400 })
  }

  const { designId, side, kind } = parsed.data
  const key = getDesignKey(designId, side, kind)
  const contentType = CONTENT_TYPES[kind]

  if (env.S3_BUCKET_NAME) {
    const { presignedUrl, fileUrl } = await generatePresignedUrl(key, contentType)
    return Response.json({ mode: "s3", uploadUrl: presignedUrl, fileUrl, contentType })
  }

  if (!localStorageEnabled()) {
    return Response.json({ error: "Storage is not configured" }, { status: 500 })
  }

  return Response.json({
    mode: "local",
    uploadUrl: `/api/upload-design/local?key=${encodeURIComponent(key)}`,
    fileUrl: `${env.NEXT_PUBLIC_STORE_URL}/api/files/${key}`,
    contentType,
  })
}
