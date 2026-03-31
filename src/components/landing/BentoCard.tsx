"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  delay?: number
}

export function BentoCard({
  children,
  className,
  interactive = false,
  delay = 0,
}: BentoCardProps) {
  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-2xl bg-studio-canvas ring-1 ring-studio-charcoal/5",
        interactive &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}
