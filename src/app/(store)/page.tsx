import type { Metadata } from "next"
import { HeroSection } from "@/components/landing/HeroSection"
import { BentoShowcase } from "@/components/landing/BentoShowcase"
import { ArtistTestimonials } from "@/components/landing/ArtistTestimonials"
import { PricingSection } from "@/components/landing/PricingSection"
import { FAQSection } from "@/components/landing/FAQSection"

export const metadata: Metadata = {
  title: "TShirt Studio — Biến ý tưởng thành kiệt tác",
  description:
    "Studio thiết kế áo thun trực tuyến. Biến ý tưởng thành tác phẩm nghệ thuật trên áo thun, polo, hoodie.",
  openGraph: {
    title: "TShirt Studio — Biến ý tưởng thành kiệt tác",
    description:
      "Studio thiết kế áo thun trực tuyến. Biến ý tưởng thành tác phẩm nghệ thuật trên áo thun, polo, hoodie.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BentoShowcase />
      <ArtistTestimonials />
      <PricingSection />
      <FAQSection />
    </>
  )
}
