// Tests for BentoShowcase sub-components — validates data exports
// Component rendering tested via E2E browser tests

import { CREATIVE_STEPS } from "../CreativeStep"
import { TEMPLATES } from "../GalleryCard"

describe("CreativeStep data", () => {
  it("has exactly 3 creative steps", () => {
    expect(CREATIVE_STEPS).toHaveLength(3)
  })

  it("each step has required fields", () => {
    for (const step of CREATIVE_STEPS) {
      expect(step.step).toBeGreaterThan(0)
      expect(step.title).toBeTruthy()
      expect(step.description).toBeTruthy()
      expect(step.icon).toBeDefined()
    }
  })
})

describe("GalleryCard data", () => {
  it("has at least 6 templates", () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(6)
  })

  it("each template has required fields", () => {
    for (const tpl of TEMPLATES) {
      expect(tpl.id).toBeTruthy()
      expect(tpl.name).toBeTruthy()
      expect(tpl.tag).toBeTruthy()
      expect(tpl.color).toBeTruthy()
    }
  })
})
