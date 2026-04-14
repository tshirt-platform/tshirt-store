import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const uploadSchema = z.object({
  side: z.enum(["front", "back"]),
})

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "application/json": "json",
}

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    const side = formData.get("side")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    const parsed = uploadSchema.safeParse({ side })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid side parameter", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: `Invalid content type: ${file.type}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      )
    }

    const id = randomUUID()
    const fileName = `${parsed.data.side}.${ext}`
    const dirPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "designs",
      id
    )
    await mkdir(dirPath, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(dirPath, fileName), buffer)

    const fileUrl = `/uploads/designs/${id}/${fileName}`

    return NextResponse.json({ fileUrl, id })
  } catch (err) {
    console.error("Upload design error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
