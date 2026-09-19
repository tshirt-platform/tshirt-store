"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./Footer"

/** The design editor fills the whole screen, so it has no footer under it */
export function FooterGate() {
  const pathname = usePathname()
  if (pathname?.startsWith("/design")) return null
  return <Footer />
}
