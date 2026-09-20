import { toast } from "sonner"
import { useDesignStore } from "@/lib/store/design.store"
import { exportSides, type SideExport } from "./save"

/**
 * Every side that has content, exported from the canvas. Returns null while the editor is not
 * ready and an empty list for a blank design (the caller tells the customer).
 * A smaller multiplier gives a screen-sized picture instead of the 300 DPI print file.
 */
export async function collectSides(multiplier?: number): Promise<SideExport[] | null> {
  const state = useDesignStore.getState()
  const { canvas, garment } = state
  if (!canvas || !garment) return null

  state.commitSide()
  const s = useDesignStore.getState()
  const currentJson = s.side === "front" ? s.frontJson : s.backJson
  if (!currentJson) throw new Error("Editor is not ready")

  return exportSides(
    canvas,
    garment,
    { front: s.frontJson, back: s.backJson },
    { side: s.side, json: currentJson },
    multiplier
  )
}

export const EMPTY_DESIGN_MESSAGE = "Thiết kế đang trống. Hãy thêm chữ hoặc hình ảnh trước khi tiếp tục."

/** Things the customer should know before the design is printed */
export function warnAboutProblems(sides: SideExport[]): void {
  if (sides.some((x) => x.outOfBounds > 0)) {
    toast.warning("Có phần thiết kế nằm ngoài vùng in và sẽ bị cắt khi in")
  }
  if (sides.some((x) => x.lowDpiImages > 0)) {
    toast.warning("Có ảnh độ phân giải thấp, bản in có thể bị mờ")
  }
}
