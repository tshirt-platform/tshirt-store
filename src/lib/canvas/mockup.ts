import type { DesignSide } from "@tshirt/shared"
import type { Canvas } from "fabric"
import { CANVAS_SIZE } from "./constraints"

const MOCKUP_IMAGES: Record<DesignSide, string> = {
  front: "/images/design-editor/front-unline.png",
  back: "/images/design-editor/back-unline.png",
}

export async function loadMockup(
  canvas: Canvas,
  side: DesignSide = "front"
) {
  const fabric = await import("fabric")
  const url = MOCKUP_IMAGES[side]

  const img = await fabric.FabricImage.fromURL(url)

  // Scale image to fit canvas while maintaining aspect ratio
  const scale = Math.min(
    CANVAS_SIZE.width / (img.width ?? 1),
    CANVAS_SIZE.height / (img.height ?? 1)
  )
  img.scale(scale)

  // Center on canvas
  img.set({
    left: (CANVAS_SIZE.width - img.getScaledWidth()) / 2,
    top: (CANVAS_SIZE.height - img.getScaledHeight()) / 2,
    originX: "left",
    originY: "top",
  })

  canvas.backgroundImage = img
  canvas.renderAll()
}
