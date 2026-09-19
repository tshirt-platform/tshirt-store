"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatVND } from "@/lib/format"
import { previewOf, readDesign, sideLabel, lineSubtotal, type CartLine } from "@/lib/cart/line-item"
import { cn } from "@/lib/utils"

interface Props {
  items: CartLine[]
  subtotal: number
  /** null until the customer has a shipping option to price */
  shipping: number | null
  formId: string
  submitting: boolean
  canSubmit: boolean
}

function Thumb({ line }: { line: CartLine }) {
  const design = readDesign(line)
  const src = design ? previewOf(design.designs[0]) : (line.thumbnail ?? null)
  return (
    <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md border">
      {src && <Image src={src} alt="" fill unoptimized sizes="56px" className="object-contain" />}
    </div>
  )
}

export function CheckoutSummary({ items, subtotal, shipping, formId, submitting, canSubmit }: Props) {
  // On a phone the list is folded away so the form comes first; from lg up it is always shown
  const [open, setOpen] = useState(false)
  const total = subtotal + (shipping ?? 0)
  const count = items.reduce((n, l) => n + l.quantity, 0)

  return (
    <aside className="h-fit rounded-xl border p-5 lg:sticky lg:top-20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between font-semibold lg:pointer-events-none"
      >
        <span>Đơn hàng ({count} sản phẩm)</span>
        <span className="flex items-center gap-2 lg:hidden">
          <span className="text-sm font-normal">{formatVND(total)}</span>
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
        </span>
      </button>

      <ul className={cn("mt-4 space-y-3", open ? "block" : "hidden lg:block")}>
        {items.map((line) => {
          const design = readDesign(line)
          const sides = design ? design.designs.map((d) => sideLabel(d.side)).join(" + ") : null
          return (
            <li key={line.id} className="flex gap-3 text-sm">
              <Thumb line={line} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{line.title}</p>
                <p className="text-muted-foreground text-xs">
                  {sides ? `In ${sides} · ` : ""}SL {line.quantity}
                </p>
              </div>
              <p className="shrink-0">{formatVND(lineSubtotal(line))}</p>
            </li>
          )
        })}
      </ul>

      <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tạm tính</dt>
          <dd>{formatVND(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Phí vận chuyển</dt>
          <dd>{shipping === null ? "—" : formatVND(shipping)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Mã giảm giá</dt>
          <dd>
            <Input disabled placeholder="Sắp ra mắt" aria-label="Mã giảm giá" className="h-7 w-32 text-xs" />
          </dd>
        </div>
        <div className="flex justify-between border-t pt-3 text-base font-semibold">
          <dt>Tổng cộng</dt>
          <dd>{formatVND(total)}</dd>
        </div>
      </dl>

      <Button type="submit" form={formId} size="lg" className="mt-5 w-full" disabled={!canSubmit || submitting}>
        {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Đặt hàng"}
      </Button>
      <p className="text-muted-foreground mt-2 text-center text-xs">Thanh toán tiền mặt khi nhận hàng</p>
    </aside>
  )
}
