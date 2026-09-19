"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSaveDesign } from "@/hooks/useSaveDesign"
import { useDesignStore } from "@/lib/store/design.store"

export default function SaveDesign() {
  const garment = useDesignStore((s) => s.garment)
  const { working, save } = useSaveDesign()

  if (!garment) return null
  const editing = garment.editLineItemId !== null

  return (
    <Button size="sm" onClick={save} disabled={working} className="h-8 px-4 text-xs">
      {working ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
      {editing ? "Cập nhật giỏ hàng" : "Thêm vào giỏ hàng"}
    </Button>
  )
}
