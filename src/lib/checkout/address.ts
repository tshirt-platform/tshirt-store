export interface AddressOption {
  code: string
  name: string
}

async function getList(url: string, failure: string): Promise<AddressOption[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(failure)
  const body = (await res.json()) as { items?: AddressOption[] }
  return body.items ?? []
}

export const fetchProvinces = () =>
  getList("/api/address/provinces", "Không tải được danh sách tỉnh/thành phố")

export const fetchWards = (provinceCode: string) =>
  getList(
    `/api/address/provinces/${encodeURIComponent(provinceCode)}/wards`,
    "Không tải được danh sách phường/xã"
  )
