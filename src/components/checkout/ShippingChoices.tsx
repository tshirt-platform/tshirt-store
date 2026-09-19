import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"
import type { ShippingChoice } from "@/lib/checkout/api"

interface Props {
  choices: ShippingChoice[]
  value: string | null
  onChange: (id: string) => void
}

export function ShippingChoices({ choices, value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Phương thức vận chuyển" className="space-y-2">
      {choices.map((c) => (
        <label
          key={c.id}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm",
            value === c.id && "border-primary ring-1 ring-primary"
          )}
        >
          <input
            type="radio"
            name="shippingOption"
            value={c.id}
            checked={value === c.id}
            onChange={() => onChange(c.id)}
            className="mt-1"
          />
          <span className="flex-1">
            <span className="block font-medium">{c.name}</span>
            {c.description && <span className="text-muted-foreground block text-xs">{c.description}</span>}
          </span>
          <span className="font-medium">{formatVND(c.amount)}</span>
        </label>
      ))}
    </div>
  )
}
