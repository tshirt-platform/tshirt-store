import { Banknote, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/lib/checkout/schema"

interface Props {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

const OPTIONS: {
  id: PaymentMethod
  title: string
  hint: string
  icon: typeof Banknote
  soon?: boolean
}[] = [
  { id: "cod", title: "Thanh toán khi nhận hàng (COD)", hint: "Trả tiền mặt cho shipper khi nhận áo", icon: Banknote },
  { id: "vnpay", title: "VNPay", hint: "Chuyển đến VNPay để thanh toán", icon: CreditCard, soon: true },
]

export function PaymentMethods({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Phương thức thanh toán" className="space-y-2">
      {OPTIONS.map(({ id, title, hint, icon: Icon, soon }) => (
        <label
          key={id}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3 text-sm",
            soon ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            value === id && !soon && "border-primary ring-1 ring-primary"
          )}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={id}
            checked={value === id}
            disabled={soon}
            onChange={() => onChange(id)}
            className="mt-1"
          />
          <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
          <span>
            <span className="block font-medium">
              {title}
              {soon && <span className="text-muted-foreground ml-2 text-xs font-normal">Sắp ra mắt</span>}
            </span>
            <span className="text-muted-foreground block text-xs">{hint}</span>
          </span>
        </label>
      ))}
    </div>
  )
}
