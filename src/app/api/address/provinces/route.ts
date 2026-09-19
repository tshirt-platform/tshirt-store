import { NextResponse } from "next/server"
import { loadProvinces } from "@/lib/checkout/upstream"

export async function GET() {
  try {
    return NextResponse.json({ items: await loadProvinces() })
  } catch {
    return NextResponse.json({ error: "Address source unavailable" }, { status: 502 })
  }
}
