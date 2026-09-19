"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { sideLabel } from "@/lib/cart/line-item"

export interface LightboxImage {
  side: "front" | "back"
  url: string
}

interface Props {
  title: string
  images: LightboxImage[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Full-size preview of each printed side of an item, in the cart or on an order */
export function DesignLightbox({ title, images, open, onOpenChange }: Props) {
  const [index, setIndex] = useState(0)
  const image = images[Math.min(index, images.length - 1)]
  if (!image) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {images.length > 1 && (
          <div className="flex gap-1">
            {images.map((d, i) => (
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
          src={image.url}
          alt={`${title} - ${sideLabel(image.side)}`}
          className="max-h-[70vh] w-full rounded-lg bg-[#F5F5F0] object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
