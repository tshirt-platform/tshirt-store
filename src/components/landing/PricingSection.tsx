"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const PRICING = [
  {
    name: "Áo thun",
    price: "199.000đ",
    description: "Canvas cotton 100%, in DTG chất lượng cao",
    popular: true,
    features: [
      "Cotton 100% thoáng mát",
      "In DTG sắc nét",
      "10+ màu sắc",
      "Size S - 3XL",
      "Sáng tạo 2 mặt",
    ],
    href: "/products?type=tshirt",
  },
  {
    name: "Áo polo",
    price: "299.000đ",
    description: "Canvas polo cao cấp, phù hợp đồng phục sáng tạo",
    popular: false,
    features: [
      "Vải polo cao cấp",
      "In / thêu logo",
      "8+ màu sắc",
      "Size S - 3XL",
      "Cổ bẻ lịch sự",
    ],
    href: "/products?type=polo",
  },
  {
    name: "Hoodie",
    price: "399.000đ",
    description: "Canvas nỉ bông ấm áp, in chất lượng cao",
    popular: false,
    features: [
      "Nỉ bông dày dặn",
      "In DTG full color",
      "6+ màu sắc",
      "Size S - 3XL",
      "Túi kangaroo",
    ],
    href: "/products?type=hoodie",
  },
]

const WAVE_OFFSETS = [-12, 0, 12]

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        gsap.to(card, {
          y: WAVE_OFFSETS[i],
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        })
      })
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Split header */}
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-2">
          <motion.h2
            className="text-4xl font-bold leading-tight text-studio-charcoal md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Chọn canvas cho
            <br />
            tác phẩm của bạn
          </motion.h2>
          <motion.p
            className="max-w-md text-lg text-studio-charcoal/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Giá đã bao gồm in thiết kế, chưa bao gồm phí vận chuyển.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRICING.map((plan, index) => (
            <motion.div
              key={plan.name}
              ref={(el) => { cardRefs.current[index] = el }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 will-change-transform",
                plan.popular
                  ? "border-studio-charcoal bg-studio-charcoal text-white"
                  : "border-studio-charcoal/10 bg-white"
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-6 bg-studio-terracotta text-white hover:bg-studio-terracotta/90">
                  Yêu thích nhất
                </Badge>
              )}
              <h3
                className={cn(
                  "text-lg font-semibold",
                  plan.popular ? "text-white" : "text-studio-charcoal"
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm",
                  plan.popular ? "text-white/50" : "text-studio-charcoal/50"
                )}
              >
                {plan.description}
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold">{plan.price}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "flex items-center gap-2.5 text-sm",
                      plan.popular ? "text-white/70" : "text-studio-charcoal/60"
                    )}
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        plan.popular ? "text-studio-terracotta" : "text-studio-sage"
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                className={cn(
                  "mt-8",
                  plan.popular
                    ? "bg-white text-studio-charcoal hover:bg-white/90"
                    : "bg-studio-charcoal text-white hover:bg-studio-charcoal/90"
                )}
              >
                <Link href={plan.href}>
                  Bắt đầu sáng tạo
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
