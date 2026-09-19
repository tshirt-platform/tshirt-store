import { describe, expect, it } from "vitest"
import { checkoutFormSchema, phoneSchema } from "../schema"

const valid = {
  fullName: "Nguyễn Văn A",
  phone: "0912345678",
  email: "a@example.com",
  provinceCode: "1",
  wardCode: "4",
  addressLine: "12 Phố Huế",
  paymentMethod: "cod" as const,
}

describe("phoneSchema", () => {
  it.each(["0912345678", "0287654321"])("accepts %s", (p) => {
    expect(phoneSchema.safeParse(p).success).toBe(true)
  })

  it.each(["912345678", "091234567", "09123456789", "+84912345678", "09123abc78", ""])(
    "rejects %j",
    (p) => {
      expect(phoneSchema.safeParse(p).success).toBe(false)
    }
  )

  it("trims before checking", () => {
    expect(phoneSchema.parse(" 0912345678 ")).toBe("0912345678")
  })
})

describe("checkoutFormSchema", () => {
  it("accepts a complete form and leaves the note optional", () => {
    expect(checkoutFormSchema.safeParse(valid).success).toBe(true)
    expect(checkoutFormSchema.safeParse({ ...valid, note: "Giao giờ hành chính" }).success).toBe(true)
  })

  it("reports each broken field under its own name", () => {
    const r = checkoutFormSchema.safeParse({
      ...valid,
      fullName: "A",
      email: "nope",
      provinceCode: "",
      wardCode: "",
      addressLine: "12",
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      const fields = Object.keys(r.error.flatten().fieldErrors)
      expect(fields.sort()).toEqual(["addressLine", "email", "fullName", "provinceCode", "wardCode"])
    }
  })

  it("rejects an unknown payment method and an over-long note", () => {
    expect(checkoutFormSchema.safeParse({ ...valid, paymentMethod: "paypal" }).success).toBe(false)
    expect(checkoutFormSchema.safeParse({ ...valid, note: "x".repeat(501) }).success).toBe(false)
  })
})
