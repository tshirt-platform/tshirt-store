"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const TEMPLATES = [
  { id: "tpl-01", name: "Minimalist Logo", tag: "Phổ biến", color: "bg-blue-100" },
  { id: "tpl-02", name: "Vintage Typography", tag: "Mới", color: "bg-amber-100" },
  { id: "tpl-03", name: "Abstract Art", tag: "Hot", color: "bg-rose-100" },
  { id: "tpl-04", name: "Nature Theme", tag: "Đề xuất", color: "bg-emerald-100" },
  { id: "tpl-05", name: "Retro Graphic", tag: "Mới", color: "bg-violet-100" },
  { id: "tpl-06", name: "Modern Pattern", tag: "Phổ biến", color: "bg-sky-100" },
]

export function TemplateGallery() {
  return (
    <section id="templates" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Mẫu thiết kế nổi bật</h2>
          <p className="text-muted-foreground mt-3">
            Chọn mẫu có sẵn hoặc tự tạo thiết kế của riêng bạn
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl, index) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Link
                href={`/design/prod_01?template=${tpl.id}`}
                className="group block overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
              >
                <div
                  className={`${tpl.color} flex h-52 items-center justify-center`}
                >
                  <div className="size-24 rounded-xl bg-white/60 shadow-sm" />
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="font-medium">{tpl.name}</span>
                  <Badge variant="secondary">{tpl.tag}</Badge>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/products">
              Xem tất cả
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
