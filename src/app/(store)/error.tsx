"use client"

import { RouteError } from "@/components/common/RouteError"

export default function StoreError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} />
}
