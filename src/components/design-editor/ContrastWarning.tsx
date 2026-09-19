"use client"

import { useEffect, useMemo, useState } from "react"
import type { FabricObject, IText } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import { isUserObject } from "@/lib/canvas/constraints"
import { isLowContrast } from "@/lib/print/contrast"

const TEXT_TYPES = ["i-text", "text", "textbox"]

function isText(obj: FabricObject): obj is IText {
  return TEXT_TYPES.includes(obj.type ?? "")
}

export default function ContrastWarning() {
  const canvas = useDesignStore((s) => s.canvas)
  const garment = useDesignStore((s) => s.garment)
  // Bumped by canvas events; the warning list itself is derived during render
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!canvas) return
    const bump = () => setVersion((v) => v + 1)
    const events = ["object:added", "object:modified", "object:removed"] as const
    events.forEach((e) => canvas.on(e, bump))
    return () => events.forEach((e) => canvas.off(e, bump))
  }, [canvas])

  const hidden = useMemo(() => {
    if (!canvas || !garment) return []
    return canvas
      .getObjects()
      .filter(isUserObject)
      .filter(isText)
      .filter((t) => isLowContrast(t.fill, garment.color.hex))
      .map((t) => t.text ?? "")
    // version is the change signal for mutations Fabric does not report through props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, garment, version])

  if (hidden.length === 0 || !garment) return null

  const sample = hidden[0].length > 24 ? `${hidden[0].slice(0, 24)}…` : hidden[0]
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
      Chữ &ldquo;{sample}&rdquo;
      {hidden.length > 1 ? ` và ${hidden.length - 1} chữ khác` : ""} khó nhìn trên
      áo màu {garment.color.name}. Hãy đổi màu chữ.
    </div>
  )
}
