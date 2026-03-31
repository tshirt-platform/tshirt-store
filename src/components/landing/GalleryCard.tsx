"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BentoCard } from "@/components/landing/BentoCard"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  name: string
  tag: string
  color: string
}

export const TEMPLATES: Template[] = [
  { id: "tpl-01", name: "Minimalist Logo", tag: "Phổ biến", color: "bg-amber-50" },
  { id: "tpl-02", name: "Vintage Typography", tag: "Mới", color: "bg-rose-50" },
  { id: "tpl-03", name: "Abstract Art", tag: "Hot", color: "bg-violet-50" },
  { id: "tpl-04", name: "Nature Theme", tag: "Đề xuất", color: "bg-emerald-50" },
  { id: "tpl-05", name: "Retro Graphic", tag: "Mới", color: "bg-sky-50" },
  { id: "tpl-06", name: "Modern Pattern", tag: "Phổ biến", color: "bg-orange-50" },
]

interface GalleryCardProps {
  template: Template
  featured?: boolean
  delay?: number
}

export function GalleryCard({
  template,
  featured = false,
  delay = 0,
}: GalleryCardProps) {
  return (
    <BentoCard
      delay={delay}
      interactive
      className={cn(featured && "md:col-span-2 md:row-span-2")}
    >
      <Link
        href={`/design/prod_01?template=${template.id}`}
        className="group block h-full"
      >
        <div
          className={cn(
            "relative flex items-center justify-center",
            template.color,
            featured ? "h-full min-h-[280px]" : "h-44"
          )}
        >
          {/* Canvas texture overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=')] opacity-50" />

          {/* Placeholder artwork */}
          <motion.div
            className={cn(
              "rounded-xl bg-white/60 shadow-sm",
              featured ? "size-32" : "size-16"
            )}
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-studio-charcoal/0 transition-colors duration-300 group-hover:bg-studio-charcoal/40">
            <span className="flex items-center gap-2 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Sáng tạo từ mẫu này
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>

        {!featured && (
          <div className="flex items-center justify-between p-3">
            <span className="text-sm font-medium text-studio-charcoal">
              {template.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              {template.tag}
            </Badge>
          </div>
        )}

        {featured && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-studio-charcoal/80 to-transparent p-5">
            <Badge variant="secondary" className="mb-2 text-xs">
              {template.tag}
            </Badge>
            <p className="text-lg font-semibold text-white">{template.name}</p>
          </div>
        )}
      </Link>
    </BentoCard>
  )
}
