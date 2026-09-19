"use client"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { DEFAULT_SIZE_CHART, type SizeChartRow } from "@tshirt-platform/shared"
import { Ruler } from "lucide-react"

export const SIZE_DATA = DEFAULT_SIZE_CHART

export function SizeChart({ rows = SIZE_DATA }: { rows?: SizeChartRow[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline">
          <Ruler className="size-3.5" />
          Bảng size
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96 overflow-y-auto">
        <SheetTitle>Bảng size</SheetTitle>
        <p className="text-muted-foreground mt-1 text-sm">
          Đơn vị: cm. Sai số ±2cm.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">Vai</th>
                <th className="pb-2 font-medium">Ngực</th>
                <th className="pb-2 font-medium">Dài</th>
                <th className="pb-2 font-medium">Phù hợp</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.size} className="border-b last:border-0">
                  <td className="py-2.5 font-medium">{row.size}</td>
                  <td className="py-2.5">{row.shoulder}</td>
                  <td className="py-2.5">{row.chest}</td>
                  <td className="py-2.5">{row.length}</td>
                  <td className="text-muted-foreground py-2.5">{row.fit ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SheetContent>
    </Sheet>
  )
}
