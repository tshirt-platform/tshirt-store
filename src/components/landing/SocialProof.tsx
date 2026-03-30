"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

const STATS = [
  { value: 5000, suffix: "+", label: "Đơn hàng đã giao" },
  { value: 200, suffix: "+", label: "Mẫu thiết kế" },
  { value: 99, suffix: "%", label: "Khách hàng hài lòng" },
]

const TESTIMONIALS = [
  {
    name: "Minh Anh",
    role: "Chủ nhóm team building",
    quote:
      "Thiết kế đồng phục cho team chưa bao giờ dễ dàng đến vậy. Chất lượng in rất tốt!",
  },
  {
    name: "Thanh Tùng",
    role: "Chủ shop online",
    quote:
      "Mình dùng để tạo sản phẩm cho shop. Giao diện thiết kế trực quan, rất dễ dùng.",
  },
  {
    name: "Hương Ly",
    role: "Sinh viên",
    quote:
      "Mua áo làm quà tặng cho bạn bè, ai cũng thích. Giá cả hợp lý nữa!",
  },
]

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
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
    <div ref={ref} className="text-4xl font-bold">
      {count.toLocaleString()}
      {suffix}
    </div>
  )
}

export function SocialProof() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="text-muted-foreground mt-1 text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={t.name}
              className="rounded-xl border bg-white p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <p className="text-muted-foreground text-sm leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
