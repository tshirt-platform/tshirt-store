export interface DesignTemplate {
  id: string
  name: string
  category: TemplateCategory
  color: string
  fabricJson: string
}

export type TemplateCategory = "sport" | "minimal" | "vintage" | "funny" | "text"

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "sport", label: "Sport" },
  { value: "minimal", label: "Minimal" },
  { value: "vintage", label: "Vintage" },
  { value: "funny", label: "Funny" },
  { value: "text", label: "Text" },
]

// Pre-built templates as Fabric.js JSON (simplified IText objects)
function textTemplate(text: string, opts: Record<string, unknown> = {}) {
  return JSON.stringify({
    version: "7.0.0",
    objects: [
      {
        type: "IText",
        left: 200,
        top: 250,
        text,
        fontSize: 40,
        fontFamily: "Inter",
        fill: "#1a1a1a",
        originX: "center",
        originY: "center",
        textAlign: "center",
        ...opts,
      },
    ],
  })
}

export const TEMPLATES: DesignTemplate[] = [
  {
    id: "tpl-sport-1",
    name: "Team Spirit",
    category: "sport",
    color: "bg-blue-100",
    fabricJson: textTemplate("TEAM\nSPIRIT", { fontSize: 52, fontFamily: "Oswald", fill: "#2563eb" }),
  },
  {
    id: "tpl-sport-2",
    name: "Champion",
    category: "sport",
    color: "bg-red-100",
    fabricJson: textTemplate("CHAMPION\n2024", { fontSize: 48, fontFamily: "Bebas Neue", fill: "#dc2626" }),
  },
  {
    id: "tpl-minimal-1",
    name: "Clean Logo",
    category: "minimal",
    color: "bg-gray-100",
    fabricJson: textTemplate("STUDIO", { fontSize: 36, fontFamily: "Inter", fill: "#374151" }),
  },
  {
    id: "tpl-minimal-2",
    name: "Mono Type",
    category: "minimal",
    color: "bg-stone-100",
    fabricJson: textTemplate("less is\nmore", { fontSize: 32, fontFamily: "Lora", fill: "#44403c" }),
  },
  {
    id: "tpl-vintage-1",
    name: "Retro Wave",
    category: "vintage",
    color: "bg-amber-100",
    fabricJson: textTemplate("RETRO\nWAVE", { fontSize: 50, fontFamily: "Permanent Marker", fill: "#92400e" }),
  },
  {
    id: "tpl-vintage-2",
    name: "Old School",
    category: "vintage",
    color: "bg-orange-100",
    fabricJson: textTemplate("OLD\nSCHOOL", { fontSize: 46, fontFamily: "Playfair Display", fill: "#9a3412" }),
  },
  {
    id: "tpl-funny-1",
    name: "LOL",
    category: "funny",
    color: "bg-yellow-100",
    fabricJson: textTemplate("LOL 😂", { fontSize: 56, fontFamily: "Dancing Script", fill: "#ca8a04" }),
  },
  {
    id: "tpl-funny-2",
    name: "Chill Mode",
    category: "funny",
    color: "bg-green-100",
    fabricJson: textTemplate("CHILL\nMODE: ON", { fontSize: 38, fontFamily: "Raleway", fill: "#15803d" }),
  },
  {
    id: "tpl-text-1",
    name: "Bold Statement",
    category: "text",
    color: "bg-purple-100",
    fabricJson: textTemplate("BE\nYOURSELF", { fontSize: 58, fontFamily: "Montserrat", fill: "#7c3aed", fontWeight: "bold" }),
  },
  {
    id: "tpl-text-2",
    name: "Script",
    category: "text",
    color: "bg-pink-100",
    fabricJson: textTemplate("Dream Big", { fontSize: 44, fontFamily: "Dancing Script", fill: "#be185d" }),
  },
]
