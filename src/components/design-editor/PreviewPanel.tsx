"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useLivePreview } from "@/hooks/useLivePreview"
import { useDesignStore } from "@/lib/store/design.store"
import { cn } from "@/lib/utils"

const SIDE_LABEL = { front: "Mặt trước", back: "Mặt sau" } as const

/** The design on the garment photos of the side being edited; follows every change */
export default function PreviewPanel() {
  const garment = useDesignStore((s) => s.garment)
  const { views, loading, blank, side } = useLivePreview()
  const [selected, setSelected] = useState(0)

  // A shorter list after a change must not leave the viewer on an image that is gone
  const index = selected < views.length ? selected : 0
  const current = views[index]

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <div className="flex items-center justify-between text-xs text-studio-charcoal/70">
        <span className="font-medium text-studio-charcoal">
          {SIDE_LABEL[side]} · áo {garment?.color.name}
        </span>
        {loading && (
          <span className="flex items-center gap-1" role="status">
            <Loader2 className="size-3 animate-spin" aria-hidden /> Đang cập nhật
          </span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-black/10 bg-[#F5F5F0]">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={`Xem trước ${SIDE_LABEL[side]}, ảnh ${index + 1}`}
            className={cn("mx-auto block max-h-[62vh] w-full object-contain transition-opacity", loading && "opacity-60")}
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center text-xs text-studio-charcoal/50">
            {loading ? "Đang tạo bản xem trước…" : "Chưa có bản xem trước"}
          </div>
        )}
      </div>

      {views.length > 1 && (
        <ul className="grid grid-cols-4 gap-2" aria-label="Các ảnh xem trước">
          {views.map((v, i) => (
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
                <img src={v.url} alt="" className="aspect-square w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] leading-relaxed text-studio-charcoal/50">
        {blank
          ? "Thêm chữ hoặc hình ảnh, bản xem trước sẽ hiện ngay trên áo."
          : current?.source === "flat"
            ? "Sản phẩm này chưa có ảnh áo thật nên đang dùng hình vẽ phẳng."
            : "Bản xem trước gần đúng, màu in thực tế có thể khác đôi chút."}
      </p>
    </div>
  )
}
