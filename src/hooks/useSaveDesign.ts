"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { DesignSide } from "@tshirt-platform/shared"
import { useCartStore } from "@/lib/cart/cart.store"
import { useDesignStore } from "@/lib/store/design.store"
import { renderFlatPreview } from "@/lib/design/flat-preview"
import { requestPreview } from "@/lib/design/preview"
import { buildCartMetadata, exportSides, type SideExport, type UploadedSide } from "@/lib/design/save"
import { newDesignId, uploadDesignFile } from "@/lib/design/upload"
import { friendlyError } from "@/lib/errors"
import { layoutForGarment } from "@/lib/print/garment"

export type SavePhase = "idle" | "preparing" | "review" | "uploading" | "error"

export interface SidePreview extends SideExport {
  previewBlob: Blob
  previewUrl: string
  /** "photo" came from the garment photo renderer, "flat" is the drawing fallback */
  source: "photo" | "flat"
}

export function useSaveDesign() {
  const router = useRouter()
  const [phase, setPhase] = useState<SavePhase>("idle")
  const [previews, setPreviews] = useState<SidePreview[]>([])
  const [error, setError] = useState<string | null>(null)
  const urls = useRef<string[]>([])

  const releaseUrls = useCallback(() => {
    urls.current.forEach((u) => URL.revokeObjectURL(u))
    urls.current = []
  }, [])

  useEffect(() => releaseUrls, [releaseUrls])

  const close = useCallback(() => {
    releaseUrls()
    setPreviews([])
    setError(null)
    setPhase("idle")
  }, [releaseUrls])

  const start = useCallback(async () => {
    const state = useDesignStore.getState()
    const { canvas, garment } = state
    if (!canvas || !garment) return

    setPhase("preparing")
    setError(null)
    try {
      state.commitSide()
      const s = useDesignStore.getState()
      const currentJson = s.side === "front" ? s.frontJson : s.backJson
      if (!currentJson) throw new Error("Editor is not ready")

      const sides = await exportSides(
        canvas,
        garment,
        { front: s.frontJson, back: s.backJson },
        { side: s.side, json: currentJson }
      )
      if (sides.length === 0) {
        toast.error("Thiết kế đang trống. Hãy thêm chữ hoặc hình ảnh trước khi lưu.")
        setPhase("idle")
        return
      }

      if (sides.some((x) => x.outOfBounds > 0)) {
        toast.warning("Có phần thiết kế nằm ngoài vùng in và sẽ bị cắt khi in")
      }
      if (sides.some((x) => x.lowDpiImages > 0)) {
        toast.warning("Có ảnh độ phân giải thấp, bản in có thể bị mờ")
      }

      releaseUrls()
      const built: SidePreview[] = []
      for (const side of sides) {
        const templateId = garment.config.mockups?.[side.side]
        const photo = templateId
          ? await requestPreview({
              artwork: side.png,
              side: side.side,
              garmentHex: garment.color.hex,
              templateId,
            })
          : null
        const previewBlob =
          photo ?? (await renderFlatPreview(layoutForGarment(garment, side.side), garment.color, side.png))
        const previewUrl = URL.createObjectURL(previewBlob)
        urls.current.push(previewUrl)
        built.push({ ...side, previewBlob, previewUrl, source: photo ? "photo" : "flat" })
      }
      setPreviews(built)
      setPhase("review")
    } catch (e) {
      setError(friendlyError(e, "Không thể tạo bản xem trước"))
      setPhase("error")
    }
  }, [releaseUrls])

  const confirm = useCallback(async () => {
    const { garment, setSavedDesign } = useDesignStore.getState()
    if (!garment) return

    setPhase("uploading")
    setError(null)
    try {
      const designId = newDesignId()
      const uploaded: UploadedSide[] = []
      for (const p of previews) {
        const ref = { designId, side: p.side as DesignSide }
        const [pngUrl, jsonUrl, previewUrl] = await Promise.all([
          uploadDesignFile(p.png, { ...ref, kind: "png" }),
          uploadDesignFile(new Blob([p.json], { type: "application/json" }), { ...ref, kind: "json" }),
          uploadDesignFile(p.previewBlob, { ...ref, kind: "jpg" }),
        ])
        uploaded.push({ side: p.side, pngUrl, jsonUrl, previewUrl })
      }
      const metadata = buildCartMetadata(garment, uploaded)
      setSavedDesign(metadata)

      const cart = useCartStore.getState()
      if (garment.editLineItemId) {
        await cart.replaceDesign(garment.editLineItemId, metadata as unknown as Record<string, unknown>)
        toast.success("Đã cập nhật thiết kế trong giỏ hàng")
      } else {
        if (!garment.variantId) throw new Error("Chưa chọn màu và size")
        await cart.addDesign({
          variantId: garment.variantId,
          quantity: garment.quantity,
          metadata: metadata as unknown as Record<string, unknown>,
        })
        toast.success("Đã thêm vào giỏ hàng")
      }
      close()
      router.push("/cart")
    } catch (e) {
      setError(friendlyError(e, "Không thể lưu thiết kế"))
      setPhase("error")
    }
  }, [previews, close, router])

  return { phase, previews, error, start, confirm, close }
}
