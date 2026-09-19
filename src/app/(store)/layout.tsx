import { Header } from "@/components/landing/Header"
import { FooterGate } from "@/components/landing/FooterGate"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <FooterGate />
    </>
  )
}
