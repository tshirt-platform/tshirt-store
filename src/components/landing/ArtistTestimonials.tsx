"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"

const TESTIMONIALS = [
  {
    name: "Minh Anh",
    role: "Họa sĩ team building",
    quote:
      "Thiết kế đồng phục cho cả team chưa bao giờ dễ dàng đến vậy. Mình cảm thấy như đang vẽ trên canvas thật.",
  },
  {
    name: "Thanh Tùng",
    role: "Nhà sáng tạo thương hiệu",
    quote:
      "Giao diện studio trực quan, sáng tạo thoải mái mà chất lượng rất chuyên nghiệp.",
  },
  {
    name: "Hương Ly",
    role: "Nghệ sĩ tự do",
    quote:
      "Mỗi chiếc áo là một tác phẩm riêng. Giá cả hợp lý, chất lượng in tuyệt vời.",
  },
]

export function ArtistTestimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      gsap.to(cardsRef.current, {
        y: -20,
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
    <section ref={sectionRef} className="relative overflow-hidden py-28">
      {/* Background image with dark overlay */}
      <Image
        src="/images/landing/dark-texture.jpg"
        alt=""
        fill
        className="object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-studio-charcoal/85" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Split header — bold heading left, featured quote right */}
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
          <motion.h2
            className="text-4xl font-bold leading-tight text-white md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Các nghệ sĩ
            <br />
            đã sáng tạo
          </motion.h2>

          {/* Featured inline testimonial — Webflow style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-lg leading-relaxed text-white/70">
              &ldquo;{TESTIMONIALS[0].quote}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-studio-terracotta text-sm font-bold text-white">
                {TESTIMONIALS[0].name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {TESTIMONIALS[0].name}
                </p>
                <p className="text-xs text-white/40">
                  {TESTIMONIALS[0].role}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Remaining testimonial cards */}
        <div
          ref={cardsRef}
          className="mt-16 grid grid-cols-1 gap-6 will-change-transform md:grid-cols-2"
        >
          {TESTIMONIALS.slice(1).map((t, i) => (
            <motion.div
              key={t.name}
              className="rounded-2xl border border-white/10 p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            >
              <p className="text-base leading-relaxed text-white/60">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
