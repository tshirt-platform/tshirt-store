import { findGarmentColor, type GarmentColor } from "@tshirt-platform/shared"
import { cn } from "@/lib/utils"

const UNKNOWN_HEX = "#D1D5DB"

interface ColorSwatchProps {
  name: string
  /** Product colour registry; falls back to the built-in one */
  colors?: GarmentColor[]
  className?: string
}

export function swatchHex(name: string, colors?: GarmentColor[]): string {
  return findGarmentColor(name, colors)?.hex ?? UNKNOWN_HEX
}

export function ColorSwatch({ name, colors, className }: ColorSwatchProps) {
  const color = findGarmentColor(name, colors)
  return (
    <span
      title={name}
      style={{ backgroundColor: color?.hex ?? UNKNOWN_HEX }}
      className={cn(
        "inline-block rounded-full",
        // Light fabrics vanish on a white card without an outline
        !color?.is_dark && "border border-black/15",
        className
      )}
    />
  )
}
