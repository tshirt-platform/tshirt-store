"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Minus, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/format"
import {
  clampQuantity,
  editDesignHref,
  lineSubtotal,
  previewOf,
  readDesign,
  sideLabel,
  type CartLine,
} from "@/lib/cart/line-item"
import { DesignLightbox } from "./DesignLightbox"

interface Props {
  line: CartLine
  busy: boolean
  onQuantity: (quantity: number) => void
  onRemove: () => void
}

export function CartItem({ line, busy, onQuantity, onRemove }: Props) {
  const [zoom, setZoom] = useState(false)
  const design = readDesign(line)
  const image = design ? previewOf(design.designs[0]) : (line.thumbnail ?? null)
  const editHref = design ? editDesignHref(line) : null

  return (
    <li className="flex gap-4 rounded-xl border p-4" aria-busy={busy}>
      <button
        type="button"
        disabled={!design}
        onClick={() => setZoom(true)}
        aria-label="Xem thiết kế"
        className="size-24 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F0] sm:size-28"
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={line.title} className="size-full object-contain" />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{line.title}</h3>
            {design?.garment && (
              <p className="text-muted-foreground text-sm">
                {design.garment.color_name} · size {design.garment.size}
              </p>
            )}
            {design && (
              <p className="text-muted-foreground text-xs">
                In: {design.designs.map((d) => sideLabel(d.side)).join(", ")}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove} disabled={busy} aria-label="Xoá khỏi giỏ hàng">
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={busy || line.quantity <= 1}
              onClick={() => onQuantity(clampQuantity(line.quantity - 1))}
              aria-label="Giảm số lượng"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-10 text-center text-sm tabular-nums" aria-label="Số lượng">
              {busy ? <Loader2 className="mx-auto size-4 animate-spin" /> : line.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={busy || line.quantity >= 100}
              onClick={() => onQuantity(clampQuantity(line.quantity + 1))}
              aria-label="Tăng số lượng"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <div className="text-right">
            <div className="text-muted-foreground text-xs">
              {formatVND(line.unit_price)} × {line.quantity}
            </div>
            <div className="font-semibold">{formatVND(lineSubtotal(line))}</div>
          </div>
        </div>

        {editHref && (
          <Link href={editHref} className="text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline">
            <Pencil className="size-3" /> Chỉnh sửa thiết kế
          </Link>
        )}
      </div>

      {design && <DesignLightbox
          title={line.title}
          images={design.designs.map((d) => ({ side: d.side, url: previewOf(d) }))}
          open={zoom}
          onOpenChange={setZoom}
        />}
    </li>
  )
}
