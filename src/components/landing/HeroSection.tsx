"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

function BrushStroke() {
  return (
    <svg
      viewBox="0 0 400 40"
      fill="none"
      className="pointer-events-none absolute top-1/2 left-1/2 h-10 w-80 -translate-x-1/2 -translate-y-1/2 text-studio-terracotta/10 md:w-[500px]"
      aria-hidden="true"
    >
      <path
        d="M10 20 C80 5, 150 35, 200 18 C250 2, 320 30, 390 15"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PaintDots() {
  return (
    <div className="pointer-events-none absolute top-12 right-8 md:right-20" aria-hidden="true">
      <div className="size-4 rounded-full bg-studio-terracotta/15" />
      <div className="mt-2 ml-6 size-3 rounded-full bg-studio-ochre/20" />
      <div className="mt-1 -ml-2 size-2 rounded-full bg-studio-sage/15" />
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-studio-cream via-white to-studio-wash">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(180,100,60,0.04),transparent_60%)]" />
      <PaintDots />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block rounded-full border border-studio-terracotta/20 bg-studio-terracotta/5 px-4 py-1.5 text-sm text-studio-charcoal/70">
            Studio sáng tạo — Nơi ý tưởng thành hiện thực
          </span>
        </motion.div>

        <motion.h1
          className="relative mt-6 max-w-3xl text-4xl font-bold tracking-tight text-studio-charcoal md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Biến ý tưởng thành
          <span className="relative inline-block">
            <BrushStroke />
            <span className="relative bg-gradient-to-r from-studio-terracotta to-studio-ochre bg-clip-text text-transparent">
              {" "}kiệt tác{" "}
            </span>
          </span>
          của bạn
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-lg text-studio-charcoal/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Studio thiết kế trực tuyến với hàng trăm canvas và công cụ sáng tạo.
          Mỗi chiếc áo là một tác phẩm nghệ thuật.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            asChild
            size="lg"
            className="h-12 bg-studio-terracotta px-8 text-base text-white hover:bg-studio-terracotta/90"
          >
            <Link href="/products">
              Mở studio sáng tạo
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 border-studio-charcoal/20 px-8 text-base text-studio-charcoal hover:bg-studio-charcoal/5"
          >
            <Link href="#templates">Xem bộ sưu tập</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
