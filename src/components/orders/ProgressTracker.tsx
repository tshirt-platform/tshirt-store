import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PROGRESS_STEPS, type Progress } from "@/lib/orders/status"

/** Four steps: across on a wide screen, down on a phone */
export function ProgressTracker({ progress }: { progress: Progress }) {
  const { step, cancelled } = progress

  return (
    <div>
      <ol className="flex flex-col gap-4 md:flex-row md:gap-0" aria-label="Tiến trình đơn hàng">
        {PROGRESS_STEPS.map((label, i) => {
          const done = !cancelled && i < step
          const current = !cancelled && i === step
          const failed = cancelled && i === 0
          return (
            <li
              key={label}
              aria-current={current ? "step" : undefined}
              className="flex items-center gap-3 md:flex-1 md:flex-col md:gap-2 md:text-center"
            >
              <div className="flex items-center md:w-full">
                <span
                  className={cn(
                    "hidden h-0.5 flex-1 md:block",
                    i === 0 ? "invisible" : i <= step && !cancelled ? "bg-green-500" : "bg-border"
                  )}
                />
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    done && "border-green-500 bg-green-500 text-white",
                    current && "border-studio-charcoal bg-studio-charcoal text-white",
                    failed && "border-red-500 bg-red-500 text-white",
                    !done && !current && !failed && "border-border text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden /> : failed ? <X className="size-4" aria-hidden /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden h-0.5 flex-1 md:block",
                    i === PROGRESS_STEPS.length - 1 ? "invisible" : i < step && !cancelled ? "bg-green-500" : "bg-border"
                  )}
                />
              </div>
              <span className={cn("text-sm", (done || current) && "font-medium", failed && "font-medium text-red-600")}>
                {label}
              </span>
            </li>
          )
        })}
      </ol>
      <p
        role="status"
        className={cn("mt-4 text-sm font-medium", cancelled ? "text-red-600" : "text-studio-charcoal")}
      >
        {progress.headline}
      </p>
      {cancelled && (
        <p className="text-muted-foreground mt-1 text-sm">
          Nếu bạn không yêu cầu huỷ, vui lòng liên hệ cửa hàng để được hỗ trợ.
        </p>
      )}
    </div>
  )
}
