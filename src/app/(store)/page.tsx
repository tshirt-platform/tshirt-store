import type { Metadata } from "next"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { TemplateGallery } from "@/components/landing/TemplateGallery"
import { SocialProof } from "@/components/landing/SocialProof"
import { PricingSection } from "@/components/landing/PricingSection"
import { FAQSection } from "@/components/landing/FAQSection"

export const metadata: Metadata = {
  title: "TShirt Custom — Thiết kế áo thun theo ý bạn",
  description:
    "Tự thiết kế áo thun, polo, hoodie với editor trực tuyến. In chất lượng cao, giao hàng toàn quốc.",
  openGraph: {
    title: "TShirt Custom — Thiết kế áo thun theo ý bạn",
    description:
      "Tự thiết kế áo thun, polo, hoodie với editor trực tuyến. In chất lượng cao, giao hàng toàn quốc.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <TemplateGallery />
      <SocialProof />
      <PricingSection />
      <FAQSection />
    </>
  )
}
