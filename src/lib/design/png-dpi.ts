const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const METRES_PER_INCH = 0.0254

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunkType(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
}

function buildPhys(dpi: number): Uint8Array {
  const ppm = Math.round(dpi / METRES_PER_INCH)
  const chunk = new Uint8Array(21)
  const view = new DataView(chunk.buffer)
  view.setUint32(0, 9)
  chunk.set([0x70, 0x48, 0x59, 0x73], 4) // "pHYs"
  view.setUint32(8, ppm)
  view.setUint32(12, ppm)
  chunk[16] = 1 // unit: metre
  view.setUint32(17, crc32(chunk.subarray(4, 17)))
  return chunk
}

/**
 * Writes the print resolution into a PNG. Canvas exports carry no pHYs chunk, and
 * print shops read that metadata, not just the pixel count.
 */
export function setPngDpi(png: Uint8Array, dpi: number): Uint8Array<ArrayBuffer> {
  if (!PNG_SIGNATURE.every((b, i) => png[i] === b)) {
    throw new Error("Not a PNG file")
  }

  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  const parts: Uint8Array[] = [png.subarray(0, 8)]
  let offset = 8
  let inserted = false

  while (offset < png.length) {
    const length = view.getUint32(offset)
    const end = offset + 12 + length
    const type = chunkType(png, offset)

    if (type !== "pHYs") parts.push(png.subarray(offset, end))
    if (type === "IHDR" && !inserted) {
      parts.push(buildPhys(dpi))
      inserted = true
    }
    offset = end
  }
  if (!inserted) throw new Error("PNG has no IHDR chunk")

  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of parts) {
    out.set(p, at)
    at += p.length
  }
  return out
}
