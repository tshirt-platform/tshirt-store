"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { DesignSide } from "@tshirt-platform/shared"
import { collectSides, EMPTY_DESIGN_MESSAGE, warnAboutProblems } from "@/lib/design/collect"
import { buildPreviewImages, PREVIEW_MULTIPLIER } from "@/lib/design/live-preview"
import { friendlyError } from "@/lib/errors"
import { layoutForGarment } from "@/lib/print/garment"
import { useDesignStore } from "@/lib/store/design.store"

export type PreviewPhase = "closed" | "loading" | "ready" | "error"

export interface PreviewView {
  key: string
  url: string
  source: "photo" | "flat"
}

/**
 * The preview screen: built once when the customer presses Continue, not while they edit. Each side
 * with a design is shown on every garment photo the product has for it.
 */
export function usePreviewScreen() {
  const [phase, setPhase] = useState<PreviewPhase>("closed")
  const [views, setViews] = useState<Partial<Record<DesignSide, PreviewView[]>>>({})
  const [error, setError] = useState<string | null>(null)
  const urls = useRef<string[]>([])
  const run = useRef(0)

  const release = useCallback(() => {
    urls.current.forEach((u) => URL.revokeObjectURL(u))
    urls.current = []
  }, [])
  useEffect(() => release, [release])

  const close = useCallback(() => {
    run.current += 1
    release()
    setViews({})
    setError(null)
    setPhase("closed")
  }, [release])

  const open = useCallback(async () => {
    const id = ++run.current
    const garment = useDesignStore.getState().garment
    if (!garment) return

    setError(null)
    try {
      const sides = await collectSides(PREVIEW_MULTIPLIER)
      if (!sides) return
      if (sides.length === 0) {
        toast.error(EMPTY_DESIGN_MESSAGE)
        return
      }
      warnAboutProblems(sides)
      setPhase("loading")

      const built = await Promise.all(
        sides.map(async (side) => ({
          side: side.side,
          images: await buildPreviewImages({
            artwork: side.png,
            side: side.side,
            color: garment.color,
            layout: layoutForGarment(garment, side.side),
            templateIds: garment.config.mockups?.[side.side] ?? [],
          }),
        }))
      )
      if (run.current !== id) return

      release()
      const next: Partial<Record<DesignSide, PreviewView[]>> = {}
      for (const { side, images } of built) {
        next[side] = images.map((i) => {
          const url = URL.createObjectURL(i.blob)
          urls.current.push(url)
          return { key: i.key, url, source: i.source }
        })
      }
      setViews(next)
      setPhase("ready")
    } catch (e) {
      if (run.current !== id) return
      setError(friendlyError(e, "Không thể tạo bản xem trước"))
      setPhase("error")
    }
  }, [release])

  return { phase, views, error, open, close }
}
