"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { motion } from "motion/react"
import { ArrowRight, Palette, Brush, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

function AnimatedCounter({
  target,
  suffix,
}: {
  target: number
  suffix: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 1500
          const start = performance.now()
          const step = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

const FEATURES = [
  {
    icon: Palette,
    title: "Chọn canvas của bạn",
    desc: "Áo thun, polo, hoodie — nhiều màu sắc và size có sẵn.",
  },
  {
    icon: Brush,
    title: "Sáng tạo tự do",
    desc: "Thêm text, hình ảnh, hoặc dùng mẫu từ bộ sưu tập.",
  },
  {
    icon: Sparkles,
    title: "Nhận kiệt tác",
    desc: "In chất lượng cao, giao hàng toàn quốc trong 3-5 ngày.",
  },
]

export function BentoShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      // Sticky image parallax
      gsap.to(imageRef.current, {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section id="showcase" ref={sectionRef} className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Split header — Webflow style */}
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-2">
          <motion.h2
            className="text-4xl font-bold leading-tight text-studio-charcoal md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Hành trình sáng tạo
            <br />
            của bạn
          </motion.h2>
          <motion.p
            className="max-w-md text-lg text-studio-charcoal/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Từ ý tưởng đến tác phẩm — chỉ trong vài phút. Mọi thứ bạn cần
            để sáng tạo đều có trong studio.
          </motion.p>
        </div>

        {/* Dark showcase grid — full width */}
        <div
          ref={imageRef}
          className="mt-16 grid grid-cols-2 gap-2 overflow-hidden rounded-2xl will-change-transform md:grid-cols-4"
        >
          {[
            { label: "Minimalist Logo", color: "bg-amber-50" },
            { label: "Vintage Typography", color: "bg-rose-50" },
            { label: "Abstract Art", color: "bg-violet-50" },
            { label: "Nature Theme", color: "bg-emerald-50" },
          ].map((tpl, i) => (
            <motion.div
              key={tpl.label}
              className={`${tpl.color} flex aspect-square items-center justify-center`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="size-16 rounded-xl bg-white/60 shadow-sm" />
            </motion.div>
          ))}
        </div>

        {/* Feature cards — 3 columns */}
        <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <f.icon className="size-6 text-studio-terracotta" />
              <h3 className="mt-4 text-xl font-semibold text-studio-charcoal">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-studio-charcoal/50">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-8 rounded-2xl bg-studio-charcoal px-10 py-10 text-white md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-3xl font-bold">
              <AnimatedCounter target={5000} suffix="+" />
            </p>
            <p className="mt-1 text-sm text-white/50">Tác phẩm đã ra đời</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-3xl font-bold">200+</p>
            <p className="mt-1 text-sm text-white/50">
              Mẫu trong bộ sưu tập
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-3xl font-bold">99%</p>
            <p className="mt-1 text-sm text-white/50">Nghệ sĩ hài lòng</p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-white text-studio-charcoal hover:bg-white/90"
          >
            <Link href="/products">
              Xem bộ sưu tập
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
