import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"

interface Props {
  id: string
  label: string
  error?: string
  optional?: boolean
  children: ReactNode
}

export function Field({ id, label, error, optional, children }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="text-muted-foreground font-normal"> (không bắt buộc)</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
