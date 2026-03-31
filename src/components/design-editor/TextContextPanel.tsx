"use client"

import { useEffect, useState, useCallback } from "react"
import { useDesignStore } from "@/lib/store/design.store"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { cn } from "@/lib/utils"

const FONTS = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Montserrat",
  "Lora",
  "Dancing Script",
  "Oswald",
  "Raleway",
  "Permanent Marker",
  "Bebas Neue",
]

export default function TextContextPanel() {
  const canvas = useDesignStore((s) => s.canvas)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const [selected, setSelected] = useState<fabric.IText | null>(null)
  const [fontFamily, setFontFamily] = useState("Inter")
  const [fontSize, setFontSize] = useState(32)
  const [fill, setFill] = useState("#1a1a1a")
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [textAlign, setTextAlign] = useState("left")

  const syncFromObject = useCallback((obj: fabric.IText) => {
    setFontFamily(obj.fontFamily ?? "Inter")
    setFontSize(obj.fontSize ?? 32)
    setFill((obj.fill as string) ?? "#1a1a1a")
    setIsBold(obj.fontWeight === "bold")
    setIsItalic(obj.fontStyle === "italic")
    setIsUnderline(obj.underline ?? false)
    setTextAlign(obj.textAlign ?? "left")
  }, [])

  useEffect(() => {
    if (!canvas) return

    const onSelect = () => {
      const active = canvas.getActiveObject()
      if (active && "text" in active) {
        const textObj = active as fabric.IText
        setSelected(textObj)
        syncFromObject(textObj)
      } else {
        setSelected(null)
      }
    }

    const onDeselect = () => setSelected(null)
    canvas.on("selection:created", onSelect)
    canvas.on("selection:updated", onSelect)
    canvas.on("selection:cleared", onDeselect)
    return () => {
      canvas.off("selection:created", onSelect)
      canvas.off("selection:updated", onSelect)
      canvas.off("selection:cleared", onDeselect)
    }
  }, [canvas, syncFromObject])

  const apply = useCallback(
    (props: Record<string, unknown>) => {
      if (!selected || !canvas) return
      selected.set(props)
      canvas.renderAll()
      saveSnapshot()
    },
    [selected, canvas, saveSnapshot]
  )

  if (!selected) return null

  return (
    <div className="absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 shadow-lg">
      {/* Font family */}
      <select
        value={fontFamily}
        onChange={(e) => {
          setFontFamily(e.target.value)
          apply({ fontFamily: e.target.value })
        }}
        className="h-8 rounded border border-black/10 bg-transparent px-2 text-xs"
      >
        {FONTS.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {/* Font size */}
      <input
        type="number"
        value={fontSize}
        min={8}
        max={200}
        onChange={(e) => {
          const v = Number(e.target.value)
          setFontSize(v)
          apply({ fontSize: v })
        }}
        className="h-8 w-14 rounded border border-black/10 bg-transparent px-2 text-center text-xs"
      />

      {/* Color */}
      <input
        type="color"
        value={fill}
        onChange={(e) => {
          setFill(e.target.value)
          apply({ fill: e.target.value })
        }}
        className="size-8 cursor-pointer rounded border border-black/10"
      />

      <div className="mx-1 h-5 w-px bg-black/10" />

      {/* Bold/Italic/Underline */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8", isBold && "bg-studio-charcoal text-white")}
        onClick={() => {
          const v = !isBold
          setIsBold(v)
          apply({ fontWeight: v ? "bold" : "normal" })
        }}
      >
        <Bold className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8", isItalic && "bg-studio-charcoal text-white")}
        onClick={() => {
          const v = !isItalic
          setIsItalic(v)
          apply({ fontStyle: v ? "italic" : "normal" })
        }}
      >
        <Italic className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8", isUnderline && "bg-studio-charcoal text-white")}
        onClick={() => {
          const v = !isUnderline
          setIsUnderline(v)
          apply({ underline: v })
        }}
      >
        <Underline className="size-3.5" />
      </Button>

      <div className="mx-1 h-5 w-px bg-black/10" />

      {/* Alignment */}
      {(["left", "center", "right"] as const).map((align) => {
        const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight
        return (
          <Button
            key={align}
            variant="ghost"
            size="icon"
            className={cn("size-8", textAlign === align && "bg-studio-charcoal text-white")}
            onClick={() => {
              setTextAlign(align)
              apply({ textAlign: align })
            }}
          >
            <Icon className="size-3.5" />
          </Button>
        )
      })}
    </div>
  )
}
