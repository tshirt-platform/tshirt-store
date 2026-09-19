import { describe, expect, it } from "vitest"
import { deliveryWindow, deriveProgress, jobLabel, paymentStatusLabel, trackingNumbers } from "../status"

const jobs = (...statuses: string[]) => statuses.map((status) => ({ status }))

describe("deriveProgress", () => {
  it("treats an order with no print jobs yet as just placed", () => {
    expect(deriveProgress([])).toMatchObject({ step: 0, cancelled: false })
  })

  it.each([
    [["pending"], 0, "Đang xử lý đơn hàng"],
    [["proof_approved"], 0, "Đã duyệt bản in, chuẩn bị in"],
    [["processing"], 1, "Đang in áo của bạn"],
    [["shipped"], 2, "Đang giao hàng"],
    [["delivered"], 3, "Đã giao hàng"],
  ])("maps %j to step %i", (statuses, step, headline) => {
    expect(deriveProgress(jobs(...statuses))).toEqual({ step, cancelled: false, headline })
  })

  it("stays at printing until every side has shipped", () => {
    expect(deriveProgress(jobs("shipped", "processing")).step).toBe(1)
    expect(deriveProgress(jobs("shipped", "pending")).step).toBe(1)
    expect(deriveProgress(jobs("shipped", "shipped")).step).toBe(2)
  })

  it("is delivered only when every live job is, and is delivering while some are still on the way", () => {
    expect(deriveProgress(jobs("delivered", "delivered")).step).toBe(3)
    expect(deriveProgress(jobs("delivered", "shipped")).step).toBe(2)
  })

  it("ignores a cancelled side while another is live", () => {
    expect(deriveProgress(jobs("cancelled", "processing"))).toMatchObject({ step: 1, cancelled: false })
    expect(deriveProgress(jobs("cancelled", "delivered")).step).toBe(3)
  })

  it("is cancelled only when every job is", () => {
    expect(deriveProgress(jobs("cancelled", "cancelled"))).toMatchObject({ cancelled: true })
  })
})

describe("labels", () => {
  it("names every job status and falls back for an unknown one", () => {
    expect(jobLabel("processing")).toBe("Đang in")
    expect(jobLabel("cancelled")).toBe("Đã huỷ")
    expect(jobLabel("something-new")).toBe("Đang xử lý")
  })

  it("says cash is collected on delivery until it is paid", () => {
    expect(paymentStatusLabel("cod", "authorized")).toBe("Thu tiền khi giao hàng")
    expect(paymentStatusLabel("cod", "captured")).toBe("Đã thanh toán")
    expect(paymentStatusLabel("vnpay", "not_paid")).toBe("Chưa thanh toán")
  })
})

describe("trackingNumbers", () => {
  it("lists numbers of jobs on their way, once each", () => {
    expect(
      trackingNumbers([
        { status: "shipped", tracking_number: "VN123" },
        { status: "delivered", tracking_number: "VN123" },
        { status: "processing", tracking_number: "VN999" },
        { status: "shipped", tracking_number: null },
      ])
    ).toEqual(["VN123"])
  })
})

describe("deliveryWindow", () => {
  it("counts working days, skipping the weekend", () => {
    // Friday 2026-09-18: 3 working days is Wed 23, 5 is Fri 25
    const { from, to } = deliveryWindow("2026-09-18T10:00:00")
    expect(from.getDate()).toBe(23)
    expect(to.getDate()).toBe(25)
    expect(from.getDay()).toBe(3)
    expect(to.getDay()).toBe(5)
  })
})
