/** Browsers report a failed network call as a TypeError with one of these messages */
const NETWORK_MESSAGES = /failed to fetch|networkerror|load failed|network request failed/i

export function isNetworkError(e: unknown): boolean {
  return e instanceof TypeError && NETWORK_MESSAGES.test(e.message)
}

/** A message a customer can act on: no raw "Failed to fetch", and a fallback when there is nothing useful */
export function friendlyError(e: unknown, fallback: string): string {
  if (isNetworkError(e)) return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại."
  return e instanceof Error && e.message ? e.message : fallback
}
