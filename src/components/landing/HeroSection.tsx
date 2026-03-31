"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const mosaicRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      gsap.to(mosaicRef.current, {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
      gsap.to(sectionRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "70% top",
          end: "bottom top",
          scrub: 1,
        },
      })
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] overflow-hidden bg-white will-change-[opacity]"
    >
      <div className="mx-auto grid min-h-[90vh] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-0">
        {/* Left — text */}
        <div>
          <motion.span
            className="mb-6 inline-block text-sm font-medium tracking-wider text-studio-terracotta uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Studio sáng tạo
          </motion.span>

          <motion.h1
            className="text-5xl font-bold leading-[1.1] tracking-tight text-studio-charcoal md:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Ý tưởng của bạn.
            <br />
            <span className="bg-gradient-to-r from-studio-terracotta to-studio-ochre bg-clip-text text-transparent">
              Kiệt tác
            </span>{" "}
            của bạn.
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-lg leading-relaxed text-studio-charcoal/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Studio thiết kế trực tuyến với hàng trăm canvas và công cụ sáng
            tạo. Mỗi chiếc áo là một tác phẩm nghệ thuật.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              asChild
              size="lg"
              className="h-12 bg-studio-charcoal px-8 text-base text-white hover:bg-studio-charcoal/90"
            >
              <Link href="/products">
                Bắt đầu sáng tạo
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="link"
              size="lg"
              className="h-12 px-0 text-base text-studio-charcoal/60"
            >
              <Link href="#showcase">
                Khám phá thêm
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Right — image mosaic with real photos */}
        <motion.div
          ref={mosaicRef}
          className="relative will-change-transform"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-3 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
            {/* Main — paint brushes workspace */}
            <div className="relative col-span-2 row-span-2 aspect-square overflow-hidden">
              <Image
                src="/images/landing/hero-workspace.jpg"
                alt="Paint brushes on canvas"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <p className="text-2xl font-bold text-white">
                  Thiết kế tự do
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Kéo thả, sáng tạo, in ấn
                </p>
              </div>
            </div>
            {/* Top-right — ink texture */}
            <div className="relative overflow-hidden">
              <Image
                src="/images/landing/art-texture-1.jpg"
                alt="Abstract ink art"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <p className="text-center text-sm font-bold text-white">
                  200+ mẫu
                </p>
              </div>
            </div>
            {/* Bottom-right — colorful texture */}
            <div className="relative overflow-hidden">
              <Image
                src="/images/landing/art-texture-4.jpg"
                alt="Abstract paint art"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <p className="text-center text-sm font-bold text-white">
                  5000+ tác phẩm
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
