"use client"

import { useDesignStore } from "@/lib/store/design.store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DesignSide } from "@tshirt/shared"

const SIDES: { value: DesignSide; label: string }[] = [
  { value: "front", label: "Mặt trước" },
  { value: "back", label: "Mặt sau" },
]

export default function SideToggle() {
  const side = useDesignStore((s) => s.side)
  const setSide = useDesignStore((s) => s.setSide)

  return (
    <div className="flex gap-1 rounded-lg border border-black/10 bg-white p-1">
      {SIDES.map((s) => (
        <Button
          key={s.value}
          variant="ghost"
          size="sm"
          onClick={() => setSide(s.value)}
          className={cn(
            "h-7 rounded-md px-3 text-xs",
            side === s.value &&
              "bg-studio-charcoal text-white hover:bg-studio-charcoal/90 hover:text-white"
          )}
        >
          {s.label}
        </Button>
      ))}
    </div>
  )
}
