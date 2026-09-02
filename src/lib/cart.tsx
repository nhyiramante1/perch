import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { chairBySlug } from "@/data/chairs"
import { cartLineKey, isSameLine, resolveChoices, unitPriceCents } from "@/lib/pricing"
import type { CartLine, Chair } from "@/lib/types"

const KEY = "perch-cart"

/** Flat $19 delivery on campus, waived over $250. Tax is Michigan's 6%. */
export const SHIPPING_CENTS = 1900
export const FREE_SHIPPING_THRESHOLD_CENTS = 25000
export const TAX_RATE = 0.06

/** What it takes to name a line. Quantity is not part of identity. */
export type LineIdentity = Pick<CartLine, "slug" | "colorwayId" | "options">

interface CartCtx {
  lines: CartLine[]
  count: number
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  add: (slug: string, colorwayId: string, qty?: number, options?: Record<string, string>) => void
  setQty: (line: LineIdentity, qty: number) => void
  remove: (line: LineIdentity) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)

/**
 * Canonical option map for a chair: every option present, each resolved to a
 * real choice id.
 *
 * Without this, `{}` and `{armrests:"fixed"}` are different `cartLineKey`s for
 * what is the same chair at the same price — so adding the default build from
 * two places would split it into two lines. Unknown option or choice ids from
 * an older stored cart are dropped by `resolveChoices` falling back to the
 * first choice.
 */
function canonicalOptions(
  chair: Chair,
  options?: Record<string, string>,
): Record<string, string> | undefined {
  if (!chair.options?.length) return undefined
  const resolved = resolveChoices(chair, options)
  const canonical: Record<string, string> = {}
  chair.options.forEach((opt, i) => {
    const choice = resolved[i]
    if (choice) canonical[opt.id] = choice.id
  })
  return canonical
}

/**
 * Canonicalise every line and fold duplicates together.
 *
 * A cart stored before options existed has no `options` key at all. Once
 * canonicalised it becomes the default build — the same identity a freshly
 * added default is given — so the two must merge rather than sit as twin rows.
 */
function normalizeLines(lines: CartLine[]): CartLine[] {
  const byKey = new Map<string, CartLine>()
  for (const line of lines) {
    const chair = chairBySlug(line.slug)
    if (!chair) continue
    const normalized: CartLine = {
      slug: line.slug,
      colorwayId: line.colorwayId,
      qty: line.qty,
      options: canonicalOptions(chair, line.options),
    }
    const key = cartLineKey(normalized)
    const existing = byKey.get(key)
    if (existing) existing.qty += normalized.qty
    else byKey.set(key, normalized)
  }
  return [...byKey.values()]
}

function isStringMap(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === "string")
  )
}

function readStored(): CartLine[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Drop anything that no longer matches a real chair, so a catalog edit
    // cannot leave an un-priceable line sitting in somebody's cart.
    const valid = parsed.filter(
      (l): l is CartLine =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as CartLine).slug === "string" &&
        typeof (l as CartLine).qty === "number" &&
        ((l as CartLine).options === undefined || isStringMap((l as CartLine).options)) &&
        Boolean(chairBySlug((l as CartLine).slug)),
    )
    return normalizeLines(valid)
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStored)

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* storage can be unavailable in private mode; the cart still works in memory */
    }
  }, [lines])

  const add = useCallback(
    (slug: string, colorwayId: string, qty = 1, options?: Record<string, string>) => {
      const chair = chairBySlug(slug)
      if (!chair) return
      const incoming: CartLine = {
        slug,
        colorwayId,
        qty,
        options: canonicalOptions(chair, options),
      }
      setLines((prev) => {
        const i = prev.findIndex((l) => isSameLine(l, incoming))
        if (i === -1) return [...prev, incoming]
        const next = [...prev]
        next[i] = { ...next[i], qty: next[i].qty + qty }
        return next
      })
    },
    [],
  )

  const setQty = useCallback((line: LineIdentity, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !isSameLine(l, line))
        : prev.map((l) => (isSameLine(l, line) ? { ...l, qty } : l)),
    )
  }, [])

  const remove = useCallback((line: LineIdentity) => {
    setLines((prev) => prev.filter((l) => !isSameLine(l, line)))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    // Every line prices through `unitPriceCents` — the same function the order
    // snapshot uses, so the confirmation cannot disagree with the basket.
    const subtotalCents = lines.reduce((sum, l) => {
      const chair = chairBySlug(l.slug)
      return sum + (chair ? unitPriceCents(chair, l.options) * l.qty : 0)
    }, 0)
    const shippingCents =
      subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
        ? 0
        : SHIPPING_CENTS
    const taxCents = Math.round(subtotalCents * TAX_RATE)
    return {
      lines,
      count,
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents: subtotalCents + shippingCents + taxCents,
      add,
      setQty,
      remove,
      clear,
    }
  }, [lines, add, setQty, remove, clear])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}
