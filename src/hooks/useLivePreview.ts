"use client"

import { useEffect, useRef, useState } from "react"
import { exportArtworkPng, hasUserContent } from "@/lib/design/export"
import { buildPreviewImages, emptyArtwork, PREVIEW_MULTIPLIER } from "@/lib/design/live-preview"
import { useDesignStore } from "@/lib/store/design.store"

const DEBOUNCE_MS = 700
const CHANGE_EVENTS = ["object:added", "object:removed", "object:modified"] as const

export interface PreviewView {
  key: string
  url: string
  source: "photo" | "flat"
}

/**
 * The design of the side being edited, shown on every garment photo of that side. It re-renders a
 * moment after the customer stops changing something, and drops any render that is out of date.
 */
export function useLivePreview() {
  const canvas = useDesignStore((s) => s.canvas)
  const garment = useDesignStore((s) => s.garment)
  const layout = useDesignStore((s) => s.layout)
  const side = useDesignStore((s) => s.side)

  const [views, setViews] = useState<PreviewView[]>([])
  const [loading, setLoading] = useState(false)
  const [blank, setBlank] = useState(true)
  const urls = useRef<string[]>([])

  const releaseUrls = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u))
    urls.current = []
  }
  useEffect(() => releaseUrls, [])

  useEffect(() => {
    if (!canvas || !garment || !layout) return
    const templateIds = garment.config.mockups?.[side] ?? []
    let timer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined
    let stopped = false

    async function refresh() {
      if (!canvas || !garment || !layout) return
      controller?.abort()
      const mine = new AbortController()
      controller = mine
      setLoading(true)
      try {
        const filled = hasUserContent(canvas)
        setBlank(!filled)
        const artwork = filled ? await exportArtworkPng(canvas, layout, PREVIEW_MULTIPLIER) : await emptyArtwork()
        const images = await buildPreviewImages({
          artwork,
          side,
          color: garment.color,
          layout,
          templateIds,
          signal: mine.signal,
        })
        if (stopped || mine.signal.aborted) return
        releaseUrls()
        const next = images.map((i) => ({ key: i.key, source: i.source, url: URL.createObjectURL(i.blob) }))
        urls.current = next.map((v) => v.url)
        setViews(next)
      } catch {
        // keep showing the previous images; the next change tries again
      } finally {
        if (!stopped && !mine.signal.aborted) setLoading(false)
      }
    }

    const debounce = (wait: number) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void refresh(), wait)
    }
    const onChange = () => {
      setLoading(true)
      debounce(DEBOUNCE_MS)
    }

    CHANGE_EVENTS.forEach((e) => canvas.on(e, onChange))
    debounce(0)
    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      controller?.abort()
      CHANGE_EVENTS.forEach((e) => canvas.off(e, onChange))
    }
    // garment is replaced when the colour changes, so it also covers the colour and the photo list
  }, [canvas, garment, layout, side])

  return { views, loading, blank, side }
}
