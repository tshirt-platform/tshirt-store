"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQ_ITEMS = [
  {
    question: "Thời gian giao hàng bao lâu?",
    answer:
      "Tác phẩm tiêu chuẩn sẽ được giao trong 3-5 ngày làm việc. Đối với đơn hàng số lượng lớn (trên 50 chiếc), thời gian có thể là 7-10 ngày.",
  },
  {
    question: "Chất lượng in như thế nào?",
    answer:
      "Chúng tôi sử dụng công nghệ in DTG (Direct to Garment) và in nhiệt chuyển, đảm bảo hình ảnh sắc nét, bền màu sau nhiều lần giặt.",
  },
  {
    question: "Có thể đặt số lượng nhỏ không?",
    answer:
      "Có, bạn có thể đặt từ 1 chiếc. Không yêu cầu số lượng tối thiểu. Giá sẽ tốt hơn khi đặt số lượng lớn.",
  },
  {
    question: "Tôi có thể chỉnh sửa thiết kế sau khi đặt hàng không?",
    answer:
      "Bạn có thể chỉnh sửa tác phẩm trước khi thanh toán. Sau khi đã thanh toán và đơn hàng vào sản xuất, không thể chỉnh sửa.",
  },
  {
    question: "Chính sách đổi trả như thế nào?",
    answer:
      "Chúng tôi hỗ trợ đổi trả trong 7 ngày nếu sản phẩm bị lỗi in, sai size hoặc khác với thiết kế đã duyệt.",
  },
  {
    question: "File thiết kế cần định dạng gì?",
    answer:
      "Bạn có thể sáng tạo trực tiếp trên studio hoặc upload file PNG, JPG với độ phân giải tối thiểu 300 DPI.",
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-studio-charcoal/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-base font-medium text-studio-charcoal">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-studio-charcoal/30 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-studio-charcoal/50">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  return (
    <section id="faq" className="border-t border-studio-charcoal/5 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Left — heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-studio-charcoal md:text-5xl">
              Câu hỏi
              <br />
              thường gặp
            </h2>
          </motion.div>

          {/* Right — accordion */}
          <div>
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.question} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
