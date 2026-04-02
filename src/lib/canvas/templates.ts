export interface DesignTemplate {
  id: string
  name: string
  src: string
}

export const TEMPLATES: DesignTemplate[] = Array.from({ length: 9 }, (_, i) => ({
  id: `template-${i + 1}`,
  name: `Mẫu ${i + 1}`,
  src: `/images/template/template_${i + 1}.png`,
}))
