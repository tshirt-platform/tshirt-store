import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "@/lib/env"

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: env.AWS_REGION,
      endpoint: env.S3_ENDPOINT,
      // Newer SDKs sign a CRC32 checksum into uploads by default, which R2 and other S3 clones reject
      requestChecksumCalculation: "WHEN_REQUIRED",
      credentials:
        env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    })
  }
  return s3Client
}

// Generate S3 key for design files: designs/{id}/{side}.{ext}
export function getDesignKey(
  id: string,
  side: "front" | "back",
  ext: "png" | "json" | "jpg"
): string {
  return `${env.S3_DESIGNS_PREFIX}${id}/${side}.${ext}`
}

// Generate a presigned URL for uploading a design file
export async function generatePresignedUrl(
  fileName: string,
  contentType: string
): Promise<{ presignedUrl: string; fileUrl: string }> {
  const client = getS3Client()
  const bucketName = env.S3_BUCKET_NAME

  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME is not configured")
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: contentType,
  })

  const presignedUrl = await getSignedUrl(client, command, {
    expiresIn: 3600,
  })

  // An AWS-shaped URL is wrong for a custom endpoint, so R2 and the like must say where files are served from
  if (env.S3_ENDPOINT && !env.NEXT_PUBLIC_S3_BUCKET_URL) {
    throw new Error("NEXT_PUBLIC_S3_BUCKET_URL is required when S3_ENDPOINT is set")
  }
  const fileUrl = env.NEXT_PUBLIC_S3_BUCKET_URL
    ? `${env.NEXT_PUBLIC_S3_BUCKET_URL}/${fileName}`
    : `https://${bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`

  return { presignedUrl, fileUrl }
}
