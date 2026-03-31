"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap, ScrollTrigger } from "@/lib/gsap"

interface ParallaxOptions {
  speed?: number
  scrub?: number | boolean
  start?: string
  end?: string
  rotate?: number
  scale?: number
}

/**
 * Applies a scroll-linked parallax transform to a ref element.
 * Only activates on desktop (min-width: 768px).
 */
export function useParallax<T extends HTMLElement>(
  options: ParallaxOptions = {}
) {
  const ref = useRef<T>(null)
  const {
    speed = -20,
    scrub = 1,
    start = "top bottom",
    end = "bottom top",
    rotate = 0,
    scale = 1,
  } = options

  useGSAP(() => {
    const el = ref.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      gsap.to(el, {
        y: speed,
        rotate,
        scale,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub,
        },
      })
    })

    return () => mm.revert()
  }, { dependencies: [speed, scrub, start, end, rotate, scale] })

  return ref
}
