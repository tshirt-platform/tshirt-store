"use client"

import { MotionConfig, motion } from "motion/react"

// A template remounts on every navigation, which is what makes each page fade in.
// reducedMotion="user" turns the movement off for visitors who ask their system for less of it.
export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
        {children}
      </motion.div>
    </MotionConfig>
  )
}
