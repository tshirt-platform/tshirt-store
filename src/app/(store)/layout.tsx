import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
