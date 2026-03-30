"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_50%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300">
            Thiết kế trực tuyến — Giao hàng toàn quốc
          </span>
        </motion.div>

        <motion.h1
          className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Tạo áo thun
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            {" "}
            độc đáo{" "}
          </span>
          theo ý bạn
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-lg text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Editor thiết kế mạnh mẽ, hàng trăm mẫu sẵn có. In chất lượng cao
          trên áo thun, polo, hoodie.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/products">
              Thiết kế ngay
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 border-white/20 bg-transparent px-8 text-base text-white hover:bg-white/10"
          >
            <Link href="#templates">Xem mẫu</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
