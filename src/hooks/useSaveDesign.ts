"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { DesignSide } from "@tshirt-platform/shared"
import { useCartStore } from "@/lib/cart/cart.store"
import { useDesignStore } from "@/lib/store/design.store"
import { renderFlatPreview } from "@/lib/design/flat-preview"
import { requestPreview } from "@/lib/design/preview"
import { buildCartMetadata, exportSides, type UploadedSide } from "@/lib/design/save"
import { newDesignId, uploadDesignFile } from "@/lib/design/upload"
import { friendlyError } from "@/lib/errors"
import { layoutForGarment } from "@/lib/print/garment"

/**
 * Exports every side at print size, uploads it and puts the design in the cart. The customer has
 * already been looking at the preview panel, so there is no confirmation step in between.
 */
export function useSaveDesign() {
  const router = useRouter()
  const [working, setWorking] = useState(false)

  const save = useCallback(async () => {
    const state = useDesignStore.getState()
    const { canvas, garment } = state
    if (!canvas || !garment) return

    const editing = garment.editLineItemId !== null
    if (!garment.size || (!garment.variantId && !editing)) {
      toast.error("Chưa chọn màu và size. Hãy quay lại trang sản phẩm để chọn trước khi thêm vào giỏ hàng.")
      return
    }

    setWorking(true)
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
        return
      }
      if (sides.some((x) => x.outOfBounds > 0)) {
        toast.warning("Có phần thiết kế nằm ngoài vùng in và sẽ bị cắt khi in")
      }
      if (sides.some((x) => x.lowDpiImages > 0)) {
        toast.warning("Có ảnh độ phân giải thấp, bản in có thể bị mờ")
      }

      const designId = newDesignId()
      const uploaded: UploadedSide[] = []
      for (const side of sides) {
        // The first photo of the side stands for the design in the cart and on the work order
        const templateId = garment.config.mockups?.[side.side]?.[0]
        const photo = templateId
          ? await requestPreview({ artwork: side.png, side: side.side, garmentHex: garment.color.hex, templateId })
          : null
        const preview =
          photo ?? (await renderFlatPreview(layoutForGarment(garment, side.side), garment.color, side.png))

        const ref = { designId, side: side.side as DesignSide }
        const [pngUrl, jsonUrl, previewUrl] = await Promise.all([
          uploadDesignFile(side.png, { ...ref, kind: "png" }),
          uploadDesignFile(new Blob([side.json], { type: "application/json" }), { ...ref, kind: "json" }),
          uploadDesignFile(preview, { ...ref, kind: "jpg" }),
        ])
        uploaded.push({ side: side.side, pngUrl, jsonUrl, previewUrl })
      }

      const metadata = buildCartMetadata(garment, uploaded)
      useDesignStore.getState().setSavedDesign(metadata)

      const cart = useCartStore.getState()
      if (garment.editLineItemId) {
        await cart.replaceDesign(garment.editLineItemId, metadata as unknown as Record<string, unknown>)
        toast.success("Đã cập nhật thiết kế trong giỏ hàng")
      } else {
        await cart.addDesign({
          variantId: garment.variantId as string,
          quantity: garment.quantity,
          metadata: metadata as unknown as Record<string, unknown>,
        })
        toast.success("Đã thêm vào giỏ hàng")
      }
      router.push("/cart")
    } catch (e) {
      toast.error(friendlyError(e, "Không thể lưu thiết kế"))
    } finally {
      setWorking(false)
    }
  }, [router])

  return { working, save }
}
