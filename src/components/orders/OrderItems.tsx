"use client"

import { useState } from "react"
import Image from "next/image"
import { DesignLightbox } from "@/components/cart/DesignLightbox"
import { formatVND } from "@/lib/format"
import { sideLabel } from "@/lib/cart/line-item"
import type { TrackedItem, TrackedJob } from "@/lib/orders/api"
import { jobLabel } from "@/lib/orders/status"

function OrderItem({ item, jobs }: { item: TrackedItem; jobs: TrackedJob[] }) {
  const [zoom, setZoom] = useState(false)
  const cover = item.designs[0]?.image_url ?? item.thumbnail
  const garment = [item.garment?.color_name, item.garment?.size && `size ${item.garment.size}`].filter(Boolean).join(" · ")

  return (
    <li className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <button
        type="button"
        disabled={item.designs.length === 0}
        onClick={() => setZoom(true)}
        aria-label={`Xem thiết kế ${item.title}`}
        className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-md border enabled:cursor-zoom-in"
      >
        {cover && <Image src={cover} alt="" fill unoptimized sizes="80px" className="object-contain" />}
      </button>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">{item.title}</p>
        {garment && <p className="text-muted-foreground text-xs">{garment}</p>}
        <p className="text-muted-foreground text-xs">
          SL {item.quantity} × {formatVND(item.unit_price)}
        </p>
        {jobs.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {jobs.map((j) => (
              <li key={j.id} className="rounded-full border px-2 py-0.5 text-xs">
                {j.side ? `${sideLabel(j.side)}: ` : ""}
                {jobLabel(j.status)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="shrink-0 text-sm font-medium">{formatVND(item.unit_price * item.quantity)}</p>
      {item.designs.length > 0 && (
        <DesignLightbox
          title={item.title}
          images={item.designs.map((d) => ({ side: d.side, url: d.image_url }))}
          open={zoom}
          onOpenChange={setZoom}
        />
      )}
    </li>
  )
}

export function OrderItems({ items, jobs }: { items: TrackedItem[]; jobs: TrackedJob[] }) {
  return (
    <ul className="divide-y">
      {items.map((item) => (
        <OrderItem key={item.id} item={item} jobs={jobs.filter((j) => j.order_item_id === item.id)} />
      ))}
    </ul>
  )
}
