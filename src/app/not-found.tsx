import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"
import { NotFoundView } from "@/components/common/NotFoundView"

// Addresses that match no route are answered outside the (store) layout, so it draws the page chrome itself
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NotFoundView />
      </main>
      <Footer />
    </>
  )
}
