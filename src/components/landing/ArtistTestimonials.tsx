"use client"

import { useRef } from "react"
import { motion } from "motion/react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { BentoCard } from "@/components/landing/BentoCard"
import { cn } from "@/lib/utils"

const TESTIMONIALS = [
  {
    name: "Minh Anh",
    role: "Họa sĩ team building",
    quote:
      "Thiết kế đồng phục cho cả team chưa bao giờ dễ dàng đến vậy. Mình cảm thấy như đang vẽ trên canvas thật — chất lượng in khiến mọi người bất ngờ!",
    featured: true,
  },
  {
    name: "Thanh Tùng",
    role: "Nhà sáng tạo thương hiệu",
    quote:
      "Mình dùng để tạo merchandise cho brand. Giao diện studio trực quan, sáng tạo thoải mái mà chất lượng rất chuyên nghiệp.",
    featured: false,
  },
  {
    name: "Hương Ly",
    role: "Nghệ sĩ tự do",
    quote:
      "Mua áo làm quà tặng cho bạn bè, ai cũng thích vì mỗi chiếc là một tác phẩm riêng. Giá cả hợp lý nữa!",
    featured: false,
  },
]

function QuoteMark({
  className,
  ref,
}: {
  className?: string
  ref?: React.Ref<SVGSVGElement>
}) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-12", className)}
      aria-hidden="true"
    >
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
    </svg>
  )
}

export function ArtistTestimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const featuredRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const quoteMarkRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      // Featured card floats up slowly
      gsap.to(featuredRef.current, {
        y: -20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
      // Right column cards float down
      gsap.to(rightColRef.current, {
        y: 25,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
      // Quote mark rotates with scroll
      if (quoteMarkRef.current) {
        gsap.to(quoteMarkRef.current, {
          rotate: 8,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        })
      }
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  const featuredItem = TESTIMONIALS[0]
  const regularItems = TESTIMONIALS.slice(1)

  return (
    <section ref={sectionRef} className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-studio-charcoal">
            Các nghệ sĩ đã sáng tạo
          </h2>
          <p className="mt-3 text-studio-charcoal/60">
            Hàng ngàn người đã biến ý tưởng thành tác phẩm
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
          {/* Featured card — floats up */}
          <div
            ref={featuredRef}
            className="will-change-transform md:row-span-2"
          >
            <BentoCard delay={0} className="relative h-full p-6">
              <QuoteMark
                ref={quoteMarkRef}
                className="absolute top-4 left-5 size-16 text-studio-terracotta/15 will-change-transform"
              />
              <div className="relative flex h-full flex-col justify-between pt-8">
                <p className="text-lg leading-relaxed text-studio-charcoal/80">
                  &ldquo;{featuredItem.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <motion.div
                    className="flex size-10 items-center justify-center rounded-full bg-studio-terracotta/10 text-sm font-bold text-studio-terracotta"
                    whileInView={{ scale: [0.8, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {featuredItem.name.charAt(0)}
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-studio-charcoal">
                      {featuredItem.name}
                    </p>
                    <p className="text-xs text-studio-ochre">
                      {featuredItem.role}
                    </p>
                  </div>
                </div>
              </div>
              {/* Paint splash decoration */}
              <div className="pointer-events-none absolute right-4 bottom-4">
                <svg
                  viewBox="0 0 80 80"
                  className="size-20 text-studio-terracotta/5"
                  fill="currentColor"
                >
                  <circle cx="40" cy="40" r="30" />
                  <circle cx="60" cy="20" r="12" />
                  <circle cx="20" cy="60" r="8" />
                </svg>
              </div>
            </BentoCard>
          </div>

          {/* Right column — floats down */}
          <div
            ref={rightColRef}
            className="flex flex-col gap-4 will-change-transform"
          >
            {regularItems.map((t, index) => (
              <BentoCard
                key={t.name}
                delay={(index + 1) * 0.1}
                className="relative p-6"
              >
                <QuoteMark className="absolute top-4 left-5 size-10 text-studio-ochre/15" />
                <div className="relative flex h-full flex-col justify-between">
                  <p className="text-sm leading-relaxed text-studio-charcoal/80">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <motion.div
                      className="flex size-10 items-center justify-center rounded-full bg-studio-terracotta/10 text-sm font-bold text-studio-terracotta"
                      whileInView={{ scale: [0.8, 1] }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.3,
                        delay: 0.2 + (index + 1) * 0.1,
                      }}
                    >
                      {t.name.charAt(0)}
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-studio-charcoal">
                        {t.name}
                      </p>
                      <p className="text-xs text-studio-ochre">{t.role}</p>
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
