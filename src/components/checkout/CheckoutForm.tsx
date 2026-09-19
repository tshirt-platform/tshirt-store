"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fetchProvinces, fetchWards, type AddressOption } from "@/lib/checkout/address"
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/checkout/schema"
import { Field } from "./Field"
import { NativeSelect } from "./NativeSelect"
import { PaymentMethods } from "./PaymentMethods"

export interface SubmittedAddress {
  provinceName: string
  wardName: string
}

interface Props {
  id: string
  disabled: boolean
  onSubmit: (values: CheckoutFormValues, names: SubmittedAddress) => void
}

const message = (e: unknown) => (e instanceof Error ? e.message : "Có lỗi xảy ra")

export function CheckoutForm({ id, disabled, onSubmit }: Props) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      provinceCode: "",
      wardCode: "",
      addressLine: "",
      note: "",
      paymentMethod: "cod",
    },
  })

  const [provinces, setProvinces] = useState<AddressOption[]>([])
  const [wards, setWards] = useState<AddressOption[]>([])
  const [loadingWards, setLoadingWards] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const provinceCode = watch("provinceCode")

  useEffect(() => {
    let cancelled = false
    fetchProvinces()
      .then((list) => !cancelled && setProvinces(list))
      .catch((e: unknown) => !cancelled && setAddressError(message(e)))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setValue("wardCode", "")
    setWards([])
    if (!provinceCode) return
    let cancelled = false
    setLoadingWards(true)
    setAddressError(null)
    fetchWards(provinceCode)
      .then((list) => !cancelled && setWards(list))
      .catch((e: unknown) => !cancelled && setAddressError(message(e)))
      .finally(() => !cancelled && setLoadingWards(false))
    return () => {
      cancelled = true
    }
  }, [provinceCode, setValue])

  const submit = handleSubmit((values) => {
    const provinceName = provinces.find((p) => p.code === values.provinceCode)?.name ?? ""
    const wardName = wards.find((w) => w.code === values.wardCode)?.name ?? ""
    onSubmit(values, { provinceName, wardName })
  })

  const invalid = (name: keyof CheckoutFormValues) => (errors[name] ? true : undefined)

  return (
    <form id={id} onSubmit={submit} noValidate>
      <fieldset disabled={disabled} className="min-w-0 space-y-8">
      <section className="space-y-4">
        <h2 className="font-semibold">Thông tin giao hàng</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="fullName" label="Họ và tên" error={errors.fullName?.message}>
            <Input id="fullName" autoComplete="name" aria-invalid={invalid("fullName")} {...register("fullName")} />
          </Field>
          <Field id="phone" label="Số điện thoại" error={errors.phone?.message}>
            <Input id="phone" type="tel" inputMode="numeric" autoComplete="tel" aria-invalid={invalid("phone")} {...register("phone")} />
          </Field>
        </div>
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={invalid("email")} {...register("email")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="provinceCode" label="Tỉnh/Thành phố" error={errors.provinceCode?.message}>
            <Controller
              control={control}
              name="provinceCode"
              render={({ field }) => (
                <NativeSelect
                  id="provinceCode"
                  aria-invalid={invalid("provinceCode")}
                  disabled={provinces.length === 0}
                  {...field}
                >
                  <option value="">{provinces.length === 0 && !addressError ? "Đang tải…" : "Chọn tỉnh/thành phố"}</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </NativeSelect>
              )}
            />
          </Field>
          <Field id="wardCode" label="Phường/Xã" error={errors.wardCode?.message}>
            <Controller
              control={control}
              name="wardCode"
              render={({ field }) => (
                <NativeSelect
                  id="wardCode"
                  aria-invalid={invalid("wardCode")}
                  disabled={!provinceCode || loadingWards}
                  {...field}
                >
                  <option value="">{loadingWards ? "Đang tải…" : "Chọn phường/xã"}</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </NativeSelect>
              )}
            />
          </Field>
        </div>
        {addressError && (
          <p role="alert" className="text-xs text-red-600">
            {addressError}. Tải lại trang để thử lại.
          </p>
        )}
        <Field id="addressLine" label="Địa chỉ chi tiết" error={errors.addressLine?.message}>
          <Textarea id="addressLine" rows={2} autoComplete="street-address" placeholder="Số nhà, tên đường, tổ/khu phố…" aria-invalid={invalid("addressLine")} {...register("addressLine")} />
        </Field>
        <Field id="note" label="Ghi chú" optional error={errors.note?.message}>
          <Textarea id="note" rows={2} placeholder="Ví dụ: giao giờ hành chính" aria-invalid={invalid("note")} {...register("note")} />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Thanh toán</h2>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => <PaymentMethods value={field.value} onChange={field.onChange} />}
        />
      </section>
      </fieldset>
    </form>
  )
}
