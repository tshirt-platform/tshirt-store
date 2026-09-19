import type { Metadata } from "next"

// Personal to the visitor, so not something for search engines to list
export const metadata: Metadata = {
  title: "Tra cứu đơn hàng",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
