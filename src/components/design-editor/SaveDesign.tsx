"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSaveDesign, type SidePreview } from "@/hooks/useSaveDesign"
import { useDesignStore } from "@/lib/store/design.store"

const SIDE_LABEL = { front: "Mặt trước", back: "Mặt sau" } as const

function PreviewCard({ p }: { p: SidePreview }) {
  const { widthMm, heightMm } = p.layout.area
  return (
    <figure className="overflow-hidden rounded-lg border border-black/10 bg-[#F5F5F0]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.previewUrl} alt={`Xem trước ${SIDE_LABEL[p.side]}`} className="h-64 w-full object-contain" />
      <figcaption className="space-y-0.5 border-t border-black/5 bg-white px-3 py-2 text-xs">
        <div className="font-medium">{SIDE_LABEL[p.side]}</div>
        <div className="text-studio-charcoal/60">
          Khổ in {Math.round(widthMm)}×{Math.round(heightMm)} mm ·{" "}
          {p.source === "photo" ? "ảnh áo thật" : "bản xem trước phẳng"}
        </div>
      </figcaption>
    </figure>
  )
}

export default function SaveDesign() {
  const garment = useDesignStore((s) => s.garment)
  const { phase, previews, error, start, confirm, close } = useSaveDesign()

  if (!garment) return null

  const busy = phase === "preparing" || phase === "uploading"
  const open = phase !== "idle"
  const sizeMissing = !garment.size
  const cutOff = previews.reduce((n, p) => n + p.outOfBounds, 0)
  const lowDpi = previews.reduce((n, p) => n + p.lowDpiImages, 0)

  return (
    <>
      <Button size="sm" onClick={start} disabled={busy} className="h-8 px-4 text-xs">
        {phase === "preparing" ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
        Lưu thiết kế
      </Button>

      <Dialog open={open} onOpenChange={(o) => !o && !busy && close()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xem trước thiết kế</DialogTitle>
            <DialogDescription>
              Áo {garment.color.name}
              {garment.size ? ` · size ${garment.size}` : ""}
              {garment.color.needs_underbase ? " · in có lớp lót trắng" : ""}
            </DialogDescription>
          </DialogHeader>

          {phase === "preparing" && (
            <p className="flex items-center gap-2 py-10 text-sm text-studio-charcoal/60">
              <Loader2 className="size-4 animate-spin" /> Đang tạo bản xem trước…
            </p>
          )}

          {(phase === "review" || phase === "uploading" || phase === "saved") && (
            <div className="grid gap-3 sm:grid-cols-2">
              {previews.map((p) => (
                <PreviewCard key={p.side} p={p} />
              ))}
            </div>
          )}

          {phase === "review" && (
            <ul className="space-y-1 text-xs text-amber-800">
              {cutOff > 0 && <li>{cutOff} phần nằm ngoài vùng in sẽ bị cắt khi in.</li>}
              {lowDpi > 0 && <li>{lowDpi} ảnh dưới 150 DPI, in ra có thể bị mờ.</li>}
              {sizeMissing && (
                <li>Chưa chọn size. Hãy quay lại trang sản phẩm để chọn size trước khi đặt hàng.</li>
              )}
            </ul>
          )}

          {phase === "saved" && (
            <p className="text-sm text-green-700">
              Đã lưu thiết kế. File in đúng khổ, 300 DPI, nền trong suốt.
            </p>
          )}
          {phase === "error" && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            {phase === "error" && <Button onClick={start}>Thử lại</Button>}
            {phase === "saved" ? (
              <Button onClick={close}>Đóng</Button>
            ) : (
              <>
                <Button variant="outline" onClick={close} disabled={busy}>
                  Chỉnh sửa tiếp
                </Button>
                {(phase === "review" || phase === "uploading") && (
                  <Button onClick={confirm} disabled={busy || sizeMissing}>
                    {phase === "uploading" ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
                    Xác nhận thiết kế
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
