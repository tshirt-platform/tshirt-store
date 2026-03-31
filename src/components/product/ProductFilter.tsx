"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const FILTERS = [
  { label: "Tất cả", value: "" },
  { label: "Áo thun", value: "tshirt" },
  { label: "Áo polo", value: "polo" },
  { label: "Hoodie", value: "hoodie" },
]

export function ProductFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeType = searchParams.get("type") ?? ""

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("type", value)
    } else {
      params.delete("type")
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilter(filter.value)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            activeType === filter.value
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
