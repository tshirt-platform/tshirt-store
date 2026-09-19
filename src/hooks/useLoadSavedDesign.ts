"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import type { DesignSide } from "@tshirt-platform/shared"
import { selectItems, useCartStore } from "@/lib/cart/cart.store"
import { readDesign } from "@/lib/cart/line-item"
import { useDesignStore } from "@/lib/store/design.store"

async function fetchJson(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Không tải được thiết kế (${res.status})`)
  return res.text()
}

/** When the editor is opened from the cart, loads that line item's saved design onto the canvas */
export function useLoadSavedDesign(): void {
  const canvas = useDesignStore((s) => s.canvas)
  const lineId = useDesignStore((s) => s.garment?.editLineItemId ?? null)
  const loaded = useRef<string | null>(null)

  useEffect(() => {
    if (!canvas || !lineId || loaded.current === lineId) return
    loaded.current = lineId

    void (async () => {
      try {
        await useCartStore.getState().restore()
        const line = selectItems(useCartStore.getState()).find((l) => l.id === lineId)
        const design = line ? readDesign(line) : null
        if (!design) throw new Error("Không tìm thấy thiết kế trong giỏ hàng")

        const entries = await Promise.all(
          design.designs.map(async (d) => [d.side, await fetchJson(d.json_url)] as const)
        )
        await useDesignStore.getState().loadSides(Object.fromEntries(entries) as Partial<Record<DesignSide, string>>)
      } catch (e) {
        loaded.current = null
        toast.error(e instanceof Error ? e.message : "Không mở được thiết kế đã lưu")
      }
    })()
  }, [canvas, lineId])
}
