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
- `NEXT_PUBLIC_STORE_URL` — This store's URL (default: http://localhost:3000)

Storage credentials (`S3_*`, `AWS_*`) live in `tshirt-backend`, not here: the store uploads designs to the backend.

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

### Medusa SDK — Required Parameters
- **`region_id` is REQUIRED** for any query involving `calculated_price` (products, variants). Without it → runtime error "Missing required pricing context to calculate prices - region_id"
- Always fetch region first, then pass `region_id`:
```ts
async function getRegionId(): Promise<string> {
  const { regions } = await medusa.store.region.list({ limit: 1 })
  return (regions as Array<{ id: string }>)[0].id
}

// Then use in product queries:
const regionId = await getRegionId()
await medusa.store.product.list({ region_id: regionId, fields: "+variants.calculated_price" })
```
- The SDK automatically sends `x-publishable-api-key` header (configured via `publishableKey`)
- When testing API manually (api-tester, curl), you MUST set header `x-publishable-api-key` for `/store/*` routes

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

### Design Upload
```ts
// Flow: Client → tshirt-backend → S3/R2 (the store never sees storage credentials)
// 1. PUT {MEDUSA_URL}/store/designs/{designId}/{side}/{png|json|jpg} with the raw bytes
//    (x-publishable-api-key header) → returns { url }
// 2. Store each url in cart line item metadata
// 3. Editing from the cart reads the scene back with GET .../json on the same route,
//    so the bucket needs no CORS rules
```
Helpers: `src/lib/design/upload.ts` (`uploadDesignFile`, `fetchDesignScene`).

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
4. Upload the files to the backend (see Design Upload)
5. Store URLs in cart line item metadata:
   ```ts
   { design_png_url: string, design_json_url: string, design_side: "front" | "back" }
   ```

### Fabric.js Rules
- ALWAYS lazy import: `dynamic(() => import(...), { ssr: false })`
- Import: `import * as fabric from 'fabric'` (v7 syntax)
- Never import at top level — will crash SSR

## Next.js 16 Gotchas
- **`params` and `searchParams` are Promises** — must `await` them in page/layout components:
```ts
// ✅ Correct (Next.js 16)
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
}

// ❌ Wrong (Next.js 14/15 pattern — breaks in 16)
export default function Page({ params }: { params: { id: string } }) {}
```
- Use `<Link>` from `next/link` for navigation — not `<a>` tags (no client-side transitions with `<a>`)
- Read `node_modules/next/dist/docs/` for the latest API docs when unsure

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
- `@tshirt-platform/shared` — shared TypeScript types (DesignState, PrintShopWebhookPayload, constants)
- `tshirt-backend` — Medusa.js v2 API at `NEXT_PUBLIC_MEDUSA_URL`
- Communication via Medusa JS SDK (`@medusajs/js-sdk`)
