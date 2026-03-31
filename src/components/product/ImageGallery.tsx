"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type ImageGalleryProps = {
  images: Array<{ url: string; alt?: string }>
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100">
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    )
  }

  return (
    <div>
      {/* Main image */}
      <div className="overflow-hidden rounded-xl bg-gray-100">
        <img
          src={activeImage.url}
          alt={activeImage.alt ?? "Product image"}
          className="aspect-square w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.url}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === activeIndex
                  ? "border-gray-900"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <img
                src={img.url}
                alt={img.alt ?? `Thumbnail ${index + 1}`}
                className="size-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
