import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    AWS_REGION: z.string().default("ap-southeast-1"),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    /** Set for S3-compatible storage such as Cloudflare R2; leave unset for AWS S3 */
    S3_ENDPOINT: z.string().url().optional(),
    S3_DESIGNS_PREFIX: z.string().default("designs/"),
    RENDER_SERVICE_URL: z.string().url().default("http://localhost:8001"),
    RENDER_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_MEDUSA_URL: z.string().url().default("http://localhost:9000"),
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_S3_BUCKET_URL: z.string().optional(),
    NEXT_PUBLIC_STORE_URL: z
      .string()
      .url()
      .default("http://localhost:3000"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_MEDUSA_URL: process.env.NEXT_PUBLIC_MEDUSA_URL,
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    NEXT_PUBLIC_S3_BUCKET_URL: process.env.NEXT_PUBLIC_S3_BUCKET_URL,
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_ENDPOINT: process.env.S3_ENDPOINT || undefined,
    S3_DESIGNS_PREFIX: process.env.S3_DESIGNS_PREFIX,
    RENDER_SERVICE_URL: process.env.RENDER_SERVICE_URL,
    RENDER_API_KEY: process.env.RENDER_API_KEY,
  },
})
