import type { MockupConfig } from "./mockup-config"

/**
 * Render a realistic mockup by compositing design onto a t-shirt
 * using displacement mapping and multiply blend.
 *
 * Layer order:
 * 1. Base photo OR white background
 * 2. Design warped by displacement map, clipped to mask
 * 3. Shadow overlay (multiply blend)
 * 4. Overlay elements (hanger, collar)
 */
export async function renderMockup(
  config: MockupConfig,
  designBlob: Blob
): Promise<Blob> {
  const { canvasSize, printArea, displacementStrength } = config

  const canvas = document.createElement("canvas")
  canvas.width = canvasSize.width
  canvas.height = canvasSize.height
  const ctx = canvas.getContext("2d")!

  // Load all images in parallel
  const [baseImg, displacementImg, shadowImg, maskImg, overlayImg, designImg] =
    await Promise.all([
      config.base ? loadImage(config.base) : null,
      loadImage(config.displacement),
      loadImage(config.shadow),
      config.mask ? loadImage(config.mask) : null,
      config.overlay ? loadImage(config.overlay) : null,
      loadImage(URL.createObjectURL(designBlob)),
    ])

  // Step 1: Draw base or white background
  if (baseImg) {
    ctx.drawImage(baseImg, 0, 0, canvasSize.width, canvasSize.height)
  } else {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
  }

  // Step 2: Render displaced design
  const designCanvas = applyDisplacement(
    designImg,
    displacementImg,
    printArea,
    canvasSize,
    displacementStrength
  )

  // Step 3: If mask exists, clip design to shirt silhouette
  if (maskImg) {
    clipToMask(designCanvas, maskImg, canvasSize)
  }

  // Step 4: Composite design onto base with multiply blend
  ctx.globalCompositeOperation = "multiply"
  ctx.drawImage(designCanvas, 0, 0)
  ctx.globalCompositeOperation = "source-over"

  // Step 5: Apply shadow overlay (multiply)
  ctx.globalCompositeOperation = "multiply"
  ctx.drawImage(shadowImg, 0, 0, canvasSize.width, canvasSize.height)
  ctx.globalCompositeOperation = "source-over"

  // Step 6: Draw overlay on top (hanger etc)
  if (overlayImg) {
    // Center the overlay horizontally at the top
    const overlayScale = canvasSize.width / overlayImg.width
    const overlayH = overlayImg.height * overlayScale
    ctx.drawImage(overlayImg, 0, 0, canvasSize.width, overlayH)
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png")
  })
}

/** Apply displacement mapping: warp the design based on a grayscale map. */
function applyDisplacement(
  design: HTMLImageElement,
  displacementMap: HTMLImageElement,
  printArea: { x: number; y: number; width: number; height: number },
  canvasSize: { width: number; height: number },
  strength: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = canvasSize.width
  canvas.height = canvasSize.height
  const ctx = canvas.getContext("2d")!

  // Draw design scaled to print area on a temp canvas
  const designCanvas = document.createElement("canvas")
  designCanvas.width = canvasSize.width
  designCanvas.height = canvasSize.height
  const designCtx = designCanvas.getContext("2d")!
  designCtx.drawImage(
    design,
    printArea.x,
    printArea.y,
    printArea.width,
    printArea.height
  )
  const designData = designCtx.getImageData(
    0,
    0,
    canvasSize.width,
    canvasSize.height
  )

  // Draw displacement map scaled to full canvas
  const dispCanvas = document.createElement("canvas")
  dispCanvas.width = canvasSize.width
  dispCanvas.height = canvasSize.height
  const dispCtx = dispCanvas.getContext("2d")!
  dispCtx.drawImage(displacementMap, 0, 0, canvasSize.width, canvasSize.height)
  const dispData = dispCtx.getImageData(
    0,
    0,
    canvasSize.width,
    canvasSize.height
  )

  // Output image data
  const outData = ctx.createImageData(canvasSize.width, canvasSize.height)

  const w = canvasSize.width
  const h = canvasSize.height

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4

      // Displacement value: 128 = no displacement, 0 = max negative, 255 = max positive
      const dispR = dispData.data[idx]
      const dx = Math.round(((dispR - 128) / 128) * strength)
      const dy = Math.round(((dispData.data[idx + 1] - 128) / 128) * strength)

      // Sample from displaced position
      const sx = Math.min(Math.max(x + dx, 0), w - 1)
      const sy = Math.min(Math.max(y + dy, 0), h - 1)
      const srcIdx = (sy * w + sx) * 4

      outData.data[idx] = designData.data[srcIdx]
      outData.data[idx + 1] = designData.data[srcIdx + 1]
      outData.data[idx + 2] = designData.data[srcIdx + 2]
      outData.data[idx + 3] = designData.data[srcIdx + 3]
    }
  }

  ctx.putImageData(outData, 0, 0)
  return canvas
}

/** Clip a canvas to the shirt mask (keep only pixels where mask is opaque/dark). */
function clipToMask(
  canvas: HTMLCanvasElement,
  mask: HTMLImageElement,
  canvasSize: { width: number; height: number }
) {
  const ctx = canvas.getContext("2d")!

  // Draw mask to temp canvas
  const maskCanvas = document.createElement("canvas")
  maskCanvas.width = canvasSize.width
  maskCanvas.height = canvasSize.height
  const maskCtx = maskCanvas.getContext("2d")!
  maskCtx.drawImage(mask, 0, 0, canvasSize.width, canvasSize.height)
  const maskData = maskCtx.getImageData(
    0,
    0,
    canvasSize.width,
    canvasSize.height
  )

  // Read current design pixels
  const designData = ctx.getImageData(
    0,
    0,
    canvasSize.width,
    canvasSize.height
  )

  // Multiply alpha by mask darkness
  for (let i = 0; i < designData.data.length; i += 4) {
    // Mask is black where shirt is → use inverse: dark = keep, light = hide
    const maskBrightness =
      (maskData.data[i] + maskData.data[i + 1] + maskData.data[i + 2]) / 3
    // Black (0) = fully visible, White (255) = fully hidden
    const maskAlpha = 1 - maskBrightness / 255
    designData.data[i + 3] = Math.round(designData.data[i + 3] * maskAlpha)
  }

  ctx.putImageData(designData, 0, 0)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load: ${src}`))
    img.src = src
  })
}
