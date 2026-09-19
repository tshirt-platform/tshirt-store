"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { GarmentColor, SizeChartRow } from "@tshirt-platform/shared"
import { Button } from "@/components/ui/button"
import { SizeChart } from "@/components/product/SizeChart"
import { ColorSwatch } from "@/components/product/ColorSwatch"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

type OptionValue = { value: string }
type ProductOption = { id: string; title: string; values: OptionValue[] }
type VariantOption = { option_id: string; value: string }
type Variant = {
  id: string
  options?: VariantOption[] | null
  calculated_price?: { calculated_amount: number } | null
}

type VariantSelectorProps = {
  productId: string
  options: ProductOption[]
  variants: Variant[]
  colors?: GarmentColor[]
  sizeChart?: SizeChartRow[]
}

export function VariantSelector({
  productId,
  options,
  variants,
  colors,
  sizeChart,
}: VariantSelectorProps) {
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const colorOption = options.find((o) => o.title.toLowerCase() === "color")
  const sizeOption = options.find((o) => o.title.toLowerCase() === "size")

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null
    return variants.find((v) => {
      const opts = v.options ?? []
      const hasColor = opts.some(
        (o) =>
          o.option_id === colorOption?.id && o.value === selectedColor
      )
      const hasSize = opts.some(
        (o) =>
          o.option_id === sizeOption?.id && o.value === selectedSize
      )
      return hasColor && hasSize
    })
  }, [selectedColor, selectedSize, variants, colorOption, sizeOption])

  const price = selectedVariant?.calculated_price?.calculated_amount
    ?? variants.find((v) => v.calculated_price?.calculated_amount != null)?.calculated_price?.calculated_amount
    ?? null
  // A chosen variant without a price cannot be added to a cart
  const unpriced = selectedVariant != null && selectedVariant.calculated_price?.calculated_amount == null

  function handleDesign() {
    if (!selectedColor || !selectedSize) {
      setError("Vui lòng chọn màu và size")
      return
    }
    if (!selectedVariant) {
      setError("Không tìm thấy phiên bản phù hợp")
      return
    }
    if (unpriced) {
      setError("Phiên bản này chưa có giá, tạm thời chưa bán")
      return
    }
    const params = new URLSearchParams({
      variantId: selectedVariant.id,
      color: selectedColor,
      size: selectedSize,
      qty: String(quantity),
    })
    router.push(`/design/${productId}?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="text-2xl font-bold">
        {price === null ? "Chưa có giá" : formatVND(price)}
      </div>

      {/* Color picker */}
      {colorOption && (
        <div>
          <div className="mb-2 text-sm font-medium">
            Màu sắc{selectedColor && `: ${selectedColor}`}
          </div>
          <div className="flex flex-wrap gap-2">
            {colorOption.values.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => { setSelectedColor(v.value); setError(null) }}
                aria-label={v.value}
                aria-pressed={selectedColor === v.value}
                className={cn(
                  "rounded-full transition-all",
                  selectedColor === v.value
                    ? "ring-2 ring-gray-900 ring-offset-2"
                    : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                )}
              >
                <ColorSwatch name={v.value} colors={colors} className="size-9" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizeOption && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Size</span>
            <SizeChart rows={sizeChart} />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeOption.values.map((v) => (
              <button
                key={v.value}
                onClick={() => { setSelectedSize(v.value); setError(null) }}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  selectedSize === v.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 hover:border-gray-400"
                )}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <div className="mb-2 text-sm font-medium">Số lượng</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex size-9 items-center justify-center rounded-lg border text-lg"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
              )
            }
            className="w-16 rounded-lg border px-3 py-1.5 text-center text-sm"
          />
          <button
            onClick={() => setQuantity(Math.min(100, quantity + 1))}
            className="flex size-9 items-center justify-center rounded-lg border text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* CTA */}
      <Button onClick={handleDesign} size="lg" className="w-full" disabled={unpriced || price === null}>
        Bắt đầu thiết kế
      </Button>
    </div>
  )
}
