"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { DesignSide } from "@tshirt-platform/shared"
import { Button } from "@/components/ui/button"
import type { PreviewPhase, PreviewView } from "@/hooks/usePreviewScreen"
import { useDesignStore } from "@/lib/store/design.store"
import { cn } from "@/lib/utils"

const SIDE_LABEL: Record<DesignSide, string> = { front: "Mặt trước", back: "Mặt sau" }

interface Props {
  phase: PreviewPhase
  views: Partial<Record<DesignSide, PreviewView[]>>
  error: string | null
  onRetry: () => void
  onBack: () => void
}

/** Takes the canvas's place: the design on the product's photos, with the list of photos beside it */
export default function PreviewScreen({ phase, views, error, onRetry, onBack }: Props) {
  const editedSide = useDesignStore((s) => s.side)
  const garment = useDesignStore((s) => s.garment)
  const sides = (["front", "back"] as const).filter((s) => (views[s]?.length ?? 0) > 0)
  const [picked, setPicked] = useState<DesignSide | null>(null)
  const [selected, setSelected] = useState(0)

  if (phase === "loading" || phase === "closed") {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 bg-[#F5F5F0] text-sm text-studio-charcoal/60" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Đang tạo bản xem trước…
      </div>
    )
  }
  if (phase === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#F5F5F0] p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>Chỉnh sửa tiếp</Button>
          <Button size="sm" onClick={onRetry}>Thử lại</Button>
        </div>
      </div>
    )
  }

  const side = picked && sides.includes(picked) ? picked : sides.includes(editedSide) ? editedSide : sides[0]
  const list = views[side] ?? []
  const index = selected < list.length ? selected : 0
  const current = list[index]

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#F5F5F0] p-3 md:p-6">
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={`${SIDE_LABEL[side]}, ảnh ${index + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
          />
        )}
      </div>

      <aside className="flex max-h-[34vh] w-full flex-col border-t border-black/5 bg-white md:max-h-none md:w-80 md:border-l md:border-t-0">
        <div className="space-y-2 border-b border-black/5 p-3">
          <p className="text-xs text-studio-charcoal/70">
            Áo {garment?.color.name}
            {garment?.size ? ` · size ${garment.size}` : ""}
          </p>
          {sides.length > 1 && (
            <div role="tablist" className="flex gap-1 rounded-lg border border-black/10 p-1">
              {sides.map((s) => (
                <button
                  key={s}
                  role="tab"
                  type="button"
                  aria-selected={s === side}
                  onClick={() => {
                    setPicked(s)
                    setSelected(0)
                  }}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1 text-xs",
                    s === side ? "bg-studio-charcoal text-white" : "text-studio-charcoal/70 hover:bg-black/5"
                  )}
                >
                  {SIDE_LABEL[s]}
                </button>
              ))}
            </div>
          )}
        </div>

        <ul className="grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto p-3 md:grid-cols-2" aria-label="Các ảnh xem trước">
          {list.map((v, i) => (
            <li key={v.key}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                aria-pressed={i === index}
                className={cn(
                  "block w-full overflow-hidden rounded-md border-2 bg-[#F5F5F0]",
                  i === index ? "border-studio-charcoal" : "border-transparent hover:border-black/20"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.url} alt="" className="aspect-[3/4] w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>

        <p className="border-t border-black/5 p-3 text-[11px] leading-relaxed text-studio-charcoal/50">
          {current?.source === "flat"
            ? "Sản phẩm này chưa có ảnh áo thật nên đang dùng hình vẽ phẳng."
            : "Bản xem trước gần đúng, màu in thực tế có thể khác đôi chút."}
        </p>
      </aside>
    </div>
  )
}
