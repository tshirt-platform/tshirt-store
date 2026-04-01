"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type { FabricObject } from "fabric"
import { useDesignStore } from "@/lib/store/design.store"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface LayerItem {
  id: number
  name: string
  type: string
  visible: boolean
  locked: boolean
}

function getLayerName(obj: FabricObject): string {
  // Text objects: use text content
  const text = (obj as FabricObject & { text?: string }).text
  if (text) return text

  // Image objects: extract filename from src
  if (obj.type === "image") {
    const src = (obj as FabricObject & { _originalElement?: HTMLImageElement })
      ._originalElement?.src
    if (src) {
      try {
        const url = new URL(src)
        const filename = url.pathname.split("/").pop() ?? ""
        // Strip extension and return
        return filename.replace(/\.[^.]+$/, "") || "Image"
      } catch {
        // blob: URLs — use generic name
        return "Image"
      }
    }
    return "Image"
  }

  // Fallback: capitalize type
  const type = obj.type ?? "object"
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function isUserObject(obj: FabricObject): boolean {
  return (
    !(obj as FabricObject & { excludeFromExport?: boolean })
      .excludeFromExport &&
    !(obj as FabricObject & { _isMockup?: boolean })._isMockup &&
    !(obj as FabricObject & { _isPrintOverlay?: boolean })._isPrintOverlay
  )
}

export default function LayerPanel() {
  const canvas = useDesignStore((s) => s.canvas)
  const saveSnapshot = useDesignStore((s) => s.saveSnapshot)
  const [layers, setLayers] = useState<LayerItem[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const getUserObjects = useCallback(() => {
    if (!canvas) return []
    return canvas.getObjects().filter(isUserObject)
  }, [canvas])

  const refreshLayers = useCallback(() => {
    if (!canvas) return
    const objects = getUserObjects()

    // Layers displayed top-first (reversed from canvas z-order)
    const items: LayerItem[] = objects
      .map((obj, i) => ({
        id: i,
        name: getLayerName(obj),
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
  }, [canvas, getUserObjects])

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
    const objects = getUserObjects()
    return objects[layers.length - 1 - layers.indexOf(layerItem)] ?? null
  }

  // Convert visual layer index (top-first) to canvas z-order index
  const layerToCanvasIdx = (visIdx: number) => layers.length - 1 - visIdx

  const handleDrop = useCallback(
    (targetVisIdx: number) => {
      if (!canvas || dragIdx === null || dragIdx === targetVisIdx) return

      const userObjects = getUserObjects()
      const fromCanvasIdx = layerToCanvasIdx(dragIdx)
      const toCanvasIdx = layerToCanvasIdx(targetVisIdx)

      const obj = userObjects[fromCanvasIdx]
      if (!obj) return

      // Get global indices in the full canvas object array
      const allObjects = canvas.getObjects()
      const fromGlobal = allObjects.indexOf(obj)
      const targetObj = userObjects[toCanvasIdx]
      if (!targetObj) return
      const toGlobal = allObjects.indexOf(targetObj)

      // Remove and reinsert at target position
      canvas.remove(obj)
      const insertAt =
        fromGlobal < toGlobal ? toGlobal : toGlobal
      canvas.insertAt(insertAt, obj)

      canvas.renderAll()
      refreshLayers()
      saveSnapshot()
    },
    [canvas, dragIdx, getUserObjects, layers.length, refreshLayers, saveSnapshot]
  )

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
        {layers.map((layer, idx) => (
          <div
            key={`${layer.id}-${layer.name}`}
            draggable
            onDragStart={(e) => {
              setDragIdx(idx)
              e.dataTransfer.effectAllowed = "move"
              // Make drag image semi-transparent
              if (e.currentTarget instanceof HTMLElement) {
                e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
              }
            }}
            onDragEnd={() => {
              setDragIdx(null)
              setDropIdx(null)
              dragCounter.current = 0
            }}
            onDragEnter={() => {
              dragCounter.current++
              setDropIdx(idx)
            }}
            onDragLeave={() => {
              dragCounter.current--
              if (dragCounter.current === 0) {
                setDropIdx(null)
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(idx)
              setDragIdx(null)
              setDropIdx(null)
              dragCounter.current = 0
            }}
            className={cn(
              "flex items-center gap-1 border-b border-black/5 px-2 py-2 text-xs cursor-grab select-none",
              "hover:bg-gray-50 transition-colors",
              activeId === layer.id && "bg-blue-50",
              dragIdx === idx && "opacity-40",
              dropIdx === idx &&
                dragIdx !== null &&
                dragIdx !== idx &&
                "border-t-2 border-t-blue-400"
            )}
            onClick={() => {
              const obj = getObject(layer)
              if (obj && canvas) {
                canvas.setActiveObject(obj)
                canvas.renderAll()
              }
            }}
          >
            {/* Drag handle */}
            <GripVertical className="size-3 shrink-0 cursor-grab text-studio-charcoal/30" />

            <span className="flex-1 truncate text-studio-charcoal">
              {layer.name}
            </span>
            <span className="text-[10px] text-studio-charcoal/30">
              {layer.type}
            </span>

            {/* Visibility */}
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
              {layer.visible ? (
                <Eye className="size-3" />
              ) : (
                <EyeOff className="size-3" />
              )}
            </Button>

            {/* Lock */}
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
              {layer.locked ? (
                <Lock className="size-3" />
              ) : (
                <Unlock className="size-3" />
              )}
            </Button>

            {/* Delete */}
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
