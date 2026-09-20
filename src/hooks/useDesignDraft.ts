"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { DesignSide } from "@tshirt-platform/shared"
import { collectSides, EMPTY_DESIGN_MESSAGE, warnAboutProblems } from "@/lib/design/collect"
import { clearDraft, readDraft, saveDraft } from "@/lib/design/draft"
import { fetchDesignScene, newDesignId, uploadDesignFile } from "@/lib/design/upload"
import { friendlyError } from "@/lib/errors"
import { useDesignStore } from "@/lib/store/design.store"

/** Saves the design and nothing else: no preview, no cart. It can be opened again on this device. */
export function useSaveDraft() {
  const [saving, setSaving] = useState(false)

  const save = useCallback(async () => {
    const productId = useDesignStore.getState().garment?.productId
    if (!productId) return

    setSaving(true)
    try {
      const sides = await collectSides()
      if (!sides) return
      if (sides.length === 0) {
        toast.error(EMPTY_DESIGN_MESSAGE)
        return
      }
      warnAboutProblems(sides)

      const designId = newDesignId()
      const stored = await Promise.all(
        sides.map(async (side) => {
          const ref = { designId, side: side.side as DesignSide }
          const [, jsonUrl] = await Promise.all([
            uploadDesignFile(side.png, { ...ref, kind: "png" }),
            uploadDesignFile(new Blob([side.json], { type: "application/json" }), { ...ref, kind: "json" }),
          ])
          return { side: side.side, jsonUrl }
        })
      )
      const remembered = saveDraft(productId, { designId, sides: stored, savedAt: Date.now() })
      toast.success(
        remembered ? "Đã lưu thiết kế. Bạn có thể quay lại chỉnh sửa sau." : "Đã lưu thiết kế lên máy chủ (trình duyệt không cho nhớ lại)."
      )
    } catch (e) {
      toast.error(friendlyError(e, "Không thể lưu thiết kế"))
    } finally {
      setSaving(false)
    }
  }, [])

  return { saving, save }
}

/** Opens the design last saved for this product, unless the editor was opened from the cart */
export function useRestoreDraft(): void {
  const canvas = useDesignStore((s) => s.canvas)
  const productId = useDesignStore((s) => s.garment?.productId ?? null)
  const editing = useDesignStore((s) => s.garment?.editLineItemId ?? null)
  const done = useRef<string | null>(null)

  useEffect(() => {
    if (!canvas || !productId || editing || done.current === productId) return
    done.current = productId
    const draft = readDraft(productId)
    if (!draft) return

    void (async () => {
      try {
        const entries = await Promise.all(
          draft.sides.map(async (s) => [s.side, await fetchDesignScene(s.jsonUrl)] as const)
        )
        await useDesignStore.getState().loadSides(Object.fromEntries(entries) as Partial<Record<DesignSide, string>>)
        toast("Đã mở lại thiết kế bạn đã lưu", {
          action: {
            label: "Làm mới",
            onClick: () => {
              clearDraft(productId)
              window.location.reload()
            },
          },
        })
      } catch {
        // A draft that can no longer be read is dropped, so it does not fail on every visit
        clearDraft(productId)
      }
    })()
  }, [canvas, productId, editing])
}
