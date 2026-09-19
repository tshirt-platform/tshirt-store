import { NextResponse } from "next/server"
import { loadWards } from "@/lib/checkout/upstream"

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  // The code goes into an upstream URL path, so only digits are allowed through
  if (!/^\d{1,3}$/.test(code)) {
    return NextResponse.json({ error: "Invalid province code" }, { status: 400 })
  }
  try {
    return NextResponse.json({ items: await loadWards(code) })
  } catch {
    return NextResponse.json({ error: "Address source unavailable" }, { status: 502 })
  }
}
