import type { AddressOption } from "./address"

const BASE = "https://provinces.open-api.vn/api/v2"
const ONE_DAY = 60 * 60 * 24

interface Unit {
  code: number
  name: string
  wards?: Unit[]
}

const toOptions = (units: Unit[]): AddressOption[] =>
  units.map((u) => ({ code: String(u.code), name: u.name }))

async function get(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: ONE_DAY } })
  if (!res.ok) throw new Error(`address source answered ${res.status}`)
  return res.json()
}

export async function loadProvinces(): Promise<AddressOption[]> {
  return toOptions((await get("/")) as Unit[])
}

export async function loadWards(provinceCode: string): Promise<AddressOption[]> {
  const province = (await get(`/p/${provinceCode}?depth=2`)) as Unit
  return toOptions(province.wards ?? [])
}
