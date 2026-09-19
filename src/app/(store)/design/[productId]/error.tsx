"use client"

import { RouteError } from "@/components/common/RouteError"

export default function EditorRouteError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} title="Không mở được studio thiết kế" retryLabel="Tải lại editor" />
}
