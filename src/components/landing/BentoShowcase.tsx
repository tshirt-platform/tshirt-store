"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { BentoCard } from "@/components/landing/BentoCard"
import { CreativeStep, CREATIVE_STEPS } from "@/components/landing/CreativeStep"
import { GalleryCard, TEMPLATES } from "@/components/landing/GalleryCard"

function AnimatedCounter({
  target,
  suffix,
}: {
  target: number
  suffix: string
}) {
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
    <div ref={ref} className="text-4xl font-bold text-white">
      {count.toLocaleString()}
      {suffix}
    </div>
  )
}

export function BentoShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const featuredRef = useRef<HTMLDivElement>(null)
  const bottomRowRef = useRef<HTMLDivElement>(null)
  const featured = TEMPLATES[0]
  const smallTemplates = TEMPLATES.slice(1, 4)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      // Featured card — moves slower (background depth)
      gsap.to(featuredRef.current, {
        y: -25,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
      // Bottom row — moves faster (foreground depth)
      gsap.to(bottomRowRef.current, {
        y: 15,
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
    <section ref={sectionRef} className="bg-studio-cream py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-studio-charcoal">
            Hành trình sáng tạo
          </h2>
          <p className="mt-3 text-studio-charcoal/60">
            Từ ý tưởng đến tác phẩm — chỉ trong vài phút
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-3">
          {/* Featured gallery — background parallax layer */}
          <div
            ref={featuredRef}
            className="col-span-2 row-span-2 will-change-transform"
          >
            <GalleryCard template={featured} featured delay={0} />
          </div>

          {/* Creative steps — middle layer (no parallax) */}
          {CREATIVE_STEPS.map((step, i) => (
            <CreativeStep key={step.step} {...step} delay={0.1 + i * 0.08} />
          ))}

          {/* Bottom row — foreground parallax layer */}
          <div
            ref={bottomRowRef}
            className="col-span-2 grid grid-cols-2 gap-4 will-change-transform md:col-span-4 md:grid-cols-4"
          >
            {smallTemplates.map((tpl, i) => (
              <GalleryCard
                key={tpl.id}
                template={tpl}
                delay={0.3 + i * 0.08}
              />
            ))}

            {/* Stats card — dark accent */}
            <BentoCard
              delay={0.45}
              className="flex flex-col items-center justify-center bg-studio-charcoal p-6 text-center"
            >
              <AnimatedCounter target={5000} suffix="+" />
              <p className="mt-2 text-sm text-white/70">
                Tác phẩm đã ra đời
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/products">
                  Xem bộ sưu tập
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  )
}
