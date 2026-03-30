@AGENTS.md

# tshirt-store — Custom T-Shirt Platform (Frontend)

## Overview
Next.js 16 App Router storefront where customers design custom T-shirts using a Fabric.js canvas editor, then checkout via Medusa.js backend.

## Tech Stack
| Package | Version | Import |
|---|---|---|
| next | 16.2 | App Router + Turbopack |
| react | 19.2 | |
| typescript | 5.x strict | `noImplicitAny`, `strictNullChecks` |
| tailwindcss | 4.x | CSS-first config (no `tailwind.config.js`) |
| shadcn/ui | latest | Components in `src/components/ui/` |
| fabric | 7.2.0 | `import * as fabric from 'fabric'` (NOT `import { fabric }`) |
| zustand | 5.0.12 | `import { create } from 'zustand'` |
| @medusajs/js-sdk | 2.x | Medusa store API client |
| react-hook-form | 7.71 | Uncontrolled forms |
| zod | 4.3 | `import { z } from 'zod'` (v4 stable) |
| @hookform/resolvers | 5.2 | Bridge RHF + Zod |
| motion | 12.x | `from "motion/react"` (NOT `framer-motion`) |
| @aws-sdk/client-s3 | 3.x | S3 presigned URL |
| @t3-oss/env-nextjs | latest | Typed env vars |

## Environment Variables
All env vars MUST be accessed via `lib/env.ts` — never use `process.env.X` directly.

```ts
// lib/env.ts uses @t3-oss/env-nextjs + Zod schema
import { env } from "@/lib/env"
env.NEXT_PUBLIC_MEDUSA_URL  // ✅
process.env.NEXT_PUBLIC_MEDUSA_URL  // ❌
```

Variables:
- `NEXT_PUBLIC_MEDUSA_URL` — Medusa backend URL (default: http://localhost:9000)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` — Medusa publishable API key
- `NEXT_PUBLIC_S3_BUCKET_URL` — S3 bucket public URL for design files
- `NEXT_PUBLIC_STORE_URL` — This store's URL (default: http://localhost:3000)
- `AWS_REGION` — AWS region (default: ap-southeast-1)
- `AWS_ACCESS_KEY_ID` — AWS credentials
- `AWS_SECRET_ACCESS_KEY` — AWS credentials
- `S3_BUCKET_NAME` — S3 bucket name for design uploads
- `S3_DESIGNS_PREFIX` — S3 key prefix (default: designs/)

## Folder Structure

```
src/
├── app/
│   ├── (store)/
│   │   ├── page.tsx                      # Landing page
│   │   ├── products/page.tsx             # Product listing
│   │   ├── products/[id]/page.tsx        # Product detail
│   │   ├── design/[productId]/page.tsx   # Design editor
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── checkout/success/page.tsx
│   └── api/
│       └── upload-design/route.ts        # Presigned URL generator
├── components/
│   ├── design-editor/                    # Core feature
│   │   ├── DesignEditorRoot.tsx          # ErrorBoundary wrapper + lazy load
│   │   ├── DesignCanvas.tsx              # Fabric.js canvas
│   │   ├── ToolBar.tsx                   # Tool selection
│   │   ├── LayerPanel.tsx                # Layer management
│   │   ├── TextEditor.tsx                # Text tool options
│   │   ├── ImageUploader.tsx             # Image upload + drag/drop
│   │   ├── TemplateGallery.tsx           # Pre-made templates
│   │   └── PreviewModal.tsx              # Design preview on mockup
│   ├── product/
│   ├── checkout/
│   └── landing/
├── lib/
│   ├── env.ts                            # Typed env vars (Zod + @t3-oss)
│   ├── medusa.ts                         # Medusa SDK singleton
│   ├── s3.ts                             # S3 upload helpers
│   ├── canvas/
│   │   ├── fabric-config.ts              # Canvas init config
│   │   ├── export.ts                     # exportToPng + exportToJson
│   │   └── constraints.ts               # Print area bounds
│   └── store/
│       └── design.store.ts              # Zustand design state
└── types/
```

## Core Patterns

### Medusa SDK Usage
```ts
// lib/medusa.ts — singleton client
import Medusa from "@medusajs/js-sdk"
import { env } from "@/lib/env"

export const medusa = new Medusa({
  baseUrl: env.NEXT_PUBLIC_MEDUSA_URL,
  publishableKey: env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

### Zustand Design State
```ts
// lib/store/design.store.ts
interface DesignState {
  canvas: fabric.Canvas | null
  productId: string | null
  variantId: string | null
  side: "front" | "back"
  history: string[]          // Fabric JSON snapshots
  historyIndex: number
  activeTool: "select" | "text" | "image" | "shape"
  pngUrl: string | null
  jsonUrl: string | null
}
```
- Use Zustand for ALL design/canvas state — never `useState` for canvas data
- History: store Fabric JSON snapshots, min 20 undo steps

### S3 Presigned Upload
```ts
// Flow: Client → Next.js API Route → Generate presigned URL → Client uploads directly to S3
// 1. POST /api/upload-design → returns { presignedUrl, fileUrl }
// 2. Client PUTs PNG/JSON to presigned URL
// 3. Store fileUrl in cart line item metadata
```

### Error Handling
- Wrap design editor in `<ErrorBoundary>`
- All API route inputs validated with Zod schema
- No `fetch` in components — use lib helpers or custom hooks

## Design Editor Spec

### Canvas Constraints
- Print area is a bounded rectangle on the T-shirt mockup
- Elements outside print area trigger a warning
- Validate print area bounds before export

### Export Flow
1. Validate all elements within print area
2. Export PNG: 3000×3000px, 300 DPI
3. Export JSON: Fabric.js canvas state (for re-editing)
4. Upload both to S3 via presigned URLs
5. Store URLs in cart line item metadata:
   ```ts
   { design_png_url: string, design_json_url: string, design_side: "front" | "back" }
   ```

### Fabric.js Rules
- ALWAYS lazy import: `dynamic(() => import(...), { ssr: false })`
- Import: `import * as fabric from 'fabric'` (v7 syntax)
- Never import at top level — will crash SSR

## Coding Rules

1. TypeScript strict — no `any`, no `@ts-ignore`
2. Env vars always via `lib/env.ts`
3. No `fetch` in components — use lib helpers or custom hooks
4. Zustand for design state — no `useState` for canvas/design data
5. Zod schema for all API route input
6. `cn()` for conditional Tailwind classes — no manual string concatenation
7. Fabric.js always lazy imported
8. Validate print area before export
9. Max 200 lines per file — extract if exceeding
10. Absolute imports — `@/components/...` not `../../`
11. Comments in English only
12. Wrap design editor in `<ErrorBoundary>`

## Cross-Repo Dependencies
- `@tshirt/shared` — shared TypeScript types (DesignState, PrintShopWebhookPayload, constants)
- `tshirt-backend` — Medusa.js v2 API at `NEXT_PUBLIC_MEDUSA_URL`
- Communication via Medusa JS SDK (`@medusajs/js-sdk`)
