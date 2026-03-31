"use client"

import { motion } from "motion/react"
import { Palette, Brush, Sparkles, type LucideIcon } from "lucide-react"
import { BentoCard } from "@/components/landing/BentoCard"
import { cn } from "@/lib/utils"

interface CreativeStepProps {
  step: number
  title: string
  description: string
  icon: LucideIcon
  delay?: number
  wide?: boolean
}

export const CREATIVE_STEPS: Omit<CreativeStepProps, "delay">[] = [
  {
    step: 1,
    title: "Chọn canvas",
    description: "Chọn loại áo — thun, polo hay hoodie. Đó là tấm canvas của bạn.",
    icon: Palette,
    wide: false,
  },
  {
    step: 2,
    title: "Sáng tạo",
    description: "Mở studio, thêm text, hình ảnh, hoặc chọn từ bộ sưu tập có sẵn.",
    icon: Brush,
    wide: false,
  },
  {
    step: 3,
    title: "Nhận kiệt tác",
    description:
      "Đặt hàng và nhận tác phẩm in chất lượng cao trong 3-5 ngày. Giao toàn quốc.",
    icon: Sparkles,
    wide: true,
  },
]

export function CreativeStep({
  step,
  title,
  description,
  icon: Icon,
  delay = 0,
  wide = false,
}: CreativeStepProps) {
  return (
    <BentoCard
      delay={delay}
      interactive
      className={cn("relative p-6", wide && "md:col-span-2")}
    >
      <span className="text-xs font-medium text-studio-terracotta">
        Bước {step}
      </span>
      <div className={cn("mt-3", wide && "md:flex md:items-center md:gap-5")}>
        <motion.div
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-studio-terracotta/10"
          whileInView={{ rotate: [0, -3, 3, 0] }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
        >
          <Icon className="size-7 text-studio-terracotta" />
        </motion.div>
        <div className={cn(!wide && "mt-3")}>
          <h3 className="text-lg font-semibold text-studio-charcoal">
            {title}
          </h3>
          <p className="mt-1 text-sm text-studio-charcoal/60">{description}</p>
        </div>
      </div>
    </BentoCard>
  )
}
