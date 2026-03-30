import Medusa from "@medusajs/js-sdk"
import { env } from "@/lib/env"

export const medusa = new Medusa({
  baseUrl: env.NEXT_PUBLIC_MEDUSA_URL,
  publishableKey: env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
