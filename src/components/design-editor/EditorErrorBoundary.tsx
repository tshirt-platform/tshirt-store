"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class EditorErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-xl font-semibold text-studio-charcoal">
            Đã có lỗi xảy ra với editor
          </h2>
          <p className="max-w-md text-sm text-studio-charcoal/50">
            {this.state.error?.message ?? "Unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-studio-charcoal px-4 py-2 text-sm text-white"
          >
            Tải lại trang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
