import type { TrackedJob } from "./api"

export const PROGRESS_STEPS = ["Đã đặt hàng", "Đang in", "Đang giao", "Đã nhận"] as const

export interface Progress {
  /** Index into PROGRESS_STEPS of the step the order is at */
  step: number
  cancelled: boolean
  /** One line saying where the order is */
  headline: string
}

/**
 * Where an order stands, from the state of its print jobs. Cancelled jobs are ignored
 * while others are live, and only when every job is cancelled is the order cancelled.
 * An order with no jobs yet has just been placed.
 */
export function deriveProgress(jobs: Pick<TrackedJob, "status">[]): Progress {
  if (jobs.length === 0) return { step: 0, cancelled: false, headline: "Đơn hàng đã được ghi nhận" }

  const live = jobs.filter((j) => j.status !== "cancelled")
  if (live.length === 0) return { step: 0, cancelled: true, headline: "Đơn hàng đã bị huỷ" }

  const all = (...statuses: string[]) => live.every((j) => statuses.includes(j.status))
  const some = (...statuses: string[]) => live.some((j) => statuses.includes(j.status))

  if (all("delivered")) return { step: 3, cancelled: false, headline: "Đã giao hàng" }
  if (all("shipped", "delivered")) return { step: 2, cancelled: false, headline: "Đang giao hàng" }
  if (some("processing", "shipped", "delivered")) return { step: 1, cancelled: false, headline: "Đang in áo của bạn" }
  if (some("proof_approved")) return { step: 0, cancelled: false, headline: "Đã duyệt bản in, chuẩn bị in" }
  return { step: 0, cancelled: false, headline: "Đang xử lý đơn hàng" }
}

const JOB_LABELS: Record<string, string> = {
  pending: "Đang xử lý",
  proof_approved: "Đã duyệt bản in",
  processing: "Đang in",
  shipped: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã huỷ",
}

export const jobLabel = (status: string): string => JOB_LABELS[status] ?? "Đang xử lý"

/** Tracking numbers of jobs that are on their way, without repeats */
export function trackingNumbers(jobs: Pick<TrackedJob, "status" | "tracking_number">[]): string[] {
  const numbers = jobs
    .filter((j) => j.tracking_number && (j.status === "shipped" || j.status === "delivered"))
    .map((j) => j.tracking_number as string)
  return [...new Set(numbers)]
}

function addWorkingDays(from: Date, days: number): Date {
  const d = new Date(from)
  let left = days
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) left -= 1
  }
  return d
}

/** The "3-5 working days" promise as a date range counted from the order date */
export function deliveryWindow(orderedAt: string): { from: Date; to: Date } {
  const start = new Date(orderedAt)
  return { from: addWorkingDays(start, 3), to: addWorkingDays(start, 5) }
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = { cod: "Thanh toán khi nhận hàng (COD)" }

export function paymentStatusLabel(method: string, status: string): string {
  if (status === "captured" || status === "completed") return "Đã thanh toán"
  return method === "cod" ? "Thu tiền khi giao hàng" : "Chưa thanh toán"
}
