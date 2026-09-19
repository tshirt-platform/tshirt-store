"use client"

import { useEffect } from "react"

// Replaces the root layout when it fails, so it brings its own html and body
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global error]", error)
  }, [error])

  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "6rem 1rem" }}>
        <h1 style={{ fontSize: "1.25rem" }}>Đã có lỗi xảy ra</h1>
        <p style={{ color: "#666", margin: "0.75rem 0 1.5rem" }}>Vui lòng tải lại trang.</p>
        <button
          onClick={reset}
          style={{ background: "#1a1a1a", color: "#fff", border: 0, borderRadius: 8, padding: "0.6rem 1.2rem", cursor: "pointer" }}
        >
          Thử lại
        </button>
      </body>
    </html>
  )
}
