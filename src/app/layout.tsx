import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { env } from "@/lib/env"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
})

export const metadata: Metadata = {
  // Relative image and canonical addresses in every page's metadata resolve against this
  metadataBase: new URL(env.NEXT_PUBLIC_STORE_URL),
  applicationName: "TShirt Studio",
  openGraph: {
    siteName: "TShirt Studio",
    locale: "vi_VN",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  title: {
    default: "TShirt Custom — Thiết kế áo thun theo ý bạn",
    template: "%s | TShirt Custom",
  },
  description:
    "Tự thiết kế áo thun, polo, hoodie với editor trực tuyến. In chất lượng cao, giao hàng toàn quốc.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
