import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    RENDER_SERVICE_URL: z.string().url().default("http://localhost:8001"),
    RENDER_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_MEDUSA_URL: z.string().url().default("http://localhost:9000"),
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_STORE_URL: z
      .string()
      .url()
      .default("http://localhost:3000"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_MEDUSA_URL: process.env.NEXT_PUBLIC_MEDUSA_URL,
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL,
    RENDER_SERVICE_URL: process.env.RENDER_SERVICE_URL,
    RENDER_API_KEY: process.env.RENDER_API_KEY,
  },
})
