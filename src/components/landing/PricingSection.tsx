"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
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

// Wave offsets: left card up, center stays, right card down
const WAVE_OFFSETS = [-15, 0, 15]

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
    <section ref={sectionRef} className="bg-studio-cream py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-studio-charcoal">
            Chọn canvas cho tác phẩm của bạn
          </h2>
          <p className="mt-3 text-studio-charcoal/60">
            Giá đã bao gồm in thiết kế, chưa bao gồm phí vận chuyển
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRICING.map((plan, index) => (
            <motion.div
              key={plan.name}
              ref={(el) => { cardRefs.current[index] = el }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 will-change-transform",
                plan.popular
                  ? "border-studio-terracotta shadow-lg"
                  : "border-studio-charcoal/10"
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-studio-terracotta text-white hover:bg-studio-terracotta/90">
                  Yêu thích nhất
                </Badge>
              )}
              <h3 className="text-lg font-semibold text-studio-charcoal">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-studio-charcoal/60">
                {plan.description}
              </p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-studio-charcoal">
                  {plan.price}
                </span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-studio-charcoal/80"
                  >
                    <Check className="size-4 text-studio-sage" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.popular ? "default" : "outline"}
                className={cn(
                  "mt-6",
                  plan.popular &&
                    "bg-studio-terracotta text-white hover:bg-studio-terracotta/90"
                )}
                size="lg"
              >
                <Link href={plan.href}>Bắt đầu sáng tạo</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
