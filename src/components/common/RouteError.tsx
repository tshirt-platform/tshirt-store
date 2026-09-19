"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  retryLabel?: string
}

/** Fallback for a route that threw: says so, logs it, and lets the visitor try again */
export function RouteError({ error, reset, title = "Đã có lỗi xảy ra", retryLabel = "Thử lại" }: Props) {
  useEffect(() => {
    // An error-tracking service can hook in here later
    console.error("[route error]", error)
  }, [error])

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">
        Trang không tải được. Bạn thử lại nhé; nếu vẫn lỗi, hãy quay lại sau ít phút.
      </p>
      <Button onClick={reset}>{retryLabel}</Button>
    </div>
  )
}
