import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8" role="status" aria-label="Đang tải sản phẩm">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            <Skeleton className="aspect-square rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-1.5 pt-1">
                {Array.from({ length: 4 }, (_, j) => (
                  <Skeleton key={j} className="size-5 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
