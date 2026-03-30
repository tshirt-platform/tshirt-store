"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const PRICING = [
  {
    name: "Áo thun",
    price: "199.000đ",
    description: "Áo thun cotton 100%, in DTG chất lượng cao",
    popular: true,
    features: [
      "Cotton 100% thoáng mát",
      "In DTG sắc nét",
      "10+ màu sắc",
      "Size S - 3XL",
      "Thiết kế 2 mặt",
    ],
    href: "/products?type=tshirt",
  },
  {
    name: "Áo polo",
    price: "299.000đ",
    description: "Áo polo cao cấp, phù hợp đồng phục công ty",
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
    description: "Hoodie nỉ bông ấm áp, in chất lượng cao",
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

export function PricingSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Bảng giá</h2>
          <p className="text-muted-foreground mt-3">
            Giá đã bao gồm in thiết kế, chưa bao gồm phí vận chuyển
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRICING.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-xl border p-6",
                plan.popular && "border-gray-900 shadow-lg"
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  Phổ biến
                </Badge>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {plan.description}
              </p>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.popular ? "default" : "outline"}
                className="mt-6"
                size="lg"
              >
                <Link href={plan.href}>Bắt đầu thiết kế</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
