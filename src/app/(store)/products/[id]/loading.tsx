import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8" role="status" aria-label="Đang tải sản phẩm">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="mt-6 h-7 w-32" />
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="size-8 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-12" />
            ))}
          </div>
          <Skeleton className="mt-6 h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
