"use client"

import { useEffect, useState, useCallback } from "react"
import type { FabricObject } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Lock, Unlock, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LayerItem {
  id: number
  name: string
  type: string
  visible: boolean
  locked: boolean
}

export default function LayerPanel() {
  const canvas = useDesignStore((s) => s.canvas)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const [layers, setLayers] = useState<LayerItem[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)

  const refreshLayers = useCallback(() => {
    if (!canvas) return
    const objects = canvas.getObjects().filter(
      (obj) =>
        !(obj as FabricObject & { excludeFromExport?: boolean }).excludeFromExport &&
        !(obj as FabricObject & { _isMockup?: boolean })._isMockup
    )

    const items: LayerItem[] = objects
      .map((obj, i) => ({
        id: i,
        name: (obj as FabricObject & { text?: string }).text?.slice(0, 20) ?? `Layer ${i + 1}`,
        type: obj.type ?? "object",
        visible: obj.visible !== false,
        locked: !obj.selectable,
      }))
      .reverse()

    setLayers(items)

    const active = canvas.getActiveObject()
    if (active) {
      const idx = objects.indexOf(active)
      setActiveId(idx)
    } else {
      setActiveId(null)
    }
  }, [canvas])

  useEffect(() => {
    if (!canvas) return
    refreshLayers()
    canvas.on("object:added", refreshLayers)
    canvas.on("object:removed", refreshLayers)
    canvas.on("object:modified", refreshLayers)
    canvas.on("selection:created", refreshLayers)
    canvas.on("selection:updated", refreshLayers)
    canvas.on("selection:cleared", refreshLayers)
    return () => {
      canvas.off("object:added", refreshLayers)
      canvas.off("object:removed", refreshLayers)
      canvas.off("object:modified", refreshLayers)
      canvas.off("selection:created", refreshLayers)
      canvas.off("selection:updated", refreshLayers)
      canvas.off("selection:cleared", refreshLayers)
    }
  }, [canvas, refreshLayers])

  const getObject = (layerItem: LayerItem) => {
    if (!canvas) return null
    const objects = canvas.getObjects().filter(
      (obj) =>
        !(obj as FabricObject & { excludeFromExport?: boolean }).excludeFromExport &&
        !(obj as FabricObject & { _isMockup?: boolean })._isMockup
    )
    // Reverse index since layers are displayed in reverse
    return objects[layers.length - 1 - layers.indexOf(layerItem)] ?? null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-black/5 p-3 text-xs font-semibold tracking-wider text-studio-charcoal/40 uppercase">
        Layers
      </div>
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 && (
          <p className="p-4 text-xs text-studio-charcoal/30">
            Chưa có layer nào
          </p>
        )}
        {layers.map((layer) => (
          <div
            key={`${layer.id}-${layer.name}`}
            className={cn(
              "flex items-center gap-2 border-b border-black/5 px-3 py-2 text-xs cursor-pointer hover:bg-gray-50",
              activeId === layer.id && "bg-blue-50"
            )}
            onClick={() => {
              const obj = getObject(layer)
              if (obj && canvas) {
                canvas.setActiveObject(obj)
                canvas.renderAll()
              }
            }}
          >
            <span className="size-3 shrink-0 rounded-sm bg-studio-terracotta/20" />
            <span className="flex-1 truncate text-studio-charcoal">
              {layer.name}
            </span>
            <span className="text-studio-charcoal/30">{layer.type}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation()
                const obj = getObject(layer)
                if (obj && canvas) {
                  obj.set({ visible: !layer.visible })
                  canvas.renderAll()
                  refreshLayers()
                }
              }}
            >
              {layer.visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation()
                const obj = getObject(layer)
                if (obj && canvas) {
                  obj.set({ selectable: layer.locked, evented: layer.locked })
                  canvas.renderAll()
                  refreshLayers()
                }
              }}
            >
              {layer.locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-red-500"
              onClick={(e) => {
                e.stopPropagation()
                const obj = getObject(layer)
                if (obj && canvas) {
                  canvas.remove(obj)
                  canvas.renderAll()
                  saveSnapshot()
                }
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
