"use client"

import { useDesignStore } from "@/lib/store/design.store"
import { cn } from "@/lib/utils"

export default function ColorPicker() {
  const garment = useDesignStore((s) => s.garment)
  const setColor = useDesignStore((s) => s.setColor)

  if (!garment) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-studio-charcoal/60">
        Màu áo: <span className="font-medium">{garment.color.name}</span>
      </span>
      <div className="flex gap-1">
        {garment.config.colors.map((c) => (
          <button
            key={c.name}
            type="button"
            title={c.name}
            aria-label={c.name}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c.hex }}
            className={cn(
              "size-5 rounded-full border border-black/15 transition-all",
              garment.color.name === c.name
                ? "ring-2 ring-studio-charcoal ring-offset-1"
                : "hover:ring-2 hover:ring-black/20 hover:ring-offset-1"
            )}
          />
        ))}
      </div>
    </div>
  )
}
