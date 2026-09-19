import { Skeleton } from "@/components/ui/skeleton"

export function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]" role="status" aria-label="Đang tải giỏ hàng">
      <ul className="space-y-3">
        {[0, 1].map((i) => (
          <li key={i} className="flex gap-4 rounded-xl border p-4">
            <Skeleton className="size-24 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="mt-4 h-8 w-28" />
            </div>
            <Skeleton className="h-5 w-20" />
          </li>
        ))}
      </ul>
      <Skeleton className="h-56 rounded-xl" />
    </div>
  )
}
