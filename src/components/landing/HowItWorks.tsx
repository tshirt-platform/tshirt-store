"use client"

import { motion } from "motion/react"
import { Palette, MousePointerClick, Truck } from "lucide-react"

const STEPS = [
  {
    icon: Palette,
    title: "Chọn sản phẩm",
    description:
      "Chọn loại áo bạn muốn: thun, polo hay hoodie. Nhiều màu sắc và size có sẵn.",
  },
  {
    icon: MousePointerClick,
    title: "Thiết kế online",
    description:
      "Sử dụng editor trực tuyến để thêm text, hình ảnh và chọn từ hàng trăm mẫu có sẵn.",
  },
  {
    icon: Truck,
    title: "Nhận hàng",
    description:
      "Đặt hàng và nhận áo in chất lượng cao trong 3-5 ngày. Giao hàng toàn quốc.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Cách hoạt động</h2>
          <p className="text-muted-foreground mt-3">
            Chỉ 3 bước đơn giản để có áo thun theo ý bạn
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-gray-900 text-white">
                <step.icon className="size-7" />
              </div>
              <div className="text-muted-foreground mt-3 text-sm font-medium">
                Bước {index + 1}
              </div>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-2 max-w-xs text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
