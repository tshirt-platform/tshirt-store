import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clearDraft, readDraft, saveDraft, type DesignDraft } from "../draft"

const draft: DesignDraft = {
  designId: "11111111-2222-3333-4444-555555555555",
  sides: [
    { side: "front", jsonUrl: "https://files.example/designs/x/front.json" },
    { side: "back", jsonUrl: "https://files.example/designs/x/back.json" },
  ],
  savedAt: 1_700_000_000_000,
}

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  }
}

let storage: ReturnType<typeof fakeStorage>

beforeEach(() => {
  storage = fakeStorage()
  vi.stubGlobal("window", { localStorage: storage })
})
afterEach(() => vi.unstubAllGlobals())

describe("design draft", () => {
  it("keeps a design per product and reads it back", () => {
    expect(saveDraft("prod_1", draft)).toBe(true)
    expect(readDraft("prod_1")).toEqual(draft)
    expect(readDraft("prod_2")).toBeNull()
  })

  it("forgets it on demand", () => {
    saveDraft("prod_1", draft)
    clearDraft("prod_1")
    expect(readDraft("prod_1")).toBeNull()
  })

  it("ignores text that is not a draft", () => {
    for (const raw of ["not json", "null", "[]", '{"designId":1}', '{"designId":"a","savedAt":1,"sides":"x"}']) {
      storage.setItem("tshirt.design-draft.v1.prod_1", raw)
      expect(readDraft("prod_1")).toBeNull()
    }
  })

  it("drops malformed sides and keeps the good ones", () => {
    storage.setItem(
      "tshirt.design-draft.v1.prod_1",
      JSON.stringify({
        ...draft,
        sides: [{ side: "left", jsonUrl: "x" }, { side: "front" }, null, { side: "back", jsonUrl: "https://f/back.json" }],
      })
    )
    expect(readDraft("prod_1")?.sides).toEqual([{ side: "back", jsonUrl: "https://f/back.json" }])
  })

  it("is not a draft when no side survives", () => {
    storage.setItem("tshirt.design-draft.v1.prod_1", JSON.stringify({ ...draft, sides: [{ side: "top", jsonUrl: "x" }] }))
    expect(readDraft("prod_1")).toBeNull()
  })

  it("never throws when storage is blocked", () => {
    const blocked = () => {
      throw new Error("SecurityError")
    }
    vi.stubGlobal("window", { localStorage: { getItem: blocked, setItem: blocked, removeItem: blocked } })
    expect(readDraft("prod_1")).toBeNull()
    expect(saveDraft("prod_1", draft)).toBe(false)
    expect(() => clearDraft("prod_1")).not.toThrow()
  })
})
