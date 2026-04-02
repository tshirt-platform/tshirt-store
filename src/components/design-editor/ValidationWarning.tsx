"use client"

import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ValidationWarningProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  outOfBoundsCount: number
  onProceed: () => void
  onGoBack: () => void
}

export default function ValidationWarning({
  open,
  onOpenChange,
  outOfBoundsCount,
  onProceed,
  onGoBack,
}: ValidationWarningProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Cảnh báo vùng in
          </DialogTitle>
          <DialogDescription>
            Có <strong>{outOfBoundsCount}</strong> phần tử nằm ngoài vùng in.
            Các phần tử này có thể bị cắt khi in thực tế.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onGoBack}>
            Quay lại chỉnh sửa
          </Button>
          <Button variant="default" onClick={onProceed}>
            Xuất anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
