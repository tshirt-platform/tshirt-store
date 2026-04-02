"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
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
import { toast } from "sonner"
import ValidationWarning from "./ValidationWarning"

interface PreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ExportStep =
  | "idle"
  | "validating"
  | "exporting"
  | "uploading"
  | "adding"
  | "done"
  | "error"

const STEP_LABELS: Record<ExportStep, string> = {
  idle: "",
  validating: "Kiểm tra thiết kế...",
  exporting: "Xuất thiết kế...",
  uploading: "Tải lên...",
  adding: "Thêm vào giỏ hàng...",
  done: "Hoàn tất!",
  error: "Có lỗi xảy ra",
}

// Mockup images for preview
const MOCKUP_IMAGES = [
  "/images/mockup/09-blank-white-shirt.jpg",
  "/images/mockup/01-woman-white-tshirt-front.jpg",
  "/images/mockup/03-man-white-crew-neck.jpg",
]

export default function PreviewModal({
  open,
  onOpenChange,
}: PreviewModalProps) {
  const router = useRouter()
  const canvas = useDesignStore((s) => s.canvas)
  const side = useDesignStore((s) => s.side)
  const variantId = useDesignStore((s) => s.variantId)
  const productId = useDesignStore((s) => s.productId)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [step, setStep] = useState<ExportStep>("idle")
  const [selectedMockup, setSelectedMockup] = useState(0)
  const [validationOpen, setValidationOpen] = useState(false)
  const [outOfBoundsCount, setOutOfBoundsCount] = useState(0)

  // Generate preview when modal opens
  useEffect(() => {
    if (!open || !canvas) return
    try {
      const blob = exportToPng(canvas)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } catch {
      setPreviewUrl(null)
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
    <Dialog open={open} onOpenChange={isProcessing ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Xem trước thiết kế</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mockup preview area */}
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={MOCKUP_IMAGES[selectedMockup]}
              alt="T-shirt mockup"
              fill
              className="object-cover"
              priority
            />
            {previewUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[45%] w-[35%] translate-y-[-5%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Design preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mockup thumbnails */}
          <div className="flex justify-center gap-2">
            {MOCKUP_IMAGES.map((src, i) => (
              <button
                key={src}
                onClick={() => setSelectedMockup(i)}
                className={`relative h-14 w-14 overflow-hidden rounded-md border-2 transition ${
                  selectedMockup === i
                    ? "border-studio-charcoal"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={src}
                  alt={`Mockup ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Side indicator */}
          <p className="text-center text-sm text-muted-foreground">
            Mặt: {side === "front" ? "Trước" : "Sau"}
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
          <Button onClick={handleAddToCart} disabled={isProcessing || !canvas}>
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
