"use client"

import { useState } from "react"
import type { DesignAsset } from "@tshirt-platform/shared"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { previewOf, sideLabel } from "@/lib/cart/line-item"

interface Props {
  title: string
  designs: DesignAsset[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Full-size preview of each printed side of a cart item */
export function DesignLightbox({ title, designs, open, onOpenChange }: Props) {
  const [index, setIndex] = useState(0)
  const design = designs[Math.min(index, designs.length - 1)]
  if (!design) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {designs.length > 1 && (
          <div className="flex gap-1">
            {designs.map((d, i) => (
              <button
                key={d.side}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "rounded-md border px-3 py-1 text-xs",
                  i === index ? "bg-studio-charcoal text-white" : "hover:bg-black/5"
                )}
              >
                {sideLabel(d.side)}
              </button>
            ))}
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewOf(design)}
          alt={`${title} - ${sideLabel(design.side)}`}
          className="max-h-[70vh] w-full rounded-lg bg-[#F5F5F0] object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
