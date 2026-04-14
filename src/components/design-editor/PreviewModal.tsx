"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShoppingCart, ArrowLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDesignStore } from "@/lib/store/design.store"
import { exportToPng, exportToJson } from "@/lib/canvas/export"
import { uploadDesign } from "@/lib/upload"
import { validateAllObjects } from "@/lib/canvas/constraints"
import { renderMockup } from "@/lib/canvas/mockup-renderer"
import { MOCKUP_CONFIGS } from "@/lib/canvas/mockup-config"
import { toast } from "sonner"
import ValidationWarning from "./ValidationWarning"

interface PreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ExportStep =
  | "idle"
  | "exporting"
  | "uploading"
  | "adding"
  | "done"
  | "error"

const STEP_LABELS: Record<ExportStep, string> = {
  idle: "",
  exporting: "Xuất thiết kế...",
  uploading: "Tải lên...",
  adding: "Thêm vào giỏ hàng...",
  done: "Hoàn tất!",
  error: "Có lỗi xảy ra",
}

export default function PreviewModal({
  open,
  onOpenChange,
}: PreviewModalProps) {
  const router = useRouter()
  const canvas = useDesignStore((s) => s.canvas)
  const side = useDesignStore((s) => s.side)
  const variantId = useDesignStore((s) => s.variantId)
  const productId = useDesignStore((s) => s.productId)

  const [mockupUrls, setMockupUrls] = useState<string[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [rendering, setRendering] = useState(false)
  const [step, setStep] = useState<ExportStep>("idle")
  const [validationOpen, setValidationOpen] = useState(false)
  const [outOfBoundsCount, setOutOfBoundsCount] = useState(0)

  // Generate realistic mockup previews when modal opens
  useEffect(() => {
    if (!open || !canvas) return

    let cancelled = false
    const urls: string[] = []

    async function generate() {
      setRendering(true)
      try {
        const designBlob = exportToPng(canvas!)

        // Render each mockup config in parallel
        const results = await Promise.allSettled(
          MOCKUP_CONFIGS.map((config) => renderMockup(config, designBlob))
        )

        if (cancelled) return

        for (const result of results) {
          if (result.status === "fulfilled") {
            const url = URL.createObjectURL(result.value)
            urls.push(url)
          }
        }

        setMockupUrls(urls)
        setSelectedIdx(0)
      } catch {
        // Fallback: no mockup rendered
        setMockupUrls([])
      } finally {
        if (!cancelled) setRendering(false)
      }
    }

    generate()

    return () => {
      cancelled = true
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [open, canvas])

  // Phase 1: Validate before exporting
  const handleAddToCart = useCallback(() => {
    if (!canvas || !productId) return

    const { valid, outOfBounds } = validateAllObjects(canvas, side)
    if (!valid) {
      setOutOfBoundsCount(outOfBounds.length)
      setValidationOpen(true)
      return
    }
    doExportAndUpload()
  }, [canvas, productId, side])

  // Phase 2: Export, upload, and add to cart
  const doExportAndUpload = useCallback(async () => {
    if (!canvas || !productId) return
    setValidationOpen(false)

    try {
      setStep("exporting")
      const pngBlob = exportToPng(canvas)
      const jsonStr = exportToJson(canvas)
      const jsonBlob = new Blob([jsonStr], { type: "application/json" })

      setStep("uploading")
      const [pngResult, jsonResult] = await Promise.all([
        uploadDesign(pngBlob, "image/png", side),
        uploadDesign(jsonBlob, "application/json", side),
      ])

      setStep("adding")
      useDesignStore.getState().setPngUrl(pngResult.fileUrl)
      useDesignStore.getState().setJsonUrl(jsonResult.fileUrl)

      // TODO: POST /store/carts/{id}/line-items when cart is implemented
      setStep("done")
      toast.success("Thiết kế đã được lưu!")

      setTimeout(() => {
        onOpenChange(false)
        router.push(
          `/cart?design_png=${encodeURIComponent(pngResult.fileUrl)}` +
            `&design_json=${encodeURIComponent(jsonResult.fileUrl)}` +
            `&side=${side}` +
            `&variant_id=${variantId ?? ""}` +
            `&product_id=${productId}`
        )
      }, 500)
    } catch (err) {
      setStep("error")
      const msg = err instanceof Error ? err.message : "Unknown error"
      toast.error(`Lỗi: ${msg}`)
    }
  }, [canvas, side, variantId, productId, onOpenChange, router])

  const isProcessing = !["idle", "done", "error"].includes(step)
  const currentUrl = mockupUrls[selectedIdx] ?? null

  return (
    <>
      <ValidationWarning
        open={validationOpen}
        onOpenChange={setValidationOpen}
        outOfBoundsCount={outOfBoundsCount}
        onProceed={doExportAndUpload}
        onGoBack={() => {
          setValidationOpen(false)
          onOpenChange(false)
        }}
      />
      <Dialog
        open={open}
        onOpenChange={isProcessing ? undefined : onOpenChange}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xem trước thiết kế</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Mockup preview area */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-lg bg-gray-50">
              {rendering && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    Đang tạo mockup...
                  </div>
                </div>
              )}
              {currentUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={currentUrl}
                  alt="Mockup preview"
                  className="h-full w-full object-contain"
                />
              )}
              {!currentUrl && !rendering && (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Không có mockup nào
                </div>
              )}
            </div>

            {/* Mockup thumbnails */}
            {mockupUrls.length > 1 && (
              <div className="flex justify-center gap-2">
                {mockupUrls.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setSelectedIdx(i)}
                    className={`relative h-16 w-14 overflow-hidden rounded-md border-2 transition ${
                      selectedIdx === i
                        ? "border-studio-charcoal"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={MOCKUP_CONFIGS[i]?.label ?? `Mockup ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Mockup label + side */}
            <p className="text-center text-sm text-muted-foreground">
              {MOCKUP_CONFIGS[selectedIdx]?.label ?? "Mockup"} —{" "}
              {side === "front" ? "Mặt trước" : "Mặt sau"}
            </p>

            {/* Processing status */}
            {step !== "idle" && (
              <div className="flex items-center justify-center gap-2 text-sm">
                {isProcessing && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                <span>{STEP_LABELS[step]}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 size-4" />
              Quay lại chỉnh sửa
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={isProcessing || !canvas || rendering}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 size-4" />
              )}
              Thêm vào giỏ hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
