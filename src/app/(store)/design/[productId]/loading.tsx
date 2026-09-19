import { Loader2 } from "lucide-react"

export default function EditorLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-3" role="status">
      <Loader2 className="text-studio-charcoal/50 size-7 animate-spin" aria-hidden />
      <p className="text-studio-charcoal/50 text-sm">Đang tải studio sáng tạo...</p>
    </div>
  )
}
