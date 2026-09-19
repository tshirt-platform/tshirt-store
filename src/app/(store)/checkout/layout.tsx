import type { Metadata } from "next"

// Personal to the visitor, so not something for search engines to list
export const metadata: Metadata = {
  title: "Thanh toán",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
