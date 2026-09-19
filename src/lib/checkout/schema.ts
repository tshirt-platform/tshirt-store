import { z } from "zod"

/** 10 digits starting with 0, the way customers type a Vietnamese mobile or landline number */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^0\d{9}$/, "Số điện thoại gồm 10 số, bắt đầu bằng 0")

// Since 1 July 2025 Vietnam has no district level: a ward belongs straight to a province
export const addressSchema = z.object({
  provinceCode: z.string().min(1, "Chọn tỉnh/thành phố"),
  wardCode: z.string().min(1, "Chọn phường/xã"),
  addressLine: z.string().trim().min(5, "Nhập số nhà, tên đường (ít nhất 5 ký tự)"),
})

export const PAYMENT_METHODS = ["cod", "vnpay"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const checkoutFormSchema = addressSchema.extend({
  fullName: z.string().trim().min(2, "Nhập họ và tên"),
  phone: phoneSchema,
  email: z.string().trim().email("Email chưa đúng định dạng"),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
})

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
