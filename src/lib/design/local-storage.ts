import path from "node:path"
import { isValidStorageKey } from "./storage-keys"

export const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), ".local-uploads")

/** Local disk stands in for S3 during development only */
export function localStorageEnabled(): boolean {
  return process.env.NODE_ENV !== "production"
}

/** Maps a storage key to a file inside the upload root, or null if it is not a plain key */
export function resolveLocalPath(key: string): string | null {
  if (!isValidStorageKey(key)) return null
  const resolved = path.resolve(LOCAL_UPLOAD_ROOT, key)
  return resolved.startsWith(LOCAL_UPLOAD_ROOT + path.sep) ? resolved : null
}
