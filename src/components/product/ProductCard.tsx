import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ColorSwatch } from "@/components/product/ColorSwatch"
import { formatVND } from "@/lib/format"

type ProductCardProps = {
  id: string
  title: string
  thumbnail: string | null
  price: number
  colors: string[]
  tag?: string | null
}

export function ProductCard({
  id,
  title,
  thumbnail,
  price,
  colors,
  tag,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="group block overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-gray-300">
            <svg className="size-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4-4 4 4 4-6 4 6M4 4h16v16H4z" />
            </svg>
          </div>
        )}
        {tag && (
          <Badge className="absolute left-3 top-3" variant="secondary">
            {tag}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium">{title}</h3>
        <p className="mt-1 text-sm font-semibold">{formatVND(price)}</p>

        {/* Color swatches */}
        {colors.length > 0 && (
          <div className="mt-3 flex gap-1.5">
            {colors.slice(0, 5).map((color) => (
              <ColorSwatch key={color} name={color} className="size-4" />
            ))}
            {colors.length > 5 && (
              <span className="text-muted-foreground text-xs leading-4">
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
